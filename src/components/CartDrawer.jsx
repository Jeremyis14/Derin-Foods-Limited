import React from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
  import { useCart } from './CartContext';
  import { useNavigate } from 'react-router-dom';

  const WHATSAPP_NUMBER = '2348055748661'; // Update if needed

  function formatCurrency(amount, currency = 'NGN', locale = 'en-NG') {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    } catch {
      return `₦${amount.toFixed(2)}`;
    }
  }

  function buildWhatsAppText(items, subtotal) {
    const lines = [
      'Hello Deerin Foods, I would like to place an order:',
      '',
      ...items.map(i => `• ${i.name} x${i.qty} — ${formatCurrency((i.price || 0) * (i.qty || 0))}`),
      '',
      `Subtotal: ${formatCurrency(subtotal)}`,
      '',
      'Please advise on shipping and payment.'
    ];
    return encodeURIComponent(lines.join('\n'));
  }

  export default function CartDrawer() {
    const navigate = useNavigate();
    const { items, subtotal, updateQty, removeItem, clearCart, isOpen, closeCart, user, currentTier } = useCart();

    const handleCheckoutWhatsApp = () => {
      const text = buildWhatsAppText(items, subtotal);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const hasItems = items.length > 0;

    // Calculate discounted subtotal based on the current tier
    const discountMultiplier = currentTier?.discount ? (100 - currentTier.discount) / 100 : 1;
    const discountedSubtotal = subtotal * discountMultiplier;

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={closeCart}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiShoppingCart className="text-green-600" />
                  <h3 className="font-semibold text-lg">Your Cart</h3>
                </div>
                <button onClick={closeCart} className="p-2 rounded hover:bg-gray-100">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {!hasItems && (
                  <div className="text-center text-gray-600 py-16">
                    <p>Your cart is empty.</p>
                    <p className="text-sm mt-1">Add some delicious items to get started.</p>
                  </div>
                )}

                {hasItems && (
                  <ul className="space-y-4">
                    {items.map(item => (
                      <li key={item.id} className="flex gap-3">
                        <img
                          src={item.image || '/images/placeholder.png'}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">{formatCurrency(item.price || 0)}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-500"
                              aria-label="Remove item"
                            >
                              <FiTrash2 />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQty(item.id, Math.max((item.qty || 1) - 1, 1))}
                                className="p-1 rounded border hover:bg-gray-50"
                                aria-label="Decrease quantity"
                              >
                                <FiMinus />
                              </button>
                              <span className="w-8 text-center">{item.qty || 1}</span>
                              <button
                                onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                                className="p-1 rounded border hover:bg-gray-50"
                                aria-label="Increase quantity"
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <div className="font-medium text-gray-900">
                              {formatCurrency((item.price || 0) * (item.qty || 0))}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                {user && currentTier && (
                  <div className={`p-4 rounded-xl ${currentTier.bg} mb-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentTier.icon}</span>
                        <span className={`font-medium ${currentTier.color}`}>
                          {currentTier.name} Discount
                        </span>
                      </div>
                      <span className="font-medium text-green-600">
                        {currentTier.discount}% OFF
                      </span>
                    </div>
                    {subtotal > 0 && (
                      <div className="text-sm text-gray-600">
                        <p>Original Total: ₦{subtotal.toLocaleString()}</p>
                        <p className="font-medium text-green-600">
                          You Save: ₦{(subtotal - discountedSubtotal).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Shipping and taxes are calculated at checkout.
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      closeCart();
                      navigate('/cart');
                    }}
                    disabled={!hasItems}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                    <FiArrowRight />
                  </button>
                  <button
                    onClick={handleCheckoutWhatsApp}
                    disabled={!hasItems}
                    className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Checkout via WhatsApp
                  </button>
                  <button
                    onClick={clearCart}
                    disabled={!hasItems}
                    className="w-full px-4 py-3 rounded-lg border font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }