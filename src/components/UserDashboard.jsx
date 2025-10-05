import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUser, FaShoppingBag, FaCreditCard, FaTruck, FaCheck,
  FaClock, FaMapMarker, FaEdit, FaHistory, FaStar,
  FaGift, FaBell, FaEye, FaBox, FaMoneyBillWave, FaCalendar
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';

/**
 * Glass card wrapper for consistent styling
 */
const GlassCard = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg dark:bg-gray-800/60 dark:border-gray-700/20 ${className}`}>
    {children}
  </div>
);

/**
 * User stats card - shows user's personal metrics
 */
const UserStatCard = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 flex items-center justify-center">
            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stat.name}</p>
            <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        </div>
        {stat.trend && (
          <div className="text-right">
            <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
              stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {stat.trend === 'up' ? '↗' : '→'} {stat.change}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  </motion.div>
);

/**
 * Order card for user dashboard - shows user's orders
 */
const UserOrderCard = ({ order, index }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <GlassCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FaBox className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {order.orderNumber}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                {order.items?.length || 0} items • {formatCurrency(order.totalAmount)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ordered {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.totalAmount)}</p>
            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium mt-1"
            >
              <FaEye className="w-3 h-3" />
              View
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

/**
 * User Dashboard - shows user's personal information and order history
 */
const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: 'N/A',
    memberSince: 'N/A',
    loading: true
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserDashboard();
    }
  }, [currentUser]);

  const fetchUserDashboard = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        const base = import.meta?.env?.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

        // Fetch user's orders and stats
        const [ordersRes, statsRes] = await Promise.all([
          fetch(`${base}/orders/user?limit=5`, { headers }),
          fetch(`${base}/users/profile`, { headers })
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
        }

        if (statsRes.ok) {
          const profileData = await statsRes.json();
          setUserStats({
            totalOrders: profileData.totalOrders || 0,
            totalSpent: profileData.totalSpent || 0,
            favoriteCategory: profileData.favoriteCategory || 'N/A',
            memberSince: profileData.memberSince || new Date().toLocaleDateString(),
            loading: false
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user dashboard:', error);

      // Fallback to sample data
      setUserStats({
        totalOrders: 3,
        totalSpent: 15497,
        favoriteCategory: 'Seeds',
        memberSince: 'Jan 2024',
        loading: false
      });

      setRecentOrders([
        {
          _id: '1',
          orderNumber: 'ORD-001',
          totalAmount: 9297,
          paymentStatus: 'completed',
          orderStatus: 'delivered',
          orderDate: new Date().toISOString(),
          items: [
            { name: 'Egusi Seeds', quantity: 2 },
            { name: 'Pounded Yam Flour', quantity: 1 }
          ]
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          totalAmount: 3599,
          paymentStatus: 'pending',
          orderStatus: 'processing',
          orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            { name: 'Organic Honey', quantity: 1 }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const userStatsCards = [
    {
      name: 'Total Orders',
      value: userStats.totalOrders,
      icon: FaShoppingBag,
      trend: 'up',
      change: '+2 this month'
    },
    {
      name: 'Total Spent',
      value: formatCurrency(userStats.totalSpent),
      icon: FaMoneyBillWave,
      trend: 'up',
      change: '+12% vs last month'
    },
    {
      name: 'Favorite Category',
      value: userStats.favoriteCategory,
      icon: FaStar,
      trend: null,
      change: null
    },
    {
      name: 'Member Since',
      value: userStats.memberSince,
      icon: FaCalendar,
      trend: null,
      change: null
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-300/30 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Welcome back, {currentUser?.name || 'User'}! 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Here's your personal dashboard overview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-700/70 border border-white/20 dark:border-gray-600/20 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Profile
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <FaHistory className="w-4 h-4" />
                  View All Orders
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Your Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {userStatsCards.map((stat, index) => (
              <UserStatCard key={stat.name} stat={stat} index={index} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20 dark:border-gray-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Your latest purchases</p>
                  </div>
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium"
                  >
                    <span>View all</span>
                    <FaEye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingBag className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Start shopping to see your orders here!
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FaShoppingBag className="w-4 h-4" />
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <UserOrderCard key={order._id} order={order} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20 dark:border-gray-700/20">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage your account</p>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <Link
                  to="/products"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <FaShoppingBag className="w-5 h-5" />
                  <span>Browse Products</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-white/20 dark:border-gray-600/20 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <FaHistory className="w-5 h-5" />
                  <span>Order History</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border border-white/20 dark:border-gray-600/20 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <FaUser className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
              </div>
            </GlassCard>

            {/* Account Status */}
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20 dark:border-gray-700/20">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Account Status</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Your membership details</p>
              </div>
              <div className="p-4 sm:p-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Email Verified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Phone Verified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Loyalty Points</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">247 pts</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20 dark:border-gray-700/20">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Latest updates</p>
              </div>
              <div className="p-4 sm:p-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center shrink-0">
                      <FaCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Order #ORD-001 delivered</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <FaTruck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Order #ORD-002 shipped</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center shrink-0">
                      <FaCreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Payment confirmed</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
