import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Removed unused LoginForm and useUser imports
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Hero from './components/Hero';
import Products from './components/Products';
import Reviews from './components/Testimonials';
import Reviews1 from './components/Reviews';
import 'aos/dist/aos.css';
import { FiShoppingCart, FiGlobe } from 'react-icons/fi';
// import Header from './components/Header';
import Header from './components/CTA';
import Header1 from './components/Header';
import ShippingBanner from './components/AnimatedBanner';
import Footer from './components/Footer';
import About from './components/About';
import Navbar from './components/Navbar';
import Contact from './components/Contact';
// import ProductsPage from './components/Productpage';
import Content from './components/Content';
import CartPage from './components/CartPage';
import { CartProvider } from './components/CartContext';
import CartDrawer from './components/CartDrawer';
import { ThemeProvider } from './context/ThemeContext';
import AdminStatsPage from './components/AdminStats';
import { UserProvider } from './components/auth/UserAuth';
import ProductsManagement from './components/admin/ProductsManagement';
import { Link } from 'react-router-dom';
import UserDashboard from './components/user/UserDashboard';
import OrderManagement from './components/OrderManagement';
import OrderPayment from './components/OrderPayment';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard2 from "./components/AdminPage.jsx";
import AdminLayoutNew from "./components/admin/AdminLayout.new.jsx";
import AdminLayoutFixed from "./components/admin/AdminLayout.fixed.jsx";
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext'; // Import SocketProvider component
import ProductsPage from './components/Productpage';
import DashboardPage from './pages/dashboard/DashboardPage';
// AuthForm modal is not used for routing; using dedicated pages instead
import CustomersPage from './components/admin/CustomersPage.jsx';
import CategoriesPage from './components/admin/CategoriesPage.jsx';
import ReportsPage from './components/admin/ReportsPage.jsx';
gsap.registerPlugin(ScrollTrigger);


const COUNTRIES = [
  "🇺🇸 United States",
  "🇬🇧 United Kingdom",
  "🇨🇦 Canada",
  "🇦🇺 Australia",
  "🇩🇪 Germany",
  "🇫🇷 France",
  "🇮🇪 Ireland",
  "🇳🇱 Netherlands",
];

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-emerald-500"></div>
      </div>
    );
  }
  
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If specific roles are required and user doesn't have any of them
  if (allowedRoles && !allowedRoles.some(role => currentUser.role === role)) {
    return <Navigate to="/" replace />;
  }
  
  // If route is admin-only but user is not admin
  if (allowedRoles?.includes('admin') && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  useEffect(() => {
    gsap.from('.fade-in', {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.fade-in',
        start: 'top 80%',
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <UserProvider>
            <CartProvider>
              <SocketProvider>
                <div className="min-h-screen bg-white">
                  <Header />
                  <main className="pt-16"> {/* Add padding-top to prevent content from hiding under fixed header */}
                    <Routes>
                    <Route path="/" element={<Content />} />
                    <Route path="/home" element={<Content />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/reviews" element={<Reviews1 />} />
                    <Route path="/cart" element={<CartPage/>} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout/>
                      </ProtectedRoute>
                    }>
                      <Route index element={<DashboardPage />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="products" element={<ProductsManagement />} />
                      <Route path="orders" element={<OrderManagement isAdmin={true} />} />
                      <Route path="customers" element={<CustomersPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="settings" element={<AdminStatsPage />} />
                    </Route>

                    {/* User Routes */}
                    <Route
                      path="/user/*"
                      element={
                        <ProtectedRoute allowedRoles={['user']}>
                          <Routes>
                            <Route path="orders" element={<OrderManagement isAdmin={false} />} />
                            <Route path="payment/:orderId" element={<OrderPayment />} />
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="wishlist" element={<UserWishlist />} />
                            <Route path="dashboard" element={<UserDashboard />} /> 
                          </Routes>
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 Route */}
                    <Route
                      path="*"
                      element={
                        <div className="flex items-center justify-center min-h-screen px-4">
                          <div className="text-center">
                            <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
                            <p className="text-gray-600">Page not found</p>
                            <Link
                              to="/"
                              className="inline-block px-6 py-2 mt-4 text-white bg-green-600 rounded-xl hover:bg-green-700"
                            >
                              Go Home
                            </Link>
                          </div>
                        </div>
                      }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
                <CartDrawer />
              </SocketProvider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Add placeholder components for user routes
function UserProfile() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
    </div>
  );
}

function UserOrders() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">My Orders</h1>
    </div>
  );
}

function UserWishlist() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
    </div>
  );
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-gray-700 hover:text-[#FF6B3D] transition-colors duration-200
                font-medium tracking-wide"
    >
      {children}
    </a>
  );
}

function InfiniteMarquee() {
  return (
    <div className="relative flex py-4 overflow-hidden bg-green-600">
      {/* Gradient Overlay Left */}
      <div className="absolute top-0 bottom-0 left-0 z-10 w-20 bg-gradient-to-r from-green-600 to-transparent" />

      {/* First Marquee */}
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: ["0%", "-100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {COUNTRIES.map((country, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 transition-colors text-white/90 hover:text-white"
          >
            <FiGlobe className="text-xl" />
            <span className="text-lg font-medium">{country}</span>
          </div>
        ))}
      </motion.div>

      {/* Second Marquee (Clone) */}
      <motion.div
        className="absolute flex gap-8 whitespace-nowrap left-full"
        animate={{
          x: ["-100%", "-200%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {COUNTRIES.map((country, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 transition-colors text-white/90 hover:text-white"
          >
            <FiGlobe className="text-xl" />
            <span className="text-lg font-medium">{country}</span>
          </div>
        ))}
      </motion.div>

      {/* Gradient Overlay Right */}
      <div className="absolute top-0 bottom-0 right-0 z-10 w-20 bg-gradient-to-l from-green-600 to-transparent" />
    </div>
  );
}
