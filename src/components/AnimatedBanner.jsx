import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FiGlobe, FiPackage, FiTruck } from 'react-icons/fi';

const SHIPPING_INFO = [
  {
    icon: <FiGlobe />,
    country: "United States",
    flag: "🇺🇸",
    delivery: "2-3 Days Express"
  },
  {
    icon: <FiTruck />,
    country: "United Kingdom",
    flag: "🇬🇧",
    delivery: "Next Day"
  },
  {
    icon: <FiPackage />,
    country: "Canada",
    flag: "🇨🇦",
    delivery: "Express Shipping"
  },
  {
    icon: <FiGlobe />,
    country: "Australia",
    flag: "🇦🇺",
    delivery: "3-5 Days"
  }
];

const ShippingItem = ({ icon, country, flag, delivery }) => (
  <div className="inline-flex items-center gap-4 min-w-[300px] px-8">
    <div className="flex items-center justify-center w-10 h-10 rounded-full 
                    bg-green-600/20 text-white">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-base font-semibold text-white whitespace-nowrap">
        <span className="mr-2">{flag}</span>
        {country}
      </span>
      <span className="text-sm text-green-200">
        {delivery}
      </span>
    </div>
  </div>
);

export default function MarqueeSlider() {
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = () => {
      controls.start({
        x: [0, -1500], // Adjusted based on content width
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30, // Slowed down for better readability
            ease: "linear",
          },
        },
      });
    };

    startAnimation();
    return () => controls.stop();
  }, [controls]);

  const handleHover = (hovering) => {
    setIsPaused(hovering);
    if (hovering) {
      controls.stop();
    } else {
      controls.start({
        x: [parseInt(controls.get("x")), -1500],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        },
      });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-green-800 via-green-700 
                    to-green-800 overflow-hidden">
      {/* Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r 
                    from-green-800 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l 
                    from-green-800 to-transparent z-10" />

      {/* Marquee Content */}
      <div 
        className="relative flex overflow-hidden py-4"
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <motion.div 
          className="flex items-center gap-8"
          animate={controls}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex">
              {SHIPPING_INFO.map((info, index) => (
                <ShippingItem key={`${i}-${index}`} {...info} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}