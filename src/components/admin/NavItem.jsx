import React from 'react';
import { Link } from 'react-router-dom';

const NavItem = ({ to, icon, children, isActive = false, onClick = () => {}, count = null }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20'
        : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white hover:translate-x-1'
    }`}
  >
    <span className={`mr-3 ${isActive ? 'text-white' : 'text-emerald-300 group-hover:text-emerald-100'}`}>
      {icon}
    </span>
    <span className="flex-1">{children}</span>
    {count !== null && (
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? 'bg-white/20' : 'bg-emerald-600/50 group-hover:bg-emerald-500/70'
      }`}>
        {count}
      </span>
    )}
  </Link>
);

export default NavItem;
