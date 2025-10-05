import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    itemsPrice, 
    shippingPrice, 
    totalPrice, 
    removeFromCart, 
    updateQuantity 
  } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isClient) {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
    
    return () => {
      if (isClient) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, isClient]);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { type: 'spring', damping: 30, stiffness: 300 }
    },
    exit: { 
      x: '100%',
      transition: { type: 'spring', damping: 30, stiffness: 300 }
    }
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <FaShoppingCart className="mr-2 text-emerald-600" />
                Your Cart
                {cartItems.length > 0 && (
                  <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {cartItems.reduce((a, c) => a + c.quantity, 0)}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close cart"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FaShoppingCart className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-center mb-6">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product} className="flex items-start py-4 border-b">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-emerald-600 font-semibold">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="mt-2 flex items-center">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product, item.quantity + 1)}
                              className={`px-2 py-1 text-gray-600 hover:bg-gray-100 ${
                                item.quantity >= item.countInStock ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              disabled={item.quantity >= item.countInStock}
                              aria-label="Increase quantity"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product)}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-emerald-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full bg-emerald-600 text-white py-3 px-4 rounded-md text-center font-medium hover:bg-emerald-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <div className="mt-3 text-center text-sm text-gray-500">
                  or{' '}
                  <button
                    onClick={onClose}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
