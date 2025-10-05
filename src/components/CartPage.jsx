import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowLeft, FiTag, FiTruck, FiInfo, FiCreditCard, FiDollarSign, FiUpload } from 'react-icons/fi';
import { FaShoppingCart, FaCheckCircle, FaArrowRight, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './CartContext';
import PaystackButton from './PaystackButton';

// ========= Config =========
const CURRENCY = 'NGN';
const LOCALE = 'en-NG';
const WHATSAPP_NUMBER = '2348055748661'; // Update if needed
const VAT_ENABLED = true;
const VAT_RATE = 0.075; // 7.5%

// Shipping options (customize to your rates)
const SHIPPING_METHODS = [
  { id: 'pickup', label: 'Pickup (Lagos - Free)', description: 'Pick up from our location', amount: 0 },
  { id: 'standard', label: 'Standard (2–4 business days)', description: 'Nationwide delivery', amount: 1500 },
  { id: 'express', label: 'Express (1–2 business days)', description: 'Priority delivery', amount: 3000 }
];

// Simple promo rules (customize or integrate backend validation)
const PROMO_CODES = {
  WELCOME10: { type: 'percent', value: 10 },
  SAVE1000: { type: 'fixed', value: 1000 },
  FREESHIP: { type: 'shipping', value: true }
};

const STORAGE_KEYS = {
  promo: 'cart:promo',
  shipping: 'cart:shipping',
  note: 'cart:note'
};

// Env helpers (no process usage; works with Vite)
const getEnv = (key, fallback = '') => {
  try {
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) || fallback;
  } catch {
    return fallback;
  }
};

const API_BASE = getEnv('VITE_API_BASE', '/api');
const PAYSTACK_PUBLIC_KEY = getEnv('VITE_PAYSTACK_PUBLIC_KEY', '');
const FLUTTERWAVE_PUBLIC_KEY = getEnv('VITE_FLUTTERWAVE_PUBLIC_KEY', '');

// ========= Utils =========
function formatCurrency(amount, currency = CURRENCY, locale = LOCALE) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `₦${(amount || 0).toFixed(2)}`;
  }
}

function validatePromo(codeRaw) {
  if (!codeRaw) return null;
  const code = String(codeRaw).trim().toUpperCase();
  return PROMO_CODES[code] ? { code, ...PROMO_CODES[code] } : null;
}

function computeDiscount(subtotal, promo) {
  if (!promo) return { discount: 0, freeShipping: false };
  if (promo.type === 'percent') {
    const discount = Math.max(0, Math.min(subtotal, (subtotal * promo.value) / 100));
    return { discount, freeShipping: false };
  }
  if (promo.type === 'fixed') {
    const discount = Math.max(0, Math.min(subtotal, promo.value));
    return { discount, freeShipping: false };
  }
  if (promo.type === 'shipping') {
    return { discount: 0, freeShipping: true };
  }
  return { discount: 0, freeShipping: false };
}

function buildWhatsAppText({ items, subtotal, discount, shipping, tax, total, shippingMethod, note }) {
  const lines = [
    'Hello, I would like to place an order:',
    '',
    ...items.map((i) => `• ${i.name} x${i.qty} — ${formatCurrency((i.price || 0) * (i.qty || 0))}`),
    '',
    `Subtotal: ${formatCurrency(subtotal)}`
  ];

  if (discount > 0) lines.push(`Discount: -${formatCurrency(discount)}`);
  if (shipping > 0) lines.push(`Shipping (${shippingMethod?.label || 'Shipping'}): ${formatCurrency(shipping)}`);
  if (VAT_ENABLED && tax > 0) lines.push(`VAT (${(VAT_RATE * 100).toFixed(1)}%): ${formatCurrency(tax)}`);

  lines.push(`Total: ${formatCurrency(total)}`);

  if (note?.trim()) {
    lines.push('', 'Order note:', note.trim());
  }

  lines.push('', 'Please advise on shipping and payment.');
  return encodeURIComponent(lines.join('\n'));
}

// Dynamically load Paystack inline script to avoid dependency and SSR issues
let paystackScriptLoading = null;
async function ensurePaystackScript() {
  if (typeof window === 'undefined') return;
  if (window.PaystackPop) return;
  if (!paystackScriptLoading) {
    paystackScriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.paystack.co/v1/inline.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load Paystack SDK'));
      document.head.appendChild(s);
    });
  }
  await paystackScriptLoading;
}

async function startPaystackPayment({ key, email, amountKobo, reference, metadata, onSuccess, onClose }) {
  await ensurePaystackScript();
  if (!window?.PaystackPop) throw new Error('Paystack SDK not available');
  const handler = window.PaystackPop.setup({
    key,
    email,
    amount: Math.round(amountKobo),
    ref: reference,
    metadata,
    callback: (response) => onSuccess?.(response),
    onClose: () => onClose?.()
  });
  handler.openIframe();
}

// ========= Component =========
export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal: ctxSubtotal, updateQty, removeItem, clearCart, createOrder } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [shippingId, setShippingId] = useState(SHIPPING_METHODS[1]?.id || 'standard');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack'); // Default to Paystack
  const [paymentProof, setPaymentProof] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedPromo = localStorage.getItem(STORAGE_KEYS.promo);
      const savedShipping = localStorage.getItem(STORAGE_KEYS.shipping);
      const savedNote = localStorage.getItem(STORAGE_KEYS.note);
      if (savedPromo) {
        const p = validatePromo(savedPromo);
        if (p) {
          setPromo(p);
          setPromoInput(p.code);
        }
      }
      if (savedShipping && SHIPPING_METHODS.find((m) => m.id === savedShipping)) {
        setShippingId(savedShipping);
      }
      if (savedNote) setNote(savedNote);
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      if (promo?.code) localStorage.setItem(STORAGE_KEYS.promo, promo.code);
      else localStorage.removeItem(STORAGE_KEYS.promo);
    } catch {}
  }, [promo]);

  useEffect(() => {
    try {
      if (shippingId) localStorage.setItem(STORAGE_KEYS.shipping, shippingId);
    } catch {}
  }, [shippingId]);

  useEffect(() => {
    try {
      if (note?.trim()) localStorage.setItem(STORAGE_KEYS.note, note.trim());
      else localStorage.removeItem(STORAGE_KEYS.note);
    } catch {}
  }, [note]);

  // Derived values
  const hasItems = items.length > 0;
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + (i.qty || 0), 0), [items]);

  const subtotal = typeof ctxSubtotal === 'number'
    ? ctxSubtotal
    : items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);

  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingId) || SHIPPING_METHODS[0];
  const { discount, freeShipping } = useMemo(() => computeDiscount(subtotal, promo), [subtotal, promo]);

  const shipping = freeShipping ? 0 : (selectedShipping?.amount || 0);
  const taxableBase = Math.max(0, subtotal - discount);
  const tax = VAT_ENABLED ? Math.round(taxableBase * VAT_RATE) : 0;
  const total = Math.max(0, taxableBase + tax + shipping);

  // Payment config
  const amountKobo = Math.round(total * 100);
  const email = (typeof window !== 'undefined' && localStorage.getItem('userEmail')) || 'customer@example.com';
  const name = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'Customer';
  const reference = `MANAGE-${Date.now()}`;

  // Handlers
  const handleApplyPromo = useCallback((e) => {
    e?.preventDefault?.();
    const p = validatePromo(promoInput);
    if (!p) {
      alert('Invalid promo code');
      setPromo(null);
      return;
    }
    setPromo(p);
  }, [promoInput]);

  const handleRemovePromo = () => {
    setPromo(null);
    setPromoInput('');
  };

  const handleClearCart = () => {
    if (!hasItems) return;
    const ok = window.confirm('Remove all items from cart?');
    if (ok) clearCart();
  };

  const handleCheckoutWhatsApp = () => {
    if (!hasItems) return;
    const text = buildWhatsAppText({
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      shippingMethod: selectedShipping,
      note
    });
    // ...
  };

  const handlePaystack = async () => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
    if (!publicKey) {
      alert('Paystack public key not configured. Set VITE_PAYSTACK_PUBLIC_KEY in your .env.');
      return;
    }
    // Require sign-in
    const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || null;
    if (!token) {
      alert('Please sign in to continue to payment.');
      return navigate('/login', { state: { from: '/cart' } });
    }
    setIsPaying(true);
    try {
      // Pre-create an order in pending state with the payment reference so backend can verify against it
      const shippingAddress = { method: selectedShipping?.id, note: (note || '').trim(), cost: shipping };
      const pendingOrderId = await createOrder(shippingAddress, null, 'pending_payment', reference, true);
      if (!pendingOrderId) {
        setIsPaying(false);
        return;
      }
      // Store for later verification
      setOrderId(pendingOrderId);

      await startPaystackPayment({
        key: publicKey,
        email,
        amountKobo,
        reference,
        metadata: {
          cartSize: itemCount,
          shippingMethod: selectedShipping?.id,
          orderId: pendingOrderId
        },
        onSuccess: async (res) => {
          try {
            const result = await verifyPayment(res.reference || reference, pendingOrderId);
            if (result.success) {
              setOrderPlaced(true);
              setShowThankYou(true);
              clearCart();
            } else {
              alert('Payment verification failed. Please contact support with your payment reference.');
            }
          } catch (e) {
            alert(e.message || 'Payment recorded, but verification failed. Please contact support.');
          } finally {
            setIsPaying(false);
          }
        },
        onClose: () => {
          console.log('Payment window closed');
          setIsPaying(false);
        }
      });
    } catch (err) {
      setIsPaying(false);
      console.error('Paystack error:', err);
      alert(err.message || 'Failed to start Paystack payment');
    }
  };

  const handlePaystackSuccess = async (response) => {
    try {
      setIsPaying(true);
      const shippingAddress = {
        method: selectedShipping?.id,
        note: (note || '').trim(),
        cost: shipping
      };
      
      await createOrder(shippingAddress, null, 'processing');
      
      setOrderPlaced(true);
      setShowThankYou(true);
      clearCart();
    } catch (error) {
      console.error('Order placement failed after payment:', error);
      alert('Payment was successful but we encountered an issue creating your order. Please contact support with your payment reference.');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaystackError = (error) => {
    console.error('Payment error:', error);
    alert(error.message || 'Payment failed. Please try again or use a different payment method.');
  };

  const handlePayment = async () => {
    // Require sign-in
    const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || null;
    if (!token) {
      alert('Please sign in to proceed with checkout.');
      return navigate('/login', { state: { from: '/cart' } });
    }
    if (paymentMethod === 'paystack') {
      const publicKey = PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        alert('Payment processing is not configured. Please contact support.');
        console.error('Paystack public key is not configured');
        return;
      }

      try {
        setIsPaying(true);
        await handlePaystack();
      } catch (error) {
        console.error('Payment initialization failed:', error);
        alert('Failed to initialize payment. Please try again.');
        setIsPaying(false);
      }
    } else if (paymentMethod === 'bank') {
      try {
        setIsPaying(true);
        const shippingAddress = {
          method: selectedShipping?.id,
          note: (note || '').trim(),
          cost: shipping
        };
        
        await createOrder(shippingAddress, paymentProof);
        
        setOrderPlaced(true);
        setShowThankYou(true);
        clearCart();
      } catch (error) {
        console.error('Order placement failed:', error);
        alert(error.message || 'Failed to place order. Please try again.');
      } finally {
        setIsPaying(false);
      }
    } else {
      // Bank transfer with proof
      if (!paymentProof) {
        alert('Please upload your payment proof before placing the order.');
        return;
      }
      
      try {
        setIsPaying(true);
        const shippingAddress = {
          method: selectedShipping?.id,
          note: (note || '').trim(),
          cost: shipping
        };
        
        await createOrder(shippingAddress, paymentProof);
        
        setOrderPlaced(true);
        setShowThankYou(true);
        clearCart();
      } catch (error) {
        console.error('Order placement failed:', error);
        alert(error.message || 'Failed to place order. Please try again.');
      } finally {
        setIsPaying(false);
      }
    }
  };

  // Thank you animation
  useEffect(() => {
    if (showThankYou) {
      const timer = setTimeout(() => {
        setShowThankYou(false);
        navigate('/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showThankYou, navigate]);

  // Helper for max quantity (respect stock if provided)
  const getMaxQty = (item) => {
    const maxStock = Number.isFinite(item?.stock) ? item.stock : 99;
    return Math.max(1, Math.min(99, maxStock));
  };

  const handleProceedToCard = async () => {
    if (!hasItems) return;
    try {
      const shippingAddress = { method: selectedShipping?.id, note: (note || '').trim() };
      const newOrderId = await createOrder(shippingAddress);
      if (newOrderId) {
        navigate(`/user/payment/${newOrderId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to start card checkout. Please try again.');
    }
  };

  // Animations variants
  const itemVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 }
  };

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <motion.button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-green-700 hover:text-green-600"
            whileTap={{ scale: 0.98 }}
          >
            <FiArrowLeft className="mr-2" />
            Continue shopping
          </motion.button>

          {hasItems && (
            <motion.div
              key={itemCount}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-sm text-gray-600"
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </motion.div>
          )}
        </div>

        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FiShoppingCart className="text-green-600" />
          Your Cart
        </h1>

        {!hasItems && (
          <div className="text-center text-gray-600 py-16">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Your cart is empty.
            </motion.p>
            <motion.p className="text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              Add some items to get started.
            </motion.p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/"
                  className="inline-block bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-full font-medium"
                >
                  Start Shopping
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/products"
                  className="inline-block border hover:bg-gray-50 text-gray-800 px-5 py-3 rounded-full font-medium"
                >
                  Browse Products
                </Link>
              </motion.div>
            </div>
          </div>
        )}

        {hasItems && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <ul className="divide-y">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const unitPrice = item.price || 0;
                    const qty = item.qty || 1;
                    const lineTotal = unitPrice * qty;
                    const maxQty = getMaxQty(item);
                    return (
                      <motion.li
                        key={item.id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="py-4"
                        layout
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      >
                        <div className="flex gap-4">
                          <motion.img
                            src={item.image || '/images/placeholder.png'}
                            alt={item.name}
                            className="w-24 h-24 rounded object-cover bg-gray-100 flex-shrink-0"
                            loading="lazy"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(unitPrice)}</p>
                                {Number.isFinite(item?.stock) && (
                                  <p className="text-xs text-gray-500 mt-1">In stock: {item.stock}</p>
                                )}
                              </div>
                              <motion.button
                                onClick={() => removeItem(item.id)}
                                className="p-2 rounded hover:bg-red-50 text-red-500"
                                aria-label={`Remove ${item.name}`}
                                title="Remove"
                                whileTap={{ scale: 0.9, rotate: -5 }}
                              >
                                <FiTrash2 />
                              </motion.button>
                            </div>

                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <motion.button
                                  onClick={() => updateQty(item.id, Math.max(qty - 1, 1))}
                                  className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-40"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  disabled={qty <= 1}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiMinus />
                                </motion.button>
                                <motion.input
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  max={maxQty}
                                  className="w-16 border rounded px-2 py-1 text-center"
                                  value={qty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (Number.isNaN(val)) return;
                                    updateQty(item.id, Math.max(1, Math.min(val, maxQty)));
                                  }}
                                  aria-label={`Quantity of ${item.name}`}
                                  whileFocus={{ scale: 1.02 }}
                                />
                                <motion.button
                                  onClick={() => updateQty(item.id, Math.min(qty + 1, maxQty))}
                                  className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-40"
                                  aria-label={`Increase quantity of ${item.name}`}
                                  disabled={qty >= maxQty}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <FiPlus />
                                </motion.button>
                              </div>

                              <motion.div
                                key={lineTotal}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="font-semibold text-gray-900"
                              >
                                {formatCurrency(lineTotal)}
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <div className="mt-6 flex items-center gap-3">
                <motion.button
                  onClick={handleClearCart}
                  className="px-4 py-2 rounded-full border font-medium text-gray-700 hover:bg-gray-50"
                  whileTap={{ scale: 0.98 }}
                >
                  Clear cart
                </motion.button>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/products"
                    className="px-4 py-2 rounded-full border font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Continue shopping
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Summary */}
            <aside className="lg:col-span-1">
              <div className="border rounded-2xl p-5 sticky top-6 space-y-5">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                {/* Promo code */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FiTag className="text-green-600" />
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter code (e.g. WELCOME10)"
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <motion.button
                      type="submit"
                      className="px-3 py-2 rounded bg-green-600 text-white font-medium hover:bg-green-500"
                      whileTap={{ scale: 0.98 }}
                    >
                      Apply
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {promo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded px-3 py-2"
                      >
                        <span className="text-green-800">
                          Applied: {promo.code}{' '}
                          {promo.type === 'percent' && `(${promo.value}% off)`}
                          {promo.type === 'fixed' && `(₦${promo.value} off)`}
                          {promo.type === 'shipping' && `(Free shipping)`}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Shipping */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FiTruck className="text-green-600" />
                    Shipping
                  </label>
                  <div className="space-y-2">
                    {SHIPPING_METHODS.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between gap-3 border rounded px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                          shippingId === m.id ? 'border-green-300 bg-green-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            value={m.id}
                            checked={shippingId === m.id}
                            onChange={() => setShippingId(m.id)}
                          />
                          <div>
                            <div className="font-medium">{m.label}</div>
                            {m.description && (
                              <div className="text-xs text-gray-500">{m.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="font-medium">{formatCurrency(m.amount)}</div>
                      </label>
                    ))}
                    {freeShipping && (
                      <div className="text-xs text-green-700 flex items-center gap-1">
                        <FiInfo />
                        Free shipping applied by promo.
                      </div>
                    )}
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order note</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add instructions (e.g., delivery details)"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FiCreditCard className="mr-2" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={paymentMethod === 'paystack'}
                        onChange={() => setPaymentMethod('paystack')}
                      />
                      <div className="ml-3">
                        <div className="font-medium flex items-center">
                          <FiCreditCard className="mr-2" />
                          Pay with Card
                        </div>
                        <div className="text-sm text-gray-500 ml-6">Secure payment with Paystack (Cards & Bank Transfer)</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg hover:border-blue-500 cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                      />
                      <div className="ml-3">
                        <div className="font-medium flex items-center">
                          <FiDollarSign className="mr-2" />
                          Bank Transfer
                        </div>
                        <div className="text-sm text-gray-500 ml-6">Make a direct bank transfer and upload proof</div>
                      </div>
                    </label>
                  </div>  
                </div>

                {/* Payment Proof */}
                {paymentMethod === 'bank' && (
                  <motion.div
                    className="mt-4 p-4 bg-yellow-50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="font-medium mb-2">Bank Transfer Details:</p>
                    <p>Bank: Your Bank Name</p>
                    <p>Account Number: 1234567890</p>
                    <p>Account Name: Your Business Name</p>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Payment Proof (Screenshot/Receipt)
                      </label>
                      <div className="mt-1 flex items-center">
                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md border border-blue-200 text-sm font-medium transition-colors">
                          Choose File
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                  alert('File size should be less than 5MB');
                                  e.target.value = '';
                                  setPaymentProof(null);
                                  return;
                                }
                                setPaymentProof(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                          {paymentProof ? paymentProof.name : 'No file chosen'}
                        </span>
                        {paymentProof && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentProof(null);
                              // Reset file input
                              const fileInput = document.querySelector('input[type="file"]');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: JPG, PNG, PDF (max 5MB)
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <motion.span
                      key={subtotal}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-semibold"
                    >
                      {formatCurrency(subtotal)}
                    </motion.span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-green-700">
                      <span>Discount</span>
                      <motion.span
                        key={discount}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        -{formatCurrency(discount)}
                      </motion.span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <motion.span
                      key={shipping}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-semibold"
                    >
                      {formatCurrency(shipping)}
                    </motion.span>
                  </div>
                  {VAT_ENABLED && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">VAT ({(VAT_RATE * 100).toFixed(1)}%)</span>
                      <motion.span
                        key={tax}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-semibold"
                      >
                        {formatCurrency(tax)}
                      </motion.span>
                    </div>
                  )}
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <motion.span
                      key={total}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-bold text-gray-900"
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <motion.button
                    onClick={handleCheckoutWhatsApp}
                    disabled={!hasItems}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-3 rounded-full font-medium"
                    whileTap={{ scale: 0.98 }}
                  >
                    Checkout via WhatsApp
                  </motion.button>

                  <motion.button
                    onClick={handleProceedToCard}
                    disabled={!hasItems}
                    className="w-full border hover:bg-gray-50 disabled:opacity-50 px-4 py-3 rounded-full font-medium text-gray-800"
                    title="Card payment checkout"
                    whileTap={{ scale: 0.98 }}
                  >
                    Proceed to Card Checkout
                  </motion.button>

                  {paymentMethod === 'paystack' ? (
                    <PaystackButton
                      amount={amountKobo}
                      email={email}
                      publicKey={PAYSTACK_PUBLIC_KEY}
                      onSuccess={handlePaystackSuccess}
                      onError={handlePaystackError}
                      className="w-full"
                    >
                      {isPaying ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                    </PaystackButton>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={isPaying || !hasItems || (paymentMethod === 'bank' && !paymentProof)}
                      className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                        isPaying || !hasItems || (paymentMethod === 'bank' && !paymentProof)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                      }`}
                    >
                      {isPaying ? 'Processing...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Thank You Animation */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center"
          >
            <FaCheckCircle className="text-2xl mr-3" />
            <div>
              <p className="font-bold">Thank you for your order!</p>
              <p className="text-sm">Order ID: {orderId}</p>
            </div>
            <button onClick={() => setShowThankYou(false)} className="ml-4 text-white hover:text-gray-200">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}