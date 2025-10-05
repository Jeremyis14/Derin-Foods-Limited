import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiInstagram, 
  FiTwitter, 
  FiFacebook, 
  FiLinkedin 
} from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  {
    name: 'Instagram',
    icon: FiInstagram,
    url: 'https://instagram.com/deerinfoodslimited',
    color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500'
  },
  {
    name: 'Twitter',
    icon: FiTwitter,
    url: 'https://twitter.com/derinfoods',
    color: 'hover:bg-blue-400'
  },
  {
    name: 'Facebook',
    icon: FiFacebook,
    url: 'https://facebook.com/derinfoods',
    color: 'hover:bg-blue-600'
  },
  {
    name: 'LinkedIn',
    icon: FiLinkedin,
    url: 'https://linkedin.com/company/derinfoods',
    color: 'hover:bg-blue-700'
  }
];

const SocialButton = ({ icon: Icon, url, color, name }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center gap-3 px-6 py-3 rounded-full border 
              border-gray-200 hover:text-white ${color} transition-all duration-300`}
  >
    <Icon size={20} />
    <span>{name}</span>
  </motion.a>
);

export default function Contact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(".contact-header", {
        scrollTrigger: {
          trigger: ".contact-header",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8
      });

      // Animate contact info
      gsap.from(".contact-info div", {
        scrollTrigger: {
          trigger: ".contact-info",
          start: "top 75%",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2
      });

      // Animate social buttons
      gsap.from(".social-buttons a", {
        scrollTrigger: {
          trigger: ".social-buttons",
          start: "top 75%",
        },
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="contact-header text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our products or services? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="contact-info space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <FiMail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">@derineleran@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <FiPhone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+234 805 574 8661</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                  <FiMapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                </div>
              </div>
            </div>

            <div className="social-buttons grid grid-cols-1 gap-4">
              {socialLinks.map((social) => (
                <SocialButton key={social.name} {...social} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}