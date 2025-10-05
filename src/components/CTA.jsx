import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiBox, 
  FiInfo, 
  FiStar, 
  FiMail, 
  FiShoppingCart, 
  FiSearch, 
  FiMessageCircle, 
  FiBarChart, 
  FiUser, 
  FiLogOut ,
    FiTwitter,
    FiFacebook,

  FiSettings,
    FiInstagram
} from 'react-icons/fi';
import { useCart } from './CartContext';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
// Config
const WHATSAPP_NUMBER = '+2348055748661';
const WHATSAPP_MESSAGE = 'Hello! I came from your website and would love to place an order.';

// Build a WhatsApp link (strip non-digits for wa.me)
function generateWhatsAppLink() {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, '');
  const encoded = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${phone}?text=${encoded}`;
}

// Update the navItems array to match your available routes
const navItems = [
  { name: 'Home', path: '/', icon: FiHome },
  { name: 'Products', path: '/products', icon: FiBox },
  { name: 'About', path: '/about', icon: FiInfo },
  { name: 'Reviews', path: '/reviews', icon: FiStar },
  { name: 'Contact', path: '/contact', icon: FiMail },
  // Only show admin link if user is admin
  { name: 'Admin', path: '/admin', icon: FiBarChart, adminOnly: true }
];

// Login link component that redirects to the main login page
const LoginLink = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  // Consider authenticated if we have a user or isAuthenticated() returns true
  if (user || (typeof isAuthenticated === 'function' && isAuthenticated())) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
        >
          <FiUser className="inline-block mr-1" />
          {user?.name || 'Dashboard'}
        </Link>
        <button
          onClick={() => logout()}
          className="text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
        >
          <FiLogOut className="inline-block mr-1" />
          Logout
        </button>
      </div>
    );
  }
  
  return (
    <Link
      to="/login"
      className="text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
    >
      <FiUser className="inline-block mr-1" />
      Login / Register
    </Link>
  );
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count, toggleCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Login modal removed; using route navigation instead
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Derived title for a11y on cart button
  const cartTitle = useMemo(() => (count > 0 ? `Cart (${count})` : 'Cart'), [count]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <nav className="h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Go to homepage">
            <div className="grid w-8 h-8 text-white rounded-lg shadow-sm bg-gradient-to-br from-green-600 to-green-400 place-items-center">
              D
            </div>
            <span className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-green-700">
                Deerin Foods
              </span>
          </Link>

          {/* Center: Desktop navigation */}
          <div className="items-center hidden gap-1 md:flex">
            {navItems.map(({ name, path, icon: Icon, adminOnly }) => {
              // Skip admin-only items if user is not admin
              if (adminOnly && (!user || user.role !== 'admin')) return null;

              return (
                <Link
                  key={name}
                  to={path}
                  className={`relative group px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(path) 
                      ? 'text-green-700 bg-green-50 shadow-sm' 
                      : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                  title={name}
                  aria-label={name}
                >
                  <div className="flex items-center gap-2">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Icon size={18} />
                    </motion.span>
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                {/* Active indicator */}
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                    isActive(path) ? 'w-6 bg-green-600' : 'w-0 bg-transparent group-hover:w-4 group-hover:bg-green-400'
                  }`}
                />
                  </Link>
              );
            })}
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </motion.span>
            </button>
            {/* Search */}
            <Link
              to="/products"
              className="p-2.5 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
              title="Search products"
              aria-label="Search products"
            >
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <FiSearch size={20} />
              </motion.span>
            </Link>

            {/* WhatsApp */}
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
              title="Chat on WhatsApp"
              aria-label="Chat on WhatsApp"
            >
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FiMessageCircle size={20} />
              </motion.span>
            </a>

            {/* Cart with badge */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
              aria-label={cartTitle}
              title={cartTitle}
            >
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <FiShoppingCart size={20} />
              </motion.span>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1.5 rounded-full bg-green-600 text-white text-[11px] font-semibold grid place-items-center shadow-sm"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
      </button>

            {/* Login/User Profile button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-green-50"
            >
              <div className="grid w-8 h-8 bg-green-100 rounded-full place-items-center">
                <span className="font-medium text-green-700">
                  {user.name?.[0] || 'U'}
                </span>
              </div>
              {user.role === 'admin' && (
                <span className="hidden px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full md:inline-block">
                  Admin
                </span>
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white border shadow-lg rounded-xl"
                >
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  {user.role === 'admin' ? (
                    <>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiBarChart size={16} />
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/inventory"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiBox size={16} />
                        Inventory
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiShoppingCart size={16} />
                        Orders
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/user/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser size={16} />
                        Dashboard
                      </Link>
                      <Link
                        to="/user/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiShoppingCart size={16} />
                        My Orders
                      </Link>
                      <Link
                        to="/user/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiSettings size={16} />
                        Settings
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      navigate('/');
                    }}
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-xl hover:text-green-700 hover:bg-green-50"
          >
            <FiUser size={18} />
            <span className="text-sm font-medium">Sign in</span>
          </Link>
        )}

            {/* Mobile menu toggle */}
    <motion.button
      whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden p-2.5 rounded-xl text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:shadow-sm"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              title={isMenuOpen ? 'Close menu' : 'Menu'}
    >
      <motion.span
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
                {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </motion.span>
    </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
    <AnimatePresence>
          {isMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pt-2 pb-3 md:hidden"
            >
              <div className="mx-[-16px] px-6 py-6 bg-white border-t border-gray-100 shadow-lg">
                {/* Mobile menu items */}
<div className="grid grid-cols-4 gap-4">
  {navItems.map(({ name, path, icon: Icon, adminOnly }) => {
    // Skip admin-only items if user is not admin
    if (adminOnly && (!user || user.role !== 'admin')) return null;

    return (
      <Link
        key={name}
        to={path}
        onClick={() => setIsMenuOpen(false)}
        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
          isActive(path)
            ? 'border-green-200 bg-green-50 text-green-700 shadow-sm'
            : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm'
        }`}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Icon size={20} />
        </motion.div>
        <span className="text-[11px] leading-none font-medium">{name}</span>
      </Link>
    );
  })}

  {/* Socials */}
  <a
    href="https://instagram.com/derinfoods"
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label="Instagram"
    title="Instagram"
