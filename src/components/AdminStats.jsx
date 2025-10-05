import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBox, FiPackage, FiAlertTriangle, FiDollarSign, FiPieChart,
  FiDownload, FiUploadCloud, FiLock, FiUser, FiTrendingUp,
  FiActivity, FiShoppingCart, FiClock
} from 'react-icons/fi';

// Catalog storage interop (matches prior admin inventory implementation)
const CATALOG_STORAGE_KEY = 'catalog:v1';
const CATALOG_EVT = 'catalog:updated';

function loadCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCatalog(list) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CATALOG_EVT, { detail: list }));
  } catch {}
}

function toCsv(rows) {
  const header = Object.keys(rows[0] || { id: '', name: '', category: '', price: '', stock: '' });
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    header.join(','),
    ...rows.map(r => header.map(k => escape(r[k])).join(',')),
  ];
  return lines.join('\n');
}

function downloadBlob(filename, content, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMoney(amount, currency = 'NGN', locale = 'en-NG') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

// Authentication configuration
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'derin2025' // In production, use proper authentication
};

// Enhanced Card Component with Animations
const StatCard = ({ icon: Icon, label, value, color = 'text-gray-800', accent = 'bg-gray-50', iconAccent = 'text-gray-700' }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`p-6 rounded-2xl border ${accent} flex items-center gap-4 relative overflow-hidden`}
  >
    <div className={`p-3 rounded-xl bg-white border ${iconAccent}`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-5">
      <Icon size={80} />
    </div>
  </motion.div>
);

// Login Form Component
const LoginForm = ({ onLogin, error }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
    >
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900">Admin Access</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the admin dashboard
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={onLogin}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiUser className="text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Username"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Password"
              />
            </div>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Sign in
        </motion.button>
      </form>
    </motion.div>
  </motion.div>
);

// Main AdminStats Component
export default function AdminStatsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [products, setProducts] = useState(() => loadCatalog());
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Please try again.');
    }
  };

  // react to external inventory updates (e.g., via Inventory editor)
  useEffect(() => {
    const onChange = (e) => setProducts(Array.isArray(e?.detail) ? e.detail : loadCatalog());
    window.addEventListener(CATALOG_EVT, onChange);
    return () => window.removeEventListener(CATALOG_EVT, onChange);
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    let totalUnits = 0;
    let lowStockCount = 0;
    let inventoryValue = 0;

    for (const p of products) {
      const stock = Number(p.stock || 0);
      const price = Number(p.price || 0);
      totalUnits += stock;
      if (p.inStock && stock <= 5) lowStockCount += 1;
      inventoryValue += stock * price;
    }

    const categories = new Map();
    for (const p of products) {
      const key = p.category || 'Uncategorized';
      const entry = categories.get(key) || { count: 0, units: 0, value: 0 };
      entry.count += 1;
      entry.units += Number(p.stock || 0);
      entry.value += (Number(p.stock || 0) * Number(p.price || 0));
      categories.set(key, entry);
    }

    const byCategory = Array.from(categories.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.units - a.units);

    // Top low-stock items
    const lowStockItems = products
      .filter(p => (p.inStock && (Number(p.stock || 0) <= 5)))
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 10);

    return { totalProducts, totalUnits, lowStockCount, inventoryValue, byCategory, lowStockItems };
  }, [products]);

  const handleExportInventoryCsv = () => {
    const rows = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category || '',
      price: Number(p.price || 0),
      stock: Number(p.stock || 0),
    }));
    downloadBlob('inventory.csv', toCsv(rows));
  };

  const handleImportCatalog = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Expected an array');
      // minimal normalize
      const normalized = data.map(it => ({
        id: String(it.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        name: String(it.name ?? 'Unnamed'),
        category: String(it.category ?? ''),
        price: Math.max(0, Number(it.price) || 0),
        stock: Math.max(0, Number(it.stock) || 0),
        inStock: it.inStock ?? ((Number(it.stock) || 0) > 0),
        image: it.image || '',
        description: it.description || '',
        sku: it.sku || '',
        weight: it.weight || '',
        volume: it.volume || '',
      }));
      saveCatalog(normalized);
      setProducts(normalized);
    } catch (e) {
      alert('Invalid JSON file');
    }
  };

  // Additional stats calculations
  const additionalStats = useMemo(() => {
    return {
      revenueGrowth: '+15.3%',
      activeOrders: '23',
      avgOrderValue: formatMoney(150),
      customerSatisfaction: '4.8/5'
    };
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your store's performance</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Sign Out
            </motion.button>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-50 cursor-pointer">
              <FiUploadCloud />
              <span>Import</span>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImportCatalog(e.target.files?.[0])}
              />
            </label>
            <button
              onClick={handleExportInventoryCsv}
              className="px-3 py-2 rounded-full border hover:bg-gray-50 inline-flex items-center gap-2"
              title="Export inventory as CSV"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white p-1 rounded-lg border w-fit">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedTimeRange === range 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={FiActivity} 
            label="Revenue Growth" 
            value={additionalStats.revenueGrowth}
            color="text-green-600"
            accent="bg-green-50"
            iconAccent="text-green-500"
          />
          <StatCard 
            icon={FiShoppingCart} 
            label="Active Orders" 
            value={additionalStats.activeOrders}
          />
          <StatCard 
            icon={FiTrendingUp} 
            label="Avg Order Value" 
            value={additionalStats.avgOrderValue}
          />
          <StatCard 
            icon={FiClock} 
            label="Customer Rating" 
            value={additionalStats.customerSatisfaction}
            color="text-blue-600"
            accent="bg-blue-50"
            iconAccent="text-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={FiBox} label="Total products" value={stats.totalProducts} />
          <StatCard icon={FiPackage} label="Total units" value={stats.totalUnits} />
          <StatCard
            icon={FiAlertTriangle}
            label="Low stock"
            value={stats.lowStockCount}
            color="text-orange-700"
            accent="bg-orange-50"
            iconAccent="text-orange-600 border-orange-200"
          />
          <StatCard
            icon={FiDollarSign}
            label="Inventory value"
            value={formatMoney(stats.inventoryValue)}
            color="text-green-700"
            accent="bg-green-50"
            iconAccent="text-green-600 border-green-200"
          />
        </div>

        {/* Category breakdown */}
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiPieChart className="text-green-600" />
            <h3 className="text-lg font-semibold">Category breakdown</h3>
          </div>
          {stats.byCategory.length === 0 && (
            <div className="text-sm text-gray-600">No products found. Import a catalog to get started.</div>
          )}
          {stats.byCategory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.byCategory.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-3 p-3 rounded-xl border">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      {c.count} product{c.count === 1 ? '' : 's'} • {c.units} unit{c.units === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{formatMoney(c.value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock table */}
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="text-orange-600" />
            <h3 className="text-lg font-semibold">Low stock alerts</h3>
          </div>
          {stats.lowStockItems.length === 0 ? (
            <div className="text-sm text-gray-600">No low stock items. Great job keeping inventory healthy!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Stock</th>
                    <th className="px-4 py-2 text-right">Stock value</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockItems.map((p) => {
                    const price = Number(p.price || 0);
                    const stock = Number(p.stock || 0);
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || '/images/placeholder.png'}
                              alt={p.name}
                              className="w-10 h-10 rounded object-cover bg-gray-100"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[240px]">{p.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[280px]">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{p.category || '-'}</td>
                        <td className="px-4 py-2 text-right">{formatMoney(price)}</td>
                        <td className="px-4 py-2 text-right">{stock}</td>
                        <td className="px-4 py-2 text-right">{formatMoney(price * stock)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}