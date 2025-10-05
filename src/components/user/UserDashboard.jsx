import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiShoppingBag, 
  FiMessageCircle, 
  FiHelpCircle,
  FiSend,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTruck,
  FiEdit2,
  FiGift,
  FiAward
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAuth } from '../../context/AuthContext';

const WHATSAPP_NUMBER = '+2348055748661';

// Default user data for when no user is logged in
const defaultUser = {
  id: 'guest',
  name: 'Guest',
  email: '',
  phone: '',
  address: '',
  role: 'user',
};

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('userOrders');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const createOrder = () => {
    if (cart.length === 0) return;

    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      paymentStatus: 'awaiting'
    };

    // Save order
    const updatedOrders = [...orders, order];
    setOrders(updatedOrders);
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

    // Clear cart
    setCart([]);

    // Redirect to payment
    navigate(`/order/${order.id}/payment`);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      createOrder,
      orders 
    }}>
      {children}
    </CartContext.Provider>
  );
}



const StatCard = ({ icon: Icon, label, value, color = 'text-gray-800', accent = 'bg-gray-50', iconAccent = 'text-gray-700' }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`p-6 rounded-2xl border ${accent} flex items-center gap-4 relative overflow-hidden`}
  >
    <div className={`p-3 rounded-xl bg-white border ${iconAccent}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-5">
      <Icon size={80} />
    </div>
  </motion.div>
);

export default function UserDashboard({ user = defaultUser }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [backendOrders, setBackendOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaint, setComplaint] = useState('');
  const { addItem, openCart, currentTier, totalSpent, discountAmount } = useCart();
  const { currentUser } = useAuth();

  // Fetch user profile and stats from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const base = import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';
        const res = await fetch(`${base}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const profileData = await res.json();
          // Update user data with real profile information
          setUser(prev => ({
            ...prev,
            name: profileData.name || prev.name,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            address: profileData.address || prev.address
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  // Fetch backend orders for the authenticated user
  useEffect(() => {
    const fetchBackendOrders = async () => {
      try {
        setOrdersLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setBackendOrders([]);
          return;
        }
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com'}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map to a simplified shape used by the UI
          const mapped = (data || []).map(o => ({
            id: o._id,
            date: o.createdAt,
            status: o.status || (o.isPaid ? 'paid' : 'pending'),
            total: o.totalPrice,
            items: (o.orderItems || []).map(oi => ({
              id: oi.product?._id || oi.product,
              name: oi.name,
              quantity: oi.quantity,
              price: oi.price,
              image: oi.image || ''
            }))
          }));
          setBackendOrders(mapped);
        } else {
          setBackendOrders([]);
        }
      } catch (e) {
        console.error('Failed to fetch user orders', e);
        setBackendOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchBackendOrders();
  }, []);

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;
    
    const message = encodeURIComponent(
      `Customer Complaint:\n${complaint}\n\nFrom: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    setComplaint('');
  };

  // Profile Management
  const updateProfile = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const base = import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';
      const res = await fetch(`${base}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await res.json();

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(prev => ({ ...prev, ...updates }));

      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Order History
  const getOrderHistory = async (userId) => {
    // Fetch from backend API
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const base = import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';
      const res = await fetch(`${base}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching order history:', error);
      return [];
    }
  };

  // Support System
  const submitComplaint = (complaint) => {
    const message = `
      Customer Complaint:
      ${complaint}
      
      From: ${user.name}
      Email: ${user.email}
      Phone: ${user.phone}
    `;
    // Send via WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-6 rounded-2xl border bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Your Tier</div>
                <div className="text-2xl font-bold">
                  {currentTier?.icon} {currentTier?.name} • {currentTier?.discount}% off
                </div>
                <div className="text-sm text-gray-600 mt-1">Lifetime spent: ₦{Number(totalSpent || 0).toLocaleString()}</div>
              </div>
              <div className="hidden md:block">
                <FiGift className="text-green-600" size={40} />
              </div>
            </div>
            {/* Progress to next tier */}
            <div className="mt-4">
              {(() => {
                const tiers = [
                  { name: 'Bronze', min: 0 },
                  { name: 'Silver', min: 50000 },
                  { name: 'Gold', min: 100000 },
                  { name: 'Platinum', min: 250000 },
                  { name: 'Diamond', min: 500000 }
                ];
                const next = tiers.find(t => t.min > (totalSpent || 0));
                const target = next?.min || null;
                const progress = target ? Math.min(100, Math.round(((totalSpent || 0) / target) * 100)) : 100;
                return (
                  <div>
                    <div className="h-3 bg-white rounded-full border overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{progress}% to {next ? next.name : 'Max tier'}</span>
                      {next && <span>Next at ₦{next.min.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="p-6 rounded-2xl border bg-white">
            <div className="flex items-center gap-2 mb-2">
              <FiAward className="text-amber-600" />
              <div className="font-semibold">Perks</div>
            </div>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>{currentTier?.discount || 0}% discount on cart subtotal</li>
              {currentTier?.name === 'Gold' && <li>Priority support</li>}
              {['Platinum','Diamond'].includes(currentTier?.name) && <li>Priority support</li>}
              {currentTier?.name === 'Diamond' && <li>Exclusive gifts & early access</li>}
            </ul>
          </div>
        </div>

        // Quick Stats with real backend data
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiShoppingBag}
            label="Total Orders"
            value={backendOrders.length}
            color="text-blue-600"
            accent="bg-blue-50"
            iconAccent="text-blue-500"
          />
          <StatCard
            icon={FiMessageCircle}
            label="Reviews Written"
            value={reviews.length}
            color="text-purple-600"
            accent="bg-purple-50"
            iconAccent="text-purple-500"
          />
          <StatCard
            icon={FiTruck}
            label="In Transit"
            value={backendOrders.filter(o =>
              ['in-transit','processing','shipped'].includes((o.status||'').toLowerCase())).length}
            color="text-green-600"
            accent="bg-green-50"
            iconAccent="text-green-500"
          />
          <StatCard
            icon={FiAward}
            label="Loyalty Points"
            value={Math.floor((totalSpent || 0) / 100)} // 1 point per ₦100 spent
            color="text-amber-600"
            accent="bg-amber-50"
            iconAccent="text-amber-500"
          />
        </div>

        {/* Dashboard Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
            icon={FiShoppingBag}
          >
            My Orders
          </TabButton>
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={FiUser}
          >
            Profile
          </TabButton>
          <TabButton 
            active={activeTab === 'complaints'} 
            onClick={() => setActiveTab('complaints')}
            icon={FiMessageCircle}
          >
            Support & Complaints
          </TabButton>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-2xl border p-6">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              {backendOrders.length > 0 ? (
                <div className="space-y-4">
                  {backendOrders.slice(0, 5).map(order => (
                    <OrderCard key={order.id} order={order} onBuyAgain={(o) => {
                      const items = o.items || o.orderItems || [];
                      items.forEach(i => {
                        const pid = i.product?._id || i.product || i.id;
                        addItem({
                          id: pid,
                          name: i.name,
                          price: Number(i.price) || 0,
                          image: i.image || '',
                          stock: i.stock || 99
                        }, Math.max(1, i.quantity || i.qty || 1));
                      });
                      openCart();
                    }} />
                  ))}
                  {backendOrders.length > 5 && (
                    <div className="text-center pt-4">
                      <Link
                        to="/user/orders"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                      >
                        View All Orders ({backendOrders.length})
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <FiShoppingBag />
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ProfileField icon={FiUser} label="Name" value={user.name || 'Not set'} onEdit={(newValue) => updateProfile(user.id, { name: newValue })} />
                  <ProfileField icon={FiMail} label="Email" value={user.email || 'Not set'} onEdit={(newValue) => updateProfile(user.id, { email: newValue })} />
                  <ProfileField icon={FiPhone} label="Phone" value={user.phone || 'Not set'} onEdit={(newValue) => updateProfile(user.id, { phone: newValue })} />
                  <ProfileField icon={FiMapPin} label="Address" value={user.address || 'Not set'} onEdit={(newValue) => updateProfile(user.id, { address: newValue })} />
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium mb-4">Delivery Preferences</h3>
                  <p className="text-sm text-gray-600">Your delivery preferences will appear here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Support & Complaints</h2>
              
              {/* Direct Contact */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-medium text-green-800 mb-3">Direct Support</h3>
                <p className="text-green-700 mb-4">Get instant support via WhatsApp</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  <FiMessageCircle />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Complaint Form */}
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submit a Complaint
                  </label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-xl"
                    placeholder="Describe your issue..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <FiSend />
                  Submit Complaint
                </button>
              </form>

              {/* FAQs */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-medium mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <FAQItem
                    question="How long does delivery take?"
                    answer="Delivery usually takes 2-3 business days within Nigeria."
                  />
                  <FAQItem
                    question="What's your return policy?"
                    answer="We accept returns within 7 days of delivery if the product is unused and in original packaging."
                  />
                  {/* Add more FAQs as needed */}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ children, active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      {children}
    </button>
  );
}

function OrderCard({ order, onBuyAgain }) {
  return (
    <div className="border rounded-xl p-4 hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="space-y-2">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span className="font-medium">₦{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="font-medium">Total: ₦{order.total}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBuyAgain?.(order)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Buy again
          </button>
          <a
            href={`/order/${order.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const handleSave = () => {
    onEdit(newValue);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 group relative">
      <Icon className="text-gray-400" size={18} />
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-600 text-white rounded-lg text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-medium">{value || 'Not set'}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded"
            >
              <FiEdit2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <div>
      <h4 className="font-medium mb-1">{question}</h4>
      <p className="text-sm text-gray-600">{answer}</p>
    </div>
  );
}