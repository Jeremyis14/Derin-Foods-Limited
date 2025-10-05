import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../auth/UserAuth';

export function AdminGate({ children }) {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this area.</p>
        </div>
      </motion.div>
    );
  }

  return children;
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  VIEW_STATS: ['super_admin', 'admin', 'editor', 'viewer'],
  EDIT_PRODUCTS: ['super_admin', 'admin', 'editor'],
  DELETE_PRODUCTS: ['super_admin', 'admin'],
  MANAGE_USERS: ['super_admin', 'admin'],
  VIEW_FINANCIALS: ['super_admin', 'admin'],
};

export function usePermissions() {
  const { user } = useUser();
  
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return PERMISSIONS[permission]?.includes(user.role) || false;
  };

  return { hasPermission };
}