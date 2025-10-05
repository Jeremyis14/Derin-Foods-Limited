import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const socialIcons = [
  {
    icon: FiInstagram,
    href: 'https://instagram.com/derinfoods',
    color: 'hover:text-pink-500',
    label: 'Follow us on Instagram'
  },
  {
    icon: FiTwitter,
    href: 'https://twitter.com/derinfoods',
    color: 'hover:text-blue-400',
    label: 'Follow us on Twitter'
  },
  {
    icon: FiFacebook,
    href: 'https://facebook.com/derinsolashotunde',
    color: 'hover:text-blue-600',
    label: 'Like us on Facebook'
  }
];
const IconLink = ({ icon: Icon, href, color, label }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.2, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
    className={`p-2 transition-colors duration-300 ${color}`}
    aria-label={label}
  >
    <Icon size={20} />
  </motion.a>
);


export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-green-900 to-green-950 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Deerin Foods</h2>
            <p className="text-gray-300 leading-relaxed">
              Bringing authentic Nigerian flavors to your doorstep. Quality ingredients, 
              traditional recipes, worldwide delivery.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Products', 'About Us', 'Reviews'].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="hover:text-green-400 transition-colors"
                >
                  <a href={`#${item.toLowerCase()}`}>{item}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-3">
              <motion.a 
                href="mailto:info@derinfoods.com"
                className="flex items-center gap-3 hover:text-green-400 transition-colors"
                whileHover={{ x: 5 }}
              >
                <FiMail /> derineleran@gmail.com
              </motion.a>
              <motion.a 
                href="tel:+1234567890"
                className="flex items-center gap-3 hover:text-green-400 transition-colors"
                whileHover={{ x: 5 }}
              >
                <FiPhone /> +234 805 574 8661
              </motion.a>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
              >
                <FiMapPin /> Lagos, Nigeria
              </motion.div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Subscribe for updates and exclusive offers
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-green-800/50 border border-green-700 
                         focus:outline-none focus:ring-2 focus:ring-green-500 
                         placeholder:text-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-green-600 rounded-lg font-medium 
                         hover:bg-green-500 transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Social Links & Copyright */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-16 pt-8 border-t border-green-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6">
             {socialIcons.map((social, index) => (
              <IconLink key={index} {...social} />
            ))}
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Derin Foods. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}