import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiClock, FiCheck, FiTruck, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

export default function OrderManagement({ isAdmin }) {
  const { user } = useAuth();
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || user?.token;

  const navigate = useNavigate();
  const { items: cartItems, updateQty, removeItem, total, createOrder } = useCart();
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  // Fetch products (for mapping productId -> name, image)
  useEffect(() => {
    (async () => {
      try {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';
        const res = await fetch(`${base}/products`);
        if (res.ok) {
          const list = await res.json();
          const map = Object.fromEntries(list.map(p => [p._id || p.id, p]));
          setProductsMap(map);
        }
      } catch {}
    })();
  }, []);

  // Fetch orders for current user (or all if admin)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';
        const res = await fetch(`${base}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          const list = Array.isArray(data) ? data : (Array.isArray(data?.orders) ? data.orders : []);
          setOrders(list);
        } else {
          console.error('Failed to fetch orders', data);
          setOrders([]);
        }
      } catch (e) {
        console.error('Failed to fetch orders', e);
        setOrders([]);
      }
    })();
  }, [token]);

  const placeOrder = async () => {
    if (!cartItems.length) return;
    try {
      const id = await createOrder({
        name: 'N/A',
        address: 'N/A',
        city: 'N/A',
        state: 'N/A',
        phone: 'N/A'
      });
      if (id) navigate(`/payment/${id}`);
    } catch (e) {
      alert(e.message || 'Failed to place order');
    }
  };

  const handleBulkPriceUpdate = (percentage) => {
    const updatedProducts = Object.fromEntries(Object.entries(productsMap).map(([id, product]) => {
      if (selectedProducts.includes(id)) {
        const newPrice = product.price * (1 + percentage / 100);
        return [id, { ...product, price: Number(newPrice.toFixed(2)) }];
      }
      return [id, product];
    }));
    setProductsMap(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setBulkEditMode(false);
    setSelectedProducts([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'Order Management' : 'My Orders'}
        </h1>
        {!isAdmin && (
          <button
            onClick={placeOrder}
            disabled={cartItems.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            Place Order
          </button>
        )}
      </div>

      {/* Current Cart (for users) */}
      {!isAdmin && cartItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Cart</h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ₦{item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ₦{(item.price * (item.qty || 1)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                  <td className="px-6 py-4 text-right font-bold">
                    ₦{Number(total).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {(Array.isArray(orders) ? orders : []).map((order) => (
          <motion.div
            key={order._id || order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border overflow-hidden"
          >
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' || order.status === 'payment_verified' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  {order.paymentStatus && (
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      order.paymentStatus === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus === 'paid' && 'Fully Paid'}
                      {order.paymentStatus === 'pending_verification' && 'Awaiting Approval'}
                      {order.paymentStatus !== 'paid' && order.paymentStatus !== 'pending_verification' && 'Not Paid'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="text-right text-sm font-medium text-gray-500">Quantity</th>
                    <th className="text-right text-sm font-medium text-gray-500">Price</th>
                    <th className="text-right text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(order.items) ? order.items : []).map((item, idx) => {
                    const product = productsMap[item.productId];
                    return (
                      <tr key={`${order._id || order.id}-${idx}`}>
                        <td className="py-2">
                          <div className="flex items-center">
                            {product?.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            )}
                            <span className="ml-2 text-sm">{product?.name || item.productId}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-sm">{item.quantity}</td>
                        <td className="py-2 text-right text-sm">₦{item.price}</td>
                        <td className="py-2 text-right text-sm">₦{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan="3" className="py-4 text-right font-medium">Total:</td>
                    <td className="py-4 text-right font-bold">₦{Number(order.totalAmount).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders yet
          </div>
        )}
      </div>

      {/* Bulk Price Update (Admin) */}
      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Bulk Price Update</h2>
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setBulkEditMode(!bulkEditMode)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {bulkEditMode ? 'Cancel' : 'Edit Prices'}
              </button>
            </div>

            {bulkEditMode && (
              <div className="flex items-center gap-4">
                {[-10, -5, 5, 10].map(percent => (
                  <button
                    key={percent}
                    onClick={() => handleBulkPriceUpdate(percent)}
                    className={`px-4 py-2 rounded-lg border ${
                      percent > 0 
                        ? 'text-green-700 border-green-200 hover:bg-green-50'
                        : 'text-red-700 border-red-200 hover:bg-red-50'
                    }`}
                    disabled={selectedProducts.length === 0}
                  >
                    {percent > 0 ? '+' : ''}{percent}%
                  </button>
                ))}
                <input
                  type="number"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                  className="w-24 px-3 py-2 border rounded-lg"
                  placeholder="Custom %"
                />
                <button
                  onClick={() => handleBulkPriceUpdate(priceAdjustment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={selectedProducts.length === 0}
                >
                  Apply Custom
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}