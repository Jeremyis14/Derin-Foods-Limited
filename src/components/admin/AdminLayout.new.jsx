import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  FaTags
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminNotifications from './AdminNotifications';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ to, icon, children, isActive = false, onClick = () => {} }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
      isActive
        ? 'bg-emerald-600 text-white shadow-md'
        : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'
    }`}
  >
    <span className={`mr-3 ${isActive ? 'text-white' : 'text-emerald-300 group-hover:text-white'}`}>
      {icon}
    </span>
    <span className="flex-1">{children}</span>
  </Link>
);

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar when clicking on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  
  // Mock data - replace with actual data from your backend
  const productsCount = 24;
  const pendingOrders = 5;

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isSidebarOpen ? 'overflow-hidden' : ''}`}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: isMobile ? '-100%' : 0 }}
        animate={{ x: isSidebarOpen ? 0 : (isMobile ? '-100%' : 0) }}
        transition={{ type: 'tween', ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-emerald-700 to-emerald-800 text-white z-50 shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between h-16 px-6 bg-emerald-900 border-b border-emerald-600">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-white text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-2">M</span>
            <span className="text-xl font-bold">ManagePro</span>
          </div>
          <button 
            className="lg:hidden text-white hover:text-emerald-200 transition-colors p-2"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center p-6 border-b border-emerald-600">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">
              {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-emerald-800"></span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-white">{currentUser?.email || 'Admin User'}</p>
            <p className="text-xs text-emerald-200">Administrator</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            <NavItem 
              to="/admin/dashboard" 
              icon={<FaTachometerAlt className="w-5 h-5" />}
              isActive={isActive('/admin/dashboard')}
              onClick={handleNavClick}
            >
              Dashboard
            </NavItem>
            <NavItem 
              to="/admin/products" 
              icon={<FaBox className="w-5 h-5" />}
              isActive={location.pathname.startsWith('/admin/products')}
              onClick={handleNavClick}
            >
              Products
              <span className="ml-auto bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {productsCount}
              </span>
            </NavItem>
            <NavItem 
              to="/admin/orders" 
              icon={<FaShoppingCart className="w-5 h-5" />}
              isActive={isActive('/admin/orders')}
              onClick={handleNavClick}
            >
              Orders
              <span className="ml-auto bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            </NavItem>
            <NavItem 
              to="/admin/customers" 
              icon={<FaUsers className="w-5 h-5" />}
              isActive={isActive('/admin/customers')}
              onClick={handleNavClick}
            >
              Customers
            </NavItem>
            <NavItem 
              to="/admin/categories" 
              icon={<FaTags className="w-5 h-5" />}
              isActive={isActive('/admin/categories')}
              onClick={handleNavClick}
            >
              Categories
            </NavItem>
            <NavItem 
              to="/admin/reports" 
              icon={<FaChartLine className="w-5 h-5" />}
              isActive={isActive('/admin/reports')}
              onClick={handleNavClick}
            >
              Reports
            </NavItem>
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-emerald-600">
            <NavItem 
              to="/admin/settings" 
              icon={<FaCog className="w-5 h-5" />}
              isActive={isActive('/admin/settings')}
              onClick={handleNavClick}
            >
              Settings
            </NavItem>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <FaSun className="w-5 h-5 mr-3 text-yellow-300" />
                  Light Mode
                </>
              ) : (
                <>
                  <FaMoon className="w-5 h-5 mr-3 text-gray-300" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button 
                className="lg:hidden text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 mr-2"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                {location.pathname === '/admin/dashboard' && 'Dashboard'}
                {location.pathname.startsWith('/admin/products') && 'Products'}
                {location.pathname === '/admin/orders' && 'Orders'}
                {location.pathname === '/admin/customers' && 'Customers'}
                {location.pathname === '/admin/categories' && 'Categories'}
                {location.pathname === '/admin/reports' && 'Reports'}
                {location.pathname === '/admin/settings' && 'Settings'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-40 sm:w-56 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <AdminNotifications />
                
                <div className="hidden md:flex items-center space-x-2">
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {currentUser?.email?.split('@')[0] || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                    </div>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-medium">
                        {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Sign out"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
          >
            <Outlet />
          </motion.div>
          
          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} ManagePro. All rights reserved.</p>
            <div className="mt-1 flex items-center justify-center space-x-4 text-xs">
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Help Center</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
