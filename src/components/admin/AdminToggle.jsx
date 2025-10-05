import { useState, useEffect } from 'react';
import { FaUserShield, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const AdminToggle = ({ isAdmin, onToggle, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-16 bg-green-600 text-white rounded-l-lg shadow-lg hover:bg-green-700 transition-colors duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-10'
        }`}
      >
        {isOpen ? (
          <FaChevronRight className="w-5 h-5" />
        ) : (
          <FaUserShield className="w-5 h-5" />
        )}
      </button>

      <div
        className={`fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-80 p-4 overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Admin Dashboard
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminToggle;
