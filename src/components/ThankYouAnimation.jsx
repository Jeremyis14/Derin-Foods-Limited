import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ThankYouAnimation = ({ orderId, onClose, autoCloseDelay = 5000 }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);

  const handleViewOrder = () => {
    navigate(`/orders/${orderId}`);
    onClose?.();
  };

  const handleContinueShopping = () => {
    navigate('/products');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti effect */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              x: Math.random() * 400 - 200,
              y: -100,
              scale: Math.random() * 0.5 + 0.5,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: [0, 800],
              x: [
                0,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 200,
              ],
              opacity: [1, 1, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'easeInOut',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <FaCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully.
            {orderId && (
              <span className="block mt-1 text-sm">
                Order ID: <span className="font-mono font-semibold">{orderId}</span>
              </span>
            )}
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button
              onClick={handleViewOrder}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaShoppingBag />
              <span>View Order</span>
            </button>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700"
          >
            Close this message
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYouAnimation;
