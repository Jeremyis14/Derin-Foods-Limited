import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiHome, FiPackage, FiGlobe, FiHeart } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FiHome,
    title: "Authentic Nigerian Taste",
    description: "We source our ingredients directly from local Nigerian markets and farmers to ensure authentic flavors in every package."
  },
  {
    icon: FiPackage,
    title: "Premium Packaging",
    description: "Our products are carefully packaged to maintain freshness during international shipping, bringing the true taste of home to your doorstep."
  },
  {
    icon: FiGlobe,
    title: "Global Delivery",
    description: "We ship to Nigerians worldwide, maintaining a reliable supply chain that reaches across continents."
  },
  {
    icon: FiHeart,
    title: "Community Connection",
    description: "More than just food, we're building a community of Nigerians abroad who share a love for our rich culinary heritage."
  }
];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from(".hero-text", {
        scrollTrigger: {
          trigger: ".hero-text",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2
      });

      // Feature cards animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 70%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15
      });

      // Stats animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 75%",
        },
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.2
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-br from-green-900 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Nigerian Food Pattern" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="hero-text max-w-2xl py-16">
            <h1 className="text-5xl font-bold mb-6">Bringing Nigeria's Finest Flavors to You</h1>
            <p className="text-xl text-green-100">
              Since 2018, Derin Foods has been bridging the gap between Nigerians abroad 
              and the authentic tastes of home. Every package we send carries not just food, 
              but memories, culture, and connection.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Adding food-related images */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card bg-white rounded-xl p-6 shadow-xl border border-green-100 relative overflow-hidden"
                whileHover={{ y: -5 }}
              >
                {/* Add small background images to cards */}
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <img 
                    src={[
                      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3",
                      "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?ixlib=rb-4.0.3",
                      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3",
                      "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?ixlib=rb-4.0.3"
                    ][index]}
                    alt=""
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="relative z-10">
                  <feature.icon className="text-3xl text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stat-item text-center">
              <h3 className="text-4xl font-bold text-green-600 mb-2">50,000+</h3>
              <p className="text-gray-600">Packages Delivered</p>
            </div>
            <div className="stat-item text-center">
              <h3 className="text-4xl font-bold text-green-600 mb-2">25+</h3>
              <p className="text-gray-600">Countries Reached</p>
            </div>
            <div className="stat-item text-center">
              <h3 className="text-4xl font-bold text-green-600 mb-2">98%</h3>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
