import express from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to format change percentage
const formatChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const rounded = Math.round(change * 10) / 10; // 1 decimal
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
};

// GET /api/dashboard/stats
// Admin only: aggregated dashboard metrics
router.get(
  '/stats',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfThisPeriod = new Date(now);
    startOfThisPeriod.setMonth(startOfThisPeriod.getMonth() - 1);

    const startOfPrevPeriod = new Date(startOfThisPeriod);
    startOfPrevPeriod.setMonth(startOfPrevPeriod.getMonth() - 1);

    // Orders aggregation
    const [paidRevenueAggThis, paidRevenueAggPrev, ordersCountThis, ordersCountPrev] = await Promise.all([
      Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: startOfThisPeriod } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([
        { $match: { isPaid: true, createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfThisPeriod } }),
      Order.countDocuments({ createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod } }),
    ]);

    const totalRevenue = paidRevenueAggThis[0]?.total || 0;
    const prevRevenue = paidRevenueAggPrev[0]?.total || 0;

    const totalOrders = await Order.countDocuments({});

    // Users
    const [totalUsers, usersThis, usersPrev] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: startOfThisPeriod } }),
      User.countDocuments({ createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod } }),
    ]);

    // Conversion (rough proxy): paid orders vs active users in period
    const paidOrdersThis = await Order.countDocuments({ isPaid: true, createdAt: { $gte: startOfThisPeriod } });
    const paidOrdersPrev = await Order.countDocuments({ isPaid: true, createdAt: { $gte: startOfPrevPeriod, $lt: startOfThisPeriod } });

    const conversionRate = Math.min(100, Math.round(((usersThis || 1) ? (paidOrdersThis / usersThis) * 100 : 0) * 10) / 10);

    // Top products by quantity sold (last 30 days)
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfThisPeriod } } },
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', totalQty: { $sum: '$orderItems.quantity' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          id: '$product._id',
          name: '$product.name',
          image: '$product.image',
          category: '$product.category',
          totalQty: 1,
        },
      },
    ]);

    // Additional counts
    const [activeProducts, pendingOrdersCount] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: { $in: ['pending', 'processing'] } }),
    ]);

    res.json({
      totalRevenue,
      revenueChange: formatChange(totalRevenue, prevRevenue),
      totalOrders,
      ordersChange: formatChange(ordersCountThis, ordersCountPrev),
      activeUsers: totalUsers,
      usersChange: formatChange(usersThis, usersPrev),
      conversionRate,
      conversionChange: formatChange(paidOrdersThis, paidOrdersPrev),
      topProducts,
      totalProducts: activeProducts,
      pendingOrders: pendingOrdersCount,
    });
  })
);

// GET /api/dashboard/recent-orders
// Admin only: most recent orders (limited fields)
router.get(
  '/recent-orders',
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 50);
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('totalPrice status createdAt isPaid user')
      .populate({ path: 'user', select: 'name email' })
      .lean();

    const result = orders.map((o) => ({
      id: o._id,
      user: o.user?.name || o.user?.email || 'Guest',
      amount: o.totalPrice,
      status: o.isPaid ? 'paid' : o.status,
      date: o.createdAt,
    }));

    res.json(result);
  })
);

export default router;
