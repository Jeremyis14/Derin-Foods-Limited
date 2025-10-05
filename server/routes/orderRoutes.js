import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private or Guest
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      guestEmail,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Verify products and calculate prices
    const items = [];
    let calculatedItemsPrice = 0;
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
      }
      
      const itemTotal = product.price * item.quantity;
      calculatedItemsPrice += itemTotal;
      
      items.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image,
        weight: product.weight,
      });
    }
    
    // Calculate shipping (example: free shipping over $50, otherwise $10)
    const calculatedShippingPrice = calculatedItemsPrice > 50 ? 0 : 10;
    const calculatedTotalPrice = calculatedItemsPrice + calculatedShippingPrice;
    
    // Verify calculated prices match provided prices
    if (
      calculatedItemsPrice !== itemsPrice ||
      calculatedShippingPrice !== shippingPrice ||
      calculatedTotalPrice !== totalPrice
    ) {
      res.status(400);
      throw new Error('Order totals do not match');
    }

    // Create order
    const order = new Order({
      orderItems: items,
      user: req.user ? req.user._id : null,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: calculatedShippingPrice,
      totalPrice: calculatedTotalPrice,
      guestEmail: !req.user ? guestEmail : null,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  })
);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private or Guest (with token)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name image');

    if (order) {
      // Check if user is authorized to view this order
      const isAuthorized = 
        (req.user && (req.user._id.toString() === order.user?._id?.toString() || req.user.isAdmin)) ||
        (!req.user && order.guestEmail === req.query.guestEmail);
      
      if (isAuthorized) {
        res.json(order);
      } else {
        res.status(401);
        throw new Error('Not authorized to view this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  })
);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin or Payment Webhook
router.put(
  '/:id/pay',
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  })
);

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put(
  '/:id/deliver',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  })
);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get(
  '/myorders',
  protect,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  })
);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    
    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'id name')
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  })
);

export default router;
