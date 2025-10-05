import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiStar, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const REVIEWS = [
  {
    id: 1,
    name: "Omotola Johnson",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1602342323893-b11f757957c9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "The authentic Nigerian spices from Derin Foods bring back memories of home. The quality is exceptional, and delivery was faster than expected!",
    product: "Jollof Rice Mix"
  },
  {
    id: 2,
    name: "Michael Abiodun",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1594564190328-0bed16a89837?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "Never had Nigerian food before, but the meal kits made it so easy to prepare. The flavors are incredible! Highly recommend the Egusi soup kit.",
    product: "Egusi Soup Kit"
  },
  {
    id: 3,
    name: "Muyiwa Daniels",
    location: "Dubai, UAE",
    image: "https://plus.unsplash.com/premium_photo-1690359589674-b85931ae8d28?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "The packaging is excellent, everything arrives fresh. The Suya spice is perfectly blended - just like what I remember from Lagos!",
    product: "Suya Spice"
  }
];

const ReviewCard = ({ review, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 
               hover:shadow-2xl transition-shadow duration-300"
  >
    <div className="flex items-start gap-4 mb-4">
      <motion.img
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        src={review.image}
        alt={review.name}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-green-500"
      />
      <div>
        <h4 className="font-semibold text-gray-900">{review.name}</h4>
        <p className="text-sm text-gray-500">{review.location}</p>
      </div>
    </div>

    <div className="flex items-center gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${
            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>

    <p className="text-gray-600 mb-4">{review.text}</p>

    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">Verified Purchase</span>
      <span className="text-sm font-medium text-green-600">{review.product}</span>
    </div>
  </motion.div>
);

export default function Reviews() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reviews-title", {
        scrollTrigger: {
          trigger: ".reviews-title",
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden">
      <motion.div
        ref={containerRef}
        style={{ y }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-green-600 font-medium"
          >
            Customer Reviews
          </motion.span>
          
          <h2 className="reviews-title text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
            What Our Customers Say
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Derin Foods for their 
            authentic Nigerian cuisine needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-600 
                     hover:text-white transition-colors duration-300"
          >
            <FiArrowLeft size={24} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-600 
                     hover:text-white transition-colors duration-300"
          >
            <FiArrowRight size={24} />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}