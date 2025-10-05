const https = require('https');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Verify Paystack payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Verify payment with Paystack
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const verifyRequest = https.request(options, verifyResponse => {
      let data = '';

      verifyResponse.on('data', chunk => {
        data += chunk;
      });

      verifyResponse.on('end', async () => {
        try {
          const response = JSON.parse(data);
          
          if (!response.status) {
            return res.status(400).json({ 
              success: false, 
              message: response.message || 'Payment verification failed' 
            });
          }

          const { status, amount, reference: paymentRef, customer } = response.data;
          
          if (status !== 'success') {
            return res.status(400).json({ 
              success: false, 
              message: 'Payment not successful' 
            });
          }

          // Find and update the order
          const order = await Order.findOne({ paymentReference: paymentRef });
          
          if (!order) {
            return res.status(404).json({ 
              success: false, 
              message: 'Order not found' 
            });
          }

          // Update order status
          order.paymentStatus = 'paid';
          order.status = 'processing';
          order.paymentDetails = {
            method: 'paystack',
            reference: paymentRef,
            amount: amount / 100, // Convert from kobo to Naira
            paidAt: new Date(),
            channel: response.data.channel || 'card'
          };
          
          await order.save();

          // Create notification for admin
          await Notification.create({
            type: 'payment_received',
            message: `Payment received for Order #${order.orderNumber}`,
            orderId: order._id,
            user: order.user
          });

          // Emit real-time notification
          if (req.app.get('io')) {
            req.app.get('io').emit('order_updated', order);
          }

          res.json({ 
            success: true, 
            message: 'Payment verified successfully',
            order
          });

        } catch (error) {
          console.error('Error processing payment verification:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error processing payment verification' 
          });
        }
      });
    });

    verifyRequest.on('error', (error) => {
      console.error('Paystack API error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error connecting to payment processor' 
      });
    });

    verifyRequest.end();

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during payment verification' 
    });
  }
};

// @desc    Handle Paystack webhook
// @route   POST /api/payments/webhook/paystack
// @access  Public (called by Paystack)
const paystackWebhook = async (req, res) => {
  try {
    // Verify the event is from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const { reference, amount, customer } = data;
      
      // Find and update the order
      const order = await Order.findOne({ paymentReference: reference });
      
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.paymentDetails = {
          method: 'paystack',
          reference,
          amount: amount / 100, // Convert from kobo to Naira
          paidAt: new Date(),
          channel: data.channel || 'card'
        };
        
        await order.save();

        // Create notification for admin
        await Notification.create({
          type: 'payment_received',
          message: `Payment received for Order #${order.orderNumber}`,
          orderId: order._id,
          user: order.user
        });

        // Emit real-time notification
        if (req.app.get('io')) {
          req.app.get('io').emit('order_updated', order);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ message: 'Webhook processing failed' });
  }
};

// @desc    Upload payment proof
// @route   POST /api/payments/upload-proof
// @access  Private
const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.files || !req.files.proof) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const proofFile = req.files.proof;
    const filePath = `uploads/payments/${order._id}-${Date.now()}-${proofFile.name}`;
    
    // Save file (implementation depends on your file storage)
    await proofFile.mv(`./${filePath}`);

    // Update order with proof
    order.paymentProof = filePath;
    order.paymentStatus = 'pending_verification';
    await order.save();

    // Notify admin
    await Notification.create({
      type: 'payment_received',
      message: `Payment proof uploaded for Order #${order.orderNumber}`,
      orderId: order._id,
      user: req.user.id
    });

    res.json({ 
      success: true, 
      message: 'Payment proof uploaded successfully',
      filePath 
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyPayment,
  paystackWebhook,
  uploadPaymentProof
};
