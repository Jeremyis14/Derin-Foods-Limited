import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const STORAGE_KEY = 'cart:v1';
const WHATSAPP_NUMBER = '+2348055748661';

// Define REWARD_TIERS properly
const REWARD_TIERS = {
  BRONZE: {
    name: 'Bronze',
    minSpent: 0,
    discount: 0,
    icon: '🥉',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  SILVER: {
    name: 'Silver',
    minSpent: 50000,
    discount: 5,
    icon: '🥈',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  GOLD: {
    name: 'Gold',
    minSpent: 100000,
    discount: 10,
    icon: '🥇',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  PLATINUM: {
    name: 'Platinum',
    minSpent: 250000,
    discount: 15,
    icon: '💎',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  DIAMOND: {
    name: 'Diamond',
    minSpent: 500000,
    discount: 20,
    icon: '👑',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  }
};

// Add helper functions for rewards
function calculateUserTier(totalSpent) {
  const tiers = Object.entries(REWARD_TIERS).reverse();
  return tiers.find(([_, tier]) => totalSpent >= tier.minSpent)?.[0] || 'BRONZE';
}

function calculateDiscount(subtotal, tierDiscount) {
  return subtotal * (tierDiscount / 100);
}

// Storage functions remain the same
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], orders: [] };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : []
    };
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return { items: [], orders: [] };
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, setState] = useState(() => loadFromStorage());
  const [items, setItems] = useState(state.items || []);
  const [orders, setOrders] = useState(state.orders || []);
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const token = user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  // Save to storage whenever cart or orders change
  useEffect(() => {
    saveToStorage({ items, orders });
  }, [items, orders]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(v => !v), []);

  // Calculate user's tier and discounts
  const totalSpent = useMemo(() => 
    orders.reduce((sum, order) => sum + (order.total || 0), 0),
    [orders]
  );

  const currentTier = useMemo(() => {
    const tierKey = calculateUserTier(totalSpent);
    return REWARD_TIERS[tierKey];
  }, [totalSpent]);

  // Cart calculations
  const count = useMemo(() => 
    items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
    [items]
  );

  const subtotal = useMemo(() => 
    items.reduce((sum, item) => 
      sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 
      0
    ),
    [items]
  );

  const discountAmount = useMemo(() => 
    calculateDiscount(subtotal, currentTier.discount),
    [subtotal, currentTier]
  );

  const total = useMemo(() => 
    Math.max(0, subtotal - discountAmount),
    [subtotal, discountAmount]
  );

  // Cart operations
  const addItem = useCallback((product, qty = 1) => {
    if (!product?.id || !product?.name || typeof product.price !== 'number') {
      console.error('Invalid product data:', product);
      return;
    }

    setItems(prev => {
      const existingItem = prev.find(i => i.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: Math.min((item.qty || 0) + qty, 99) }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        qty: Math.min(Math.max(1, qty), 99)
      }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    if (!id) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (!id || typeof qty !== 'number') return;
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, qty: Math.min(Math.max(1, qty), 99) } : i
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Order operations
  const createOrder = useCallback(async (
    shippingAddress,
    paymentProof = null,
    statusOverride = null,
    paymentReference = null,
    deferClear = false
  ) => {
    if (items.length === 0) return null;
    if (!token) {
      alert('Please sign in to place an order.');
      return null;
    }

    try {
      // Normalize shipping method
      const allowedMethods = ['pickup', 'standard', 'express'];
      const method = allowedMethods.includes(shippingAddress?.method) ? shippingAddress.method : 'standard';

      // Build payload as server expects
      const payload = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image
        })),
        totalAmount: total,
        shippingMethod: method,
        note: (shippingAddress?.note || '').trim(),
        paymentMethod: paymentProof ? 'bank_transfer' : 'card',
        ...(paymentReference && { paymentReference })
      };
      console.log('createOrder payload:', payload);

      const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';

      const res = await fetch(`${base}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        console.error('Create order failed:', res.status, msg);
        if (res.status === 401) {
          throw new Error('Please sign in to place an order');
        }
        throw new Error(msg.error || 'Failed to create order');
      }

      const order = await res.json();

      // If bank transfer, upload proof to specific order endpoint
      if (paymentProof && order?._id) {
        const formData = new FormData();
        formData.append('proof', paymentProof);
        const proofRes = await fetch(`${base}/orders/${order._id}/payment-proof`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!proofRes.ok) {
          const err = await proofRes.json().catch(() => ({}));
          console.warn('Payment proof upload failed:', err);
        }
      }

      // Mirror minimal order in local state for UI/rewards
      setOrders(prev => [...prev, {
        id: order._id || order.id,
        date: order.createdAt || new Date().toISOString(),
        items: items.map(i => ({ ...i, subtotal: i.price * i.qty })),
        subtotal,
        discount: {
          percentage: currentTier.discount,
          amount: discountAmount,
          tierName: currentTier.name
        },
        total,
        status: statusOverride || 'pending_payment',
        paymentStatus: paymentProof ? 'pending' : 'pending',
        paymentMethod: paymentProof ? 'bank_transfer' : 'card',
        trackingNumber: order.trackingNumber || ''
      }]);

      // Clear cart unless we are deferring (e.g., pre-creating order before online payment)
      if (!deferClear) {
        clearCart();
      }

      return order._id || order.id;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }, [items, subtotal, total, discountAmount, currentTier, clearCart, token]);

  const getOrder = useCallback((orderId) => 
    orders.find(order => order.id === orderId),
    [orders]
  );

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  const value = useMemo(() => ({
    // Cart state
    items,
    count,
    subtotal,
    total,
    isOpen,
    
    // Cart operations
    addItem,
    removeItem,
    updateQty,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    
    // Order operations
    createOrder,
    orders,
    getOrder,
    updateOrderStatus,
    
    // Rewards
    currentTier,
    totalSpent,
    discountAmount
  }), [
    items,
    count,
    subtotal,
    total,
    isOpen,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    createOrder,
    orders,
    getOrder,
    updateOrderStatus,
    currentTier,
    totalSpent,
    discountAmount
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}