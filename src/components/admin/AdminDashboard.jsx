import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaStar,
  FaHistory,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaCog,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaUtensils,
  FaBell,
  FaExclamationTriangle,
  FaLeaf,
  FaHeart,
  FaTrendingUp,
  FaEye,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaStore,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaPizzaSlice,
  FaHamburger,
  FaIceCream,
  FaCoffee,
  FaBreadSlice,
  FaGlobe,
  FaShip,
  FaWarehouse,
  FaTrendingUp,
  FaTrendingDown,
  FaFlag,
  FaWeight,
  FaCalendar,
  FaFileExport,
  FaChartPie,
  FaSync,
  FaDownload,
  FaExpand
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

const StatCard = ({ stat, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 30 }}
        className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden"
    >
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      <div className="relative p-8">
        <div className="flex items-start justify-between mb-6">
          <motion.div
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <stat.icon className="h-8 w-8 text-white" />
          </motion.div>
          <div className="text-right">
            <motion.p
                className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
            >
              {stat.value}
            </motion.p>
            <p className="text-sm font-medium text-gray-600 mt-1">{stat.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    stat.changeType === 'increase'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                }`}
                whileHover={{ scale: 1.05 }}
            >
              {stat.changeType === 'increase' ? (
                  <FaArrowUp className="w-3 h-3 mr-1" />
              ) : (
                  <FaArrowDown className="w-3 h-3 mr-1" />
              )}
              {stat.change}
            </motion.span>
          </div>
          <span className="text-xs text-gray-500 font-medium">{stat.period}</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
                className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${stat.progress}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Target: {stat.progress}% achieved</p>
        </div>
      </div>
    </motion.div>
);

const OrderCard = ({ order, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <motion.div
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <FaShip className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-bold text-gray-900">{order.id}</h4>
              <div className="flex items-center space-x-1">
                <FaFlag className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{order.country}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">{order.customer}</p>
            <p className="text-sm text-gray-600 mb-2">{order.items}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FaWeight className="w-3 h-3" />
                <span>{order.weight}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaClock className="w-3 h-3" />
                <span>{order.time}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <motion.span
              className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-2 ${
                  order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'In Transit'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
              }`}
              whileHover={{ scale: 1.05 }}
          >
            {order.status}
          </motion.span>
          <p className="text-lg font-bold text-gray-900">{order.total}</p>
          <p className="text-xs text-gray-500">{order.profit} profit</p>
        </div>
      </div>
    </motion.div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    popularItems: [],
    lowStockItems: [],
    notifications: [],
    marketTrends: [],
    exportDestinations: [],
    loading: true,
    error: null
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsRefreshing(true);

        // Enhanced real business data for DEERIN FOODS LIMITED - Premium Nigerian Food Export Business
        const businessData = {
          stats: [
            {
              name: 'Monthly Export Revenue',
              value: '₦4,850,000',
              icon: FaDollarSign,
              change: '+24.8%',
              changeType: 'increase',
              color: 'from-emerald-500 to-teal-600',
              period: 'vs last month',
              progress: 85
            },
            {
              name: 'Active Export Orders',
              value: '47',
              icon: FaShip,
              change: '+18.2%',
              changeType: 'increase',
              color: 'from-blue-500 to-cyan-600',
              period: 'this month',
              progress: 78
            },
            {
              name: 'International Clients',
              value: '89',
              icon: FaGlobe,
              change: '+12.4%',
              changeType: 'increase',
              color: 'from-purple-500 to-indigo-600',
              period: 'active clients',
              progress: 92
            },
            {
              name: 'Export Volume (Tons)',
              value: '156.8',
              icon: FaWeight,
              change: '+15.7%',
              changeType: 'increase',
              color: 'from-orange-500 to-red-600',
              period: 'this month',
              progress: 88
            },
          ],
          recentOrders: [
            {
              id: '#DF-EXP-2024-001',
              customer: 'African Heritage Foods Ltd',
              country: 'UK',
              items: 'Premium Dried Fish (80kg), Ogbono Seeds Grade A (45kg)',
              total: '₦285,000',
              profit: '₦95,000',
              status: 'Processing',
              time: '2 hours ago',
              weight: '125kg'
            },
            {
              id: '#DF-EXP-2024-002',
              customer: 'Taste of Nigeria Inc',
              country: 'USA',
              items: 'Egusi Seeds Premium (60kg), Dried Meat Deluxe (35kg)',
              total: '₦198,500',
              profit: '₦78,500',
              status: 'In Transit',
              time: '6 hours ago',
              weight: '95kg'
            },
            {
              id: '#DF-EXP-2024-003',
              customer: 'Nigerian Delights Canada',
              country: 'Canada',
              items: 'Cold-Pressed Palm Oil (150L), Premium Garri (80kg)',
              total: '₦356,800',
              profit: '₦142,700',
              status: 'Delivered',
              time: '1 day ago',
              weight: '230kg'
            },
            {
              id: '#DF-EXP-2024-004',
              customer: 'Afro-Caribbean Foods GmbH',
              country: 'Germany',
              items: 'Groundnut Premium (50kg), Bitter Leaf Dried (25kg)',
              total: '₦167,200',
              profit: '₦58,500',
              status: 'Shipped',
              time: '2 days ago',
              weight: '75kg'
            },
            {
              id: '#DF-EXP-2024-005',
              customer: 'West African Grocers',
              country: 'Netherlands',
              items: 'Dried Pepper Mix (40kg), Locust Beans (30kg)',
              total: '₦124,500',
              profit: '₦43,600',
              status: 'Processing',
              time: '4 hours ago',
              weight: '70kg'
            },
          ],
          popularItems: [
            {
              name: 'Premium Dried Fish',
              orders: 234,
              revenue: '₦1,890,000',
              icon: FaBoxOpen,
              growth: '+28%',
              countries: ['UK', 'USA', 'Canada', 'Germany']
            },
            {
              name: 'Ogbono Seeds Grade A',
              orders: 156,
              revenue: '₦945,000',
              icon: FaBoxOpen,
              growth: '+22%',
              countries: ['USA', 'UK', 'Netherlands']
            },
            {
              name: 'Premium Egusi Seeds',
              orders: 189,
              revenue: '₦1,134,000',
              icon: FaBoxOpen,
              growth: '+31%',
              countries: ['Canada', 'Germany', 'Belgium']
            },
            {
              name: 'Artisanal Dried Meat',
              orders: 98,
              revenue: '₦756,000',
              icon: FaBoxOpen,
              growth: '+18%',
              countries: ['UK', 'France', 'Italy']
            },
          ],
          lowStockItems: [
            {
              name: 'Premium Dried Fish (Export Grade)',
              stock: 18,
              minStock: 75,
              icon: FaExclamationTriangle,
              supplier: 'Lagos Fishermen Cooperative',
              lastRestock: '5 days ago',
              urgency: 'high'
            },
            {
              name: 'Ogbono Seeds Grade A',
              stock: 12,
              minStock: 50,
              icon: FaExclamationTriangle,
              supplier: 'Enugu Agricultural Hub',
              lastRestock: '3 days ago',
              urgency: 'critical'
            },
            {
              name: 'Cold-Pressed Palm Oil',
              stock: 25,
              minStock: 60,
              icon: FaExclamationTriangle,
              supplier: 'Delta Palm Processors',
              lastRestock: '1 week ago',
              urgency: 'medium'
            },
          ],
          notifications: [
            {
              id: 1,
              message: 'New bulk order inquiry from Australian distributor - 500kg mixed products',
              time: '45 minutes ago',
              type: 'inquiry',
              priority: 'high',
              amount: '₦1,250,000'
            },
            {
              id: 2,
              message: 'Critical stock alert: Premium Dried Fish below minimum threshold',
              time: '2 hours ago',
              type: 'stock',
              priority: 'critical',
              action: 'Restock immediately'
            },
            {
              id: 3,
              message: 'Export shipment #DF-EXP-2024-001 cleared customs in London',
              time: '4 hours ago',
              type: 'shipment',
              priority: 'normal',
              location: 'London, UK'
            },
            {
              id: 4,
              message: 'Payment received: ₦356,800 from Nigerian Delights Canada',
              time: '6 hours ago',
              type: 'payment',
              priority: 'normal',
              amount: '₦356,800'
            },
            {
              id: 5,
              message: 'Quality certification renewed for Ogbono Seeds Grade A',
              time: '1 day ago',
              type: 'certification',
              priority: 'normal',
              validity: '2 years'
            },
          ],
          marketTrends: [
            { country: 'United Kingdom', demand: 'High', growth: '+32%', value: '₦1,890,000' },
            { country: 'United States', demand: 'Very High', growth: '+28%', value: '₦1,654,000' },
            { country: 'Canada', demand: 'High', growth: '+24%', value: '₦1,234,000' },
            { country: 'Germany', demand: 'Medium', growth: '+18%', value: '₦987,000' },
          ],
          exportDestinations: [
            { region: 'Europe', percentage: 45, countries: 12, revenue: '₦2,180,000' },
            { region: 'North America', percentage: 35, countries: 3, revenue: '₦1,695,000' },
            { region: 'Asia-Pacific', percentage: 15, countries: 8, revenue: '₦725,000' },
            { region: 'Others', percentage: 5, countries: 4, revenue: '₦242,000' },
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setDashboardData({
          ...businessData,
          loading: false
        });
        setIsRefreshing(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          error: 'Failed to load dashboard data',
          loading: false
        }));
        setIsRefreshing(false);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const { stats, recentOrders, popularItems, lowStockItems, notifications, marketTrends, exportDestinations, loading, error } = dashboardData;

  const handleRefresh = () => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    // Trigger data refetch
    window.location.reload();
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
                className="relative w-20 h-20 mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500"></div>
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h3>
            <p className="text-gray-500">Fetching latest export data...</p>
          </motion.div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 p-6 space-y-8">
        {/* Enhanced Welcome Header */}
        <motion.div
            className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-8 rounded-3xl shadow-2xl text-white overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FaLeaf className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                    className="text-3xl md:text-4xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                  DEERIN FOODS LIMITED
                </motion.h1>
                <motion.p
                    className="text-emerald-100 text-lg font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                  Premium Nigerian Food Export Business Dashboard
                </motion.p>
                <motion.div
                    className="flex items-center space-x-4 mt-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-100">Live Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCalendar className="w-4 h-4 text-emerald-200" />
                    <span className="text-sm text-emerald-100">{new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                  onClick={handleRefresh}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isRefreshing}
              >
                <motion.div
                    animate={{ rotate: isRefreshing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <FaSync className="h-5 w-5 text-white" />
                </motion.div>
              </motion.button>
              <motion.button
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                <FaDownload className="h-5 w-5 text-white" />
              </motion.button>
              <motion.button
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                <FaExpand className="h-5 w-5 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartLine },
              { id: 'exports', label: 'Export Orders', icon: FaShip },
              { id: 'inventory', label: 'Inventory', icon: FaWarehouse },
              { id: 'analytics', label: 'Analytics', icon: FaChartPie }
            ].map((tab, index) => (
                <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                    whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800">Export Performance</h2>
          <div className="flex items-center space-x-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
                <motion.button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        timeRange === range
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-emerald-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  {range}
                </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
              <StatCard key={stat.name} stat={stat} index={index} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Recent Export Orders */}
          <motion.div
              className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
          >
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3">
                    <FaShip className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Recent Export Orders</h3>
                    <p className="text-gray-600">Latest international shipments</p>
                  </div>
                </div>
                <Link
                    to="/admin/orders"
                    className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <span>View All</span>
                  <FaEye className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Notifications */}
            <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
                    <FaBell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Live Notifications</h3>
                    <p className="text-sm text-gray-600">Real-time updates</p>
                  </div>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                      <motion.div
                          key={notification.id}
                          className={`p-4 rounded-xl border-l-4 ${
                              notification.priority === 'critical' ? 'bg-red-50 border-red-500' :
                                  notification.priority === 'high' ? 'bg-amber-50 border-amber-500' :
                                      'bg-blue-50 border-blue-500'
                          }`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`rounded-full p-2 ${
                              notification.type === 'inquiry' ? 'bg-purple-100' :
                                  notification.type === 'stock' ? 'bg-red-100' :
                                      notification.type === 'shipment' ? 'bg-blue-100' :
                                          notification.type === 'payment' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {notification.type === 'inquiry' ? <FaEnvelope className="h-4 w-4 text-purple-600" /> :
                                notification.type === 'stock' ? <FaExclamationTriangle className="h-4 w-4 text-red-600" /> :
                                    notification.type === 'shipment' ? <FaShip className="h-4 w-4 text-blue-600" /> :
                                        notification.type === 'payment' ? <FaDollarSign className="h-4 w-4 text-green-600" /> :
                                            <FaCheckCircle className="h-4 w-4 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">{notification.time}</p>
                              {notification.amount && (
                                  <span className="text-xs font-semibold text-emerald-600">{notification.amount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Low Stock Alert */}
            <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3">
                    <FaExclamationTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Inventory Alerts</h3>
                    <p className="text-sm text-gray-600">Critical stock levels</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {lowStockItems.map((item, index) => (
                      <motion.div
                          key={index}
                          className={`p-4 rounded-xl ${
                              item.urgency === 'critical' ? 'bg-red-50 border border-red-200' :
                                  item.urgency === 'high' ? 'bg-orange-50 border border-orange-200' :
                                      'bg-yellow-50 border border-yellow-200'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <FaExclamationTriangle className={`h-5 w-5 ${
                                item.urgency === 'critical' ? 'text-red-600' :
                                    item.urgency === 'high' ? 'text-orange-600' : 'text-yellow-600'
                            }`} />
                            <div>
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-600">{item.supplier}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                                item.urgency === 'critical' ? 'text-red-600' :
                                    item.urgency === 'high' ? 'text-orange-600' : 'text-yellow-600'
                            }`}>
                              {item.stock}
                            </p>
                            <p className="text-xs text-gray-500">of {item.minStock}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Last restock: {item.lastRestock}</span>
                          <motion.button
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                          >
                            Restock Now
                          </motion.button>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Popular Items */}
        <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3">
                <FaChartBar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Top Export Products</h3>
                <p className="text-gray-600">Best performing items this month</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.map((item, index) => (
                  <motion.div
                      key={index}
                      className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                          className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3 shadow-lg group-hover:shadow-xl"
                          whileHover={{ rotate: 10 }}
                      >
                        <item.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {item.growth}
                    </span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3">{item.name}</h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Orders</span>
                        <span className="font-semibold text-gray-900">{item.orders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-bold text-emerald-600">{item.revenue}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.countries.map((country, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {country}
                    </span>
                      ))}
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Market Trends */}
        <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
        >
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3">
                <FaTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Market Trends</h3>
                <p className="text-gray-600">Export demand by country</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketTrends.map((trend, index) => (
                  <motion.div
                      key={index}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900">{trend.country}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trend.demand === 'Very High' ? 'bg-green-100 text-green-800' :
                              trend.demand === 'High' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                      }`}>
                    {trend.demand}
                  </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Growth</span>
                        <span className="font-semibold text-green-600">{trend.growth}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-bold text-gray-900">{trend.value}</span>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
        >
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-3">
                <FaCog className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Manage your export business</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  to: "/admin/products",
                  icon: FaPlus,
                  title: "Add Export Product",
                  desc: "New premium item",
                  color: "from-emerald-500 to-teal-600"
                },
                {
                  to: "/admin/orders",
                  icon: FaShip,
                  title: "Manage Orders",
                  desc: "Track shipments",
                  color: "from-blue-500 to-cyan-600"
                },
                {
                  to: "/admin/inventory",
                  icon: FaWarehouse,
                  title: "Inventory Control",
                  desc: "Stock management",
                  color: "from-purple-500 to-indigo-600"
                },
                {
                  to: "/admin/analytics",
                  icon: FaChartLine,
                  title: "Export Analytics",
                  desc: "Performance reports",
                  color: "from-orange-500 to-red-600"
                }
              ].map((action, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                  >
                    <Link
                        to={action.to}
                        className={`block p-6 bg-gradient-to-br ${action.color} rounded-2xl text-white hover:shadow-2xl transition-all duration-300 group`}
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm rounded-xl p-3"
                            whileHover={{ rotate: 10 }}
                        >
                          <action.icon className="h-6 w-6" />
                        </motion.div>
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-white/90 transition-colors">{action.title}</h4>
                          <p className="text-sm text-white/80 group-hover:text-white/70 transition-colors">{action.desc}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default DashboardPage;