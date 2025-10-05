require('dotenv').config();
import 'dotenv/config';
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { auth, adminAuth } = require('./middleware/auth');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
const Notification = require('./models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

console.log('Environment variables:', process.env.MONGO_URI ? 'MONGO_URI exists' : 'MONGO_URI is missing');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Import new routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', auth, adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders routes
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = req.user.role === 'admin' 
      ? await Order.find()
      : await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && String(order.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingMethod, note, paymentMethod = 'card', paymentReference } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Validate payment method
    if (!['card', 'bank_transfer', 'pay_on_delivery'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Validate shipping method
    if (!['pickup', 'standard', 'express'].includes(shippingMethod)) {
      return res.status(400).json({ error: 'Invalid shipping method' });
    }

    const order = new Order({
      userId: req.user.id,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        image: item.image
      })),
      totalAmount,
      paymentMethod,
      shippingMethod,
      note: note || '',
      status: paymentMethod === 'card' ? 'pending_payment' : 'pending',
      paymentStatus: 'pending',
      paymentReference: paymentReference || undefined
    });

    await order.save();

    // Create notification for admin
    const notification = new Notification({
      type: 'new_order',
      orderId: order._id,
      userId: req.user.id,
      message: `New order #${order._id.toString().substr(-6).toUpperCase()} received`,
      metadata: {
        orderTotal: order.totalAmount,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
    await notification.save();

    // In a real app, you might want to send an email/real-time notification here
    console.log(`New order created: ${order._id}`);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

app.post('/api/orders/:orderId/payment-proof', auth, upload.single('proof'), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    order.paymentProof = `/uploads/${req.file.filename}`;
    // Mark as awaiting admin approval
    order.paymentStatus = 'pending_verification';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/paystack/verify', auth, async (req, res) => {
  try {
    const { reference, orderId } = req.body || {};
    if (!reference || !orderId) return res.status(400).json({ error: 'Missing reference or orderId' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && String(order.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!PAYSTACK_SECRET_KEY) return res.status(500).json({ error: 'Server payment config missing' });

    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();
    if (!data?.status || data?.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Mark as paid and update rewards
    order.status = 'payment_verified';
    order.paymentStatus = 'paid';
    await order.save();

    const user = await User.findById(order.userId);
    if (user) {
      user.totalPurchases += Number(order.totalAmount || 0);
      if (user.totalPurchases >= 1000000) user.rewardTier = 'diamond';
      else if (user.totalPurchases >= 500000) user.rewardTier = 'platinum';
      else if (user.totalPurchases >= 100000) user.rewardTier = 'gold';
      else if (user.totalPurchases >= 50000) user.rewardTier = 'silver';
      await user.save();
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:orderId/verify-payment', auth, adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'payment_verified';
    await order.save();

    const user = await User.findById(order.userId);
    if (user) {
      user.totalPurchases += order.totalAmount;
      if (user.totalPurchases >= 1000000) user.rewardTier = 'diamond';
      else if (user.totalPurchases >= 500000) user.rewardTier = 'platinum';
      else if (user.totalPurchases >= 100000) user.rewardTier = 'gold';
      else if (user.totalPurchases >= 50000) user.rewardTier = 'silver';
      await user.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Current user profile (for rewards/tier badge)
app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notification endpoints
app.get('/api/notifications', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 10, unread } = req.query;
    const query = {};
    
    if (unread === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('orderId', 'totalAmount status');
      
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', auth, adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      code: err.code
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      success: false,
      message: err.message || 'An error occurred',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});