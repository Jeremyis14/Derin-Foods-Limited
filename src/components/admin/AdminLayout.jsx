import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaBox,
  FaShoppingCart,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaTachometerAlt,
  FaSun,
  FaMoon,
  FaUsers,
  FaChartLine,
  FaTags,
  FaUserShield,
  FaLeaf,
  FaTruck,
  FaSearch,
  FaChevronDown,
  FaGlobe,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminNotifications from './AdminNotifications';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ to, icon, children, isActive = false, onClick = () => {}, count = null, badge = null }) => (
    <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
          to={to}
          onClick={onClick}
          className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-xl mx-3 mb-1 transition-all duration-300 ${
              isActive
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 transform scale-[1.02]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-emerald-500/10 backdrop-blur-sm'
          }`}
      >
      <span className={`mr-4 transition-all duration-300 ${
          isActive ? 'text-white scale-110' : 'text-emerald-300 group-hover:text-emerald-100 group-hover:scale-105'
      }`}>
        {icon}
      </span>
        <span className="flex-1 font-medium">{children}</span>

        {count !== null && (
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`ml-2 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-emerald-500/20 text-emerald-200 group-hover:bg-emerald-400/30'
                }`}
            >
              {count}
            </motion.span>
        )}

        {badge && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}

        {isActive && (
            <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
        )}
      </Link>
    </motion.div>
);

const AdminLayout = () => {
  const { currentUser, logout, isAdmin: isAdminCheck, isAdminFunc, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      console.log('Auth state changed - AdminLayout:', {
        hasUser: !!currentUser,
        userRole: currentUser?.role,
        isAdmin: isAdminFunc(),
        loading,
        currentPath: location.pathname
      });

      if (!loading) {
        setIsCheckingAuth(false);
        if (!currentUser) {
          console.log('No current user, redirecting to login');
          navigate('/login', { state: { from: location.pathname } });
        } else if (!isAdminFunc()) {
          console.log('User is not admin, redirecting to home');
          navigate('/');
        } else {
          console.log('User is admin, allowing access to:', location.pathname);
        }
      }
    };

    checkAdmin();
  }, [currentUser, loading, navigate, location.pathname, isAdminFunc]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced loading screen
  if (loading || isCheckingAuth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-slate-900 dark:to-emerald-900">
          <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
                className="relative w-20 h-20 mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-500"></div>
            </motion.div>
            <motion.h3
                className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading Admin Panel
            </motion.h3>
            <p className="text-gray-500 dark:text-gray-400">Please wait...</p>
          </motion.div>
        </div>
    );
  }

  const isAdmin = isAdminFunc();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Remove mock counts (will be populated from real data later)
  const productsCount = null;
  const pendingOrders = null;
  const totalCustomers = null;
  const categoriesCount = null;

  if (!isAdmin) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900 p-4">
          <motion.div
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-red-200 dark:border-red-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserShield className="text-2xl text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <motion.button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
              Return to Home
            </motion.button>
          </motion.div>
        </div>
    );
  }

  const getPageTitle = () => {
    const titles = {
      '/admin/dashboard': 'Export Dashboard',
      '/admin/products': 'Export Products',
      '/admin/orders': 'Export Orders',
      '/admin/customers': 'International Clients',
      '/admin/categories': 'Product Categories',
      '/admin/reports': 'Export Reports',
      '/admin/settings': 'Business Settings'
    };
    return titles[location.pathname] || 'Admin Panel';
  };

  return (
      <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-emerald-900 overflow-hidden">
        {/* Enhanced Mobile Header */}
        <motion.header
            className="lg:hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-gray-800 dark:via-slate-800 dark:to-emerald-800 shadow-xl z-30"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <motion.button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-white p-2.5 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                <motion.div
                    animate={{ rotate: isSidebarOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                  {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                </motion.div>
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-emerald-100">DEERIN FOODS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AdminNotifications />
              <motion.button
                  onClick={toggleTheme}
                  className="text-emerald-100 hover:text-white p-2.5 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle theme"
              >
                <motion.div
                    animate={{ rotate: darkMode ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                  {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Enhanced Sidebar Backdrop */}
        <AnimatePresence>
          {isSidebarOpen && isMobile && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
              />
          )}
        </AnimatePresence>

        {/* Enhanced Sidebar */}
        <motion.aside
            initial={{ x: isMobile ? '-100%' : 0 }}
            animate={{ x: isSidebarOpen ? 0 : (isMobile ? '-100%' : 0) }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:relative inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-emerald-900 via-teal-900 to-green-900 dark:from-gray-900 dark:via-slate-900 dark:to-emerald-900 shadow-2xl transform transition-all duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          <div className="flex flex-col h-full backdrop-blur-xl bg-black/10">
            {/* Enhanced Header */}
            <motion.div
                className="flex items-center justify-between h-20 px-6 border-b border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <motion.div
                    className="bg-gradient-to-br from-emerald-400 via-teal-400 to-green-400 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-xl shadow-emerald-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FaLeaf className="text-white text-xl" />
                </motion.div>
                <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  DEERIN FOODS
                </span>
                  <p className="text-xs text-emerald-200 font-medium">Export Business</p>
                </div>
              </div>
              <motion.button
                  className="lg:hidden text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  onClick={() => setIsSidebarOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close sidebar"
              >
                <FaTimes className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Enhanced User Profile */}
            <motion.div
                className="flex items-center p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-xl"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                </motion.div>
                <motion.span
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-3 border-emerald-900 shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {currentUser?.email?.split('@')[0] || 'Admin User'}
                </p>
                <p className="text-xs text-emerald-200 font-medium">Administrator</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-emerald-300">Online</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-2 scrollbar-thin scrollbar-thumb-emerald-700 scrollbar-track-transparent">
              <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, staggerChildren: 0.1 }}
              >
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <NavItem
                      to="/admin/dashboard"
                      icon={<FaTachometerAlt className="w-5 h-5" />}
                      isActive={isActive('/admin/dashboard')}
                      onClick={handleNavClick}
                  >
                    Dashboard
                  </NavItem>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <NavItem
                      to="/admin/products"
                      icon={<FaBox className="w-5 h-5" />}
                      isActive={location.pathname.startsWith('/admin/products')}
                      onClick={handleNavClick}
                      count={productsCount}
                  >
                    Export Products
                  </NavItem>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <NavItem
                      to="/admin/orders"
                      icon={<FaTruck className="w-5 h-5" />}
                      isActive={isActive('/admin/orders')}
                      onClick={handleNavClick}
                      count={pendingOrders}
                      badge={pendingOrders > 0}
                  >
                    Export Orders
                  </NavItem>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <NavItem
                      to="/admin/customers"
                      icon={<FaGlobe className="w-5 h-5" />}
                      isActive={isActive('/admin/customers')}
                      onClick={handleNavClick}
                      count={totalCustomers}
                  >
                    International Clients
                  </NavItem>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <NavItem
                      to="/admin/categories"
                      icon={<FaTags className="w-5 h-5" />}
                      isActive={isActive('/admin/categories')}
                      onClick={handleNavClick}
                      count={categoriesCount}
                  >
                    Product Categories
                  </NavItem>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <NavItem
                      to="/admin/reports"
                      icon={<FaChartLine className="w-5 h-5" />}
                      isActive={isActive('/admin/reports')}
                      onClick={handleNavClick}
                  >
                    Export Reports
                  </NavItem>
                </motion.div>
              </motion.div>

              {/* Enhanced Bottom Section */}
              <motion.div
                  className="mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
              >
                <NavItem
                    to="/admin/settings"
                    icon={<FaCog className="w-5 h-5" />}
                    isActive={isActive('/admin/settings')}
                    onClick={handleNavClick}
                >
                  Settings
                </NavItem>

                <motion.button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white rounded-xl mx-3 mb-1 transition-all duration-300 group"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                      animate={{ rotate: darkMode ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="mr-4 text-emerald-300 group-hover:text-emerald-100 group-hover:scale-105 transition-all duration-300"
                  >
                    {darkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                  </motion.span>
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </motion.button>
              </motion.div>
            </nav>
          </div>
        </motion.aside>

        {/* Enhanced Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Top Navigation */}
          <motion.header
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg z-10 border-b border-emerald-100/50 dark:border-emerald-900/50"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between h-18 px-4 sm:px-6">
              <div className="flex items-center space-x-4">
                <motion.button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden lg:flex p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-300 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle sidebar"
                >
                  <FaBars className="w-5 h-5" />
                </motion.button>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Welcome back, {currentUser?.email?.split('@')[0] || 'Admin'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Enhanced Search */}
                <motion.div
                    className="hidden sm:block relative"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                  <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search anything..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48 lg:w-64 px-4 py-2.5 pl-11 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                    <FaSearch className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    {searchQuery && (
                        <motion.button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                        >
                          <FaTimes className="w-3 h-3" />
                        </motion.button>
                    )}
                  </div>
                </motion.div>

                <div className="flex items-center space-x-2">
                  {/* Fullscreen Toggle */}
                  <motion.button
                      onClick={toggleFullscreen}
                      className="hidden md:flex p-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-600 dark:text-gray-300 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                  </motion.button>

                  <AdminNotifications />

                  {/* Enhanced User Menu */}
                  <div className="relative">
                    <motion.button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                      <div className="hidden md:block text-right">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {currentUser?.email?.split('@')[0] || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                      </div>
                      <div className="relative">
                        <motion.div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                        </motion.div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></span>
                      </div>
                      <motion.div
                          animate={{ rotate: showUserMenu ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                      >
                        <FaChevronDown className="w-3 h-3 text-gray-400" />
                      </motion.div>
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                          <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                          >
                            <div className="p-2">
                              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <FaUserShield className="w-4 h-4 mr-3" />
                                Profile Settings
                              </button>
                              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <FaCog className="w-4 h-4 mr-3" />
                                Preferences
                              </button>
                              <hr className="my-2 border-gray-200 dark:border-gray-700" />
                              <button
                                  onClick={handleLogout}
                                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <FaSignOutAlt className="w-4 h-4 mr-3" />
                                Sign Out
                              </button>
                            </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Enhanced Page Content */}
          <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-emerald-50/30 dark:from-gray-900/50 dark:to-emerald-900/30"
          >
            <div className="p-6">
              <Outlet />
            </div>
          </motion.div>

          {/* Enhanced Footer */}
          <motion.footer
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                © {new Date().getFullYear()} DEERIN FOODS LIMITED. All rights reserved.
              </p>
              <div className="mt-2 flex items-center justify-center space-x-6 text-xs">
                <motion.a
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                  Privacy Policy
                </motion.a>
                <span className="text-gray-300">•</span>
                <motion.a
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                  Terms of Service
                </motion.a>
                <span className="text-gray-300">•</span>
                <motion.a
                    href="#"
                    className="text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                >
                  Help Center
                </motion.a>
              </div>
            </div>
          </motion.footer>
        </div>

        {/* Click outside to close menus */}
        {(showUserMenu || isSidebarOpen) && (
            <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setShowUserMenu(false);
                  if (isMobile) setIsSidebarOpen(false);
                }}
            />
        )}
      </div>
  );
};

export default AdminLayout;