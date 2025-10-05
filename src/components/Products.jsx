import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiShoppingCart, FiStar, FiChevronRight } from 'react-icons/fi';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    id: 1,
    name: "Premium Dried Roundabout",
    price: 19.99,
    rating: 4.8,
    reviews: 128,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQrb7SyNRw3HUyoVYeH731251Tb75CABq11g&s",
    category: "Fried Roundabout",
  },
  {
    id: 2,
    name: "Nigerian Ponmo",
    price: 15.99,
    rating: 4.9,
    reviews: 256,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKrbpIwYcmEkQe2Ird1RKvivaPdprK1RPtpw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKrbpIwYcmEkQe2Ird1RKvivaPdprK1RPtpw&s",
    category: "Raw Foods",
  },
  {
    id: 3,
    name: "Fried Meat",
    price: 24.99,
    rating: 4.7,
    reviews: 94,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs4UJ_PGR45_rXrGeZsveK6DvIp6EKVLpj5Q&s",
    category: "Prepared",
  },
  // Add more products as needed
];

const ProductCard = ({ product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    whileHover={{ y: -10 }}
    className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
  >
    <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
      />
      <span className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
        {product.category}
      </span>
    </div>

    <div className="space-y-2">
      <h3 className="font-semibold text-xl text-gray-800">{product.name}</h3>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center text-yellow-400">
          <FiStar className="fill-current" />
          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
        </div>
        <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-2xl font-bold text-gray-900">${product.price}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 
                   hover:text-white transition-colors duration-300"
        >
          <FiShoppingCart size={20} />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

export default function Products() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section-title", {
        scrollTrigger: {
          trigger: ".section-title",
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-green-600 font-medium"
          >
            Our Products
          </motion.span>
          
          <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Authentic Nigerian Flavors
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium Nigerian food products, 
            spices, and meal kits delivered right to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 
                     rounded-full text-lg font-medium shadow-xl shadow-green-600/20 
                     hover:bg-green-500 transition-all duration-300"
          >
            View All Products
            <FiChevronRight />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// In your checkout component or wherever you trigger order creation
function CheckoutButton() {
  const { createOrder } = useCart();
  const navigate = useNavigate(); // Use useNavigate here where it's safe

  const handleCheckout = () => {
    const orderId = createOrder();
    if (orderId) {
      navigate(`/order/${orderId}`);
    }
  };

  return (
    <button onClick={handleCheckout}>
      Checkout
    </button>
  );
}