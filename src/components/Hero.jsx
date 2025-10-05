import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiArrowRight, FiShoppingBag, FiAward, FiGlobe } from 'react-icons/fi';
import Navbar from './Navbar';
gsap.registerPlugin(ScrollTrigger);

// Define animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Stats data
const STATS_DATA = [
  { icon: FiGlobe, stat: "50+", label: "Countries Served" },
  { icon: FiAward, stat: "10K+", label: "Happy Customers" },
  { icon: FiShoppingBag, stat: "200+", label: "Products Available" },
];

const StatCard = ({ icon: Icon, stat, label }) => (
  <motion.div
    variants={fadeInUp}
    className="relative group bg-white/80 backdrop-blur-md rounded-2xl p-6 
               shadow-xl border border-green-100/50"
  >
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-lg bg-green-100 text-green-600 
                     group-hover:bg-green-600 group-hover:text-white 
                     transition-colors duration-300">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat}</h3>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  </motion.div>
);
const WHATSAPP_NUMBER = '+2348055748661'; // Replace with your actual WhatsApp number
const WHATSAPP_MESSAGE = 'Hello! I came from your website and i would love to order from you.';

const generateWhatsAppLink = () => {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};
export default function Hero() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero text
      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      // Animate stats
      gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top center+=100",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen pt-32 pb-16 overflow-hidden 
                 bg-gradient-to-b from-green-50/50 to-white"
    >
      <motion.div 
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-green-100/80 backdrop-blur-sm text-green-700 mb-8"
          >
            <FiAward className="text-lg" />
            <span className="text-sm font-medium">Premium Nigerian Cuisine</span>
          </motion.div>

          <h1 
            ref={textRef}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 
                     leading-tight mb-8 max-w-4xl"
          >
            Experience Authentic African Flavors Delivered to Your Doorstep
          </h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12"
          >
            Bringing the rich tastes of Nigeria to food lovers worldwide. 
            Premium ingredients, traditional recipes, global delivery.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href={generateWhatsAppLink()}>
               <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-3 bg-green-600 
                       text-white px-8 py-4 rounded-full text-lg font-medium 
                       shadow-xl shadow-green-600/20 hover:bg-green-50 hover:text-green-600
                       transition-all duration-300"
             >
              <FiShoppingBag className="text-xl" />
              <span>Start Shopping</span>
              <FiArrowRight className="text-xl" />
            </motion.button>

            </a>
           
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-8 py-4 
                       rounded-full text-lg font-medium border-2 border-green-200 
                       text-green-700 hover:bg-green-600 hover:text-white transition-all duration-300"
            >
              View Our Products
            </motion.button>
          </motion.div>
        </div>

        <div className="stats-section grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STATS_DATA.map((item, index) => (
            <StatCard key={index} {...item} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}