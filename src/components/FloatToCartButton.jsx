import React from 'react';
  import { motion } from 'framer-motion';
  import { FiShoppingCart } from 'react-icons/fi';
  import { useCart } from '../context/CartContext';

  export default function FloatingCartButton() {
    const { count, toggleCart } = useCart();

    return (
      <motion.button
        onClick={toggleCart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[65] rounded-full bg-green-600 text-white shadow-lg shadow-green-600/30 hover:bg-green-500 px-5 py-4 flex items-center gap-3"
        aria-label="Open cart"
      >
        <FiShoppingCart size={20} />
        <span className="text-sm font-semibold">{count}</span>
      </motion.button>
    );
  }