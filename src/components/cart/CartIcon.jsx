import { FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';

const CartIcon = ({ onClick, className = '' }) => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-700 hover:text-emerald-600 transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <FaShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </motion.span>
      )}
    </button>
  );
};

export default CartIcon;
