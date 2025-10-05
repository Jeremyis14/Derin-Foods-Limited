import React, { useState, useEffect } from 'react';
import {
  FaBox, FaTruck, FaCheck, FaClock, FaTimes, FaEye,
  FaMapMarker, FaPhone, FaEnvelope, FaCalendar, FaCreditCard
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://derin-foods-limited.onrender.com/api';

const OrderTracking = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');

      // Fallback to sample data for demo
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-001',
          items: [
            { name: 'Egusi Seeds', quantity: 2, price: 2499 },
            { name: 'Pounded Yam Flour', quantity: 1, price: 4299 }
          ],
          totalAmount: 9297,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          orderStatus: 'shipped',
          orderDate: new Date().toISOString(),
          shippingAddress: '123 Main St, Lagos, Nigeria',
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          trackingNumber: 'TRK123456789'
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          items: [
            { name: 'Organic Honey', quantity: 1, price: 3599 }
          ],
          totalAmount: 3599,
          paymentMethod: 'bank_transfer',
          paymentStatus: 'pending',
          orderStatus: 'processing',
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress: '456 Oak Ave, Abuja, Nigeria',
          deliveryDate: null,
          trackingNumber: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheck className="h-4 w-4" />;
      case 'pending': return <FaClock className="h-4 w-4" />;
      case 'failed': return <FaTimes className="h-4 w-4" />;
      case 'processing': return <FaBox className="h-4 w-4" />;
      case 'shipped': return <FaTruck className="h-4 w-4" />;
      default: return <FaClock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in to view orders</h2>
          <p className="text-gray-600 dark:text-gray-300">Please log in to view your order history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your orders and view order history
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <FaBox className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                        {getStatusIcon(order.paymentStatus)}
                        <span className="capitalize">{order.paymentStatus}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <FaCalendar className="text-gray-400" />
                          <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <FaCreditCard className="text-gray-400" />
                          <span className="capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <FaBox className="text-gray-400" />
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="font-semibold text-lg text-emerald-600">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <FaEye className="inline mr-2" />
                      View Details
                    </button>

                    {order.trackingNumber && (
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Order Details - {selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Status Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Status</h3>
                    <div className="space-y-4">
                      {[
                        { status: 'pending', label: 'Payment Pending', icon: FaClock },
                        { status: 'processing', label: 'Processing Order', icon: FaBox },
                        { status: 'shipped', label: 'Shipped', icon: FaTruck },
                        { status: 'completed', label: 'Delivered', icon: FaCheck }
                      ].map((step, index) => {
                        const isActive = getStepStatus(selectedOrder, step.status);
                        const StepIcon = step.icon;

                        return (
                          <div key={step.status} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                            }`}>
                              <StepIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {step.label}
                              </p>
                              {isActive && step.status === selectedOrder.orderStatus && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {step.status === 'shipped' && selectedOrder.trackingNumber
                                    ? `Tracking: ${selectedOrder.trackingNumber}`
                                    : 'In progress...'}
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.quantity * item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</p>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Shipping Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FaMapMarker className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping Address</p>
                          <p className="text-gray-900 dark:text-white">{selectedOrder.shippingAddress}</p>
                        </div>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tracking Number</p>
                          <p className="text-gray-900 dark:text-white font-mono">{selectedOrder.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</p>
                          <p className="text-gray-900 dark:text-white capitalize">
                            {selectedOrder.paymentMethod?.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine if a step is active
const getStepStatus = (order, stepStatus) => {
  const statusOrder = ['pending', 'processing', 'shipped', 'completed'];
  const currentIndex = statusOrder.indexOf(order.orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);

  if (stepStatus === order.paymentStatus && order.paymentStatus === 'pending') {
    return true;
  }

  return stepIndex <= currentIndex;
};

export default OrderTracking;
