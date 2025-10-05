import React from 'react';
  import { motion } from 'framer-motion';
  import { FiShoppingBag } from 'react-icons/fi';
  import { useCart } from '../context/CartContext';

  export default function AddToCartButton({ product, quantity = 1, className = '' }) {
    const { addItem, openCart } = useCart();

    const handleAdd = () => {
      addItem(product, quantity);
      openCart();
    };

    return (
      <motion.button
        onClick={handleAdd}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full font-medium ${className}`}
      >
        <FiShoppingBag />
        Add to Cart
      </motion.button>
    );
  }