>
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiInstagram size={20} />
    </motion.div>
    <span className="text-[11px] leading-none font-medium">Instagram</span>
  </a>
  <a
    href="https://twitter.com/derinfoods"
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label="Twitter"
    title="Twitter"
  >
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiTwitter size={20} />
    </motion.div>
    <span className="text-[11px] leading-none font-medium">Twitter</span>
  </a>
  <a
    href="https://facebook.com/derinsolashotunde"
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label="Facebook"
    title="Facebook"
  >
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiFacebook size={20} />
    </motion.div>
    <span className="text-[11px] leading-none font-medium">Facebook</span>
  </a>

  {/* Quick actions */}
  <button
    type="button"
    onClick={() => {
      setIsMenuOpen(false);
      navigate('/products');
    }}
    className="flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label="Search"
    title="Search"
  >
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiSearch size={20} />
    </motion.div>
    <span className="text-[11px] leading-none font-medium">Search</span>
  </button>
  <button
    type="button"
    onClick={() => {
      setIsMenuOpen(false);
      toggleCart();
    }}
    className="relative flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label={cartTitle}
    title={cartTitle}
  >
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiShoppingCart size={20} />
    </motion.div>
    {count > 0 && (
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-3 right-3 min-w-[18px] h-[18px] px-1.5 rounded-full bg-green-600 text-white text-[10px] font-semibold grid place-items-center shadow-sm"
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    )}
    <span className="text-[11px] leading-none font-medium">Cart</span>
  </button>
  <a
    href={generateWhatsAppLink()}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => setIsMenuOpen(false)}
    className="flex flex-col items-center gap-2 p-4 text-gray-700 transition-all duration-200 border-2 border-gray-100 rounded-2xl bg-gray-50 hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-sm"
    aria-label="WhatsApp"
    title="WhatsApp"
  >
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <FiMessageCircle size={20} />
    </motion.div>
    <span className="text-[11px] leading-none font-medium">WhatsApp</span>
  </a>
</div>
              </div>
      </motion.div>
          )}
    </AnimatePresence>

      {/* Login modal removed in favor of /login route */}
      </nav>
    </header>
  );
}