import React from 'react';
import { motion } from 'framer-motion';

export default function CustomersPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow-lg">
        <div className="p-4 sm:p-6 border-b border-white/20">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Manage your customer base and activity</p>
        </div>
        <div className="p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center text-slate-500 dark:text-slate-400"
          >
            No customers to display yet.
          </motion.div>
        </div>
      </div>
    </div>
  );
}
