import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaDollarSign,
  FaShip,
  FaGlobe,
  FaWeight,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaDownload,
  FaBoxOpen
} from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Minimal glass card wrapper
 */
const GlassCard = ({ children, className = '' }) => (
    <div className={`rounded-2xl border border-white/20 bg-white/60 backdrop-blur-md shadow-lg ${className}`}>
      {children}
    </div>
);

/**
 * Header section with subtle glass and actions
 */
const Header = ({ timeRange, setTimeRange, onRefresh, isRefreshing }) => (
    <GlassCard className="px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
            DEERIN FOODS LIMITED
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">Export Operations Dashboard</p>
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-xs sm:text-sm text-slate-500">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Live
          </span>
            <span className="hidden xs:inline">•</span>
            <span>{new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-white/60 backdrop-blur rounded-xl border border-white/20 p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
                ${timeRange === range ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}
              `}
                >
                  {range}
                </button>
            ))}
          </div>
          <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-white/20 bg-white/60 backdrop-blur text-slate-600 hover:text-slate-800 hover:bg-white transition-colors"
              title="Refresh"
              aria-label="Refresh"
          >
            <FaSync className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
              className="p-2 rounded-xl border border-white/20 bg-white/60 backdrop-blur text-slate-600 hover:text-slate-800 hover:bg-white transition-colors"
              title="Download report"
              aria-label="Download report"
          >
            <FaDownload className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GlassCard>
);

/**
 * Stat card - single accent color, minimal
 */
const StatCard = ({ stat, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-500">{stat.name}</p>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
          <div className="text-right">
          <span className={`inline-flex items-center text-xs sm:text-sm font-medium
            ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}
          `}>
            {stat.changeType === 'increase' ? (
                <FaArrowUp className="w-3 h-3 mr-1" />
            ) : (
                <FaArrowDown className="w-3 h-3 mr-1" />
            )}
            {stat.change}
          </span>
            <div className="text-[10px] sm:text-xs text-slate-400">{stat.period}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
);

/**
 * Order card - compact and mobile-first
 */
const OrderCard = ({ order, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
    >
      <GlassCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FaShip className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-medium text-slate-900 text-sm truncate">{order.id}</h4>
                <span className="text-xs text-slate-500">{order.country}</span>
              </div>
              <p className="text-sm text-slate-700 truncate">{order.customer}</p>
              <p className="text-xs text-slate-500 truncate">{order.items}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>{order.weight}</span>
                <span>•</span>
                <span>{order.time}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
            {order.status}
          </span>
            <p className="font-semibold text-slate-900 mt-2">{order.total}</p>
            <p className="text-[11px] text-slate-500">{order.profit} profit</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
);

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentOrders: [],
    popularItems: [],
    lowStockItems: [],
    notifications: [],
    marketTrends: [],
    loading: true,
    error: null
  });

  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsRefreshing(true);
        // Attempt to fetch real data if token exists
        const token = localStorage.getItem('token');

        if (token) {
          // Get API base URL with proper fallbacks
          const getApiBaseUrl = () => {
            const viteUrl = import.meta.env?.VITE_API_BASE;
            const craUrl = process.env?.REACT_APP_API_URL;

            if (viteUrl) return viteUrl;
            if (craUrl) return craUrl;

            // Always use Render deployment URL for production
            return 'https://derin-foods-limited.onrender.com';
          };

          const base = getApiBaseUrl();
          const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

          // Fetch stats and recent orders in parallel
          const [statsRes, recentRes] = await Promise.all([
            fetch(`${base}/dashboard/stats`, { headers }),
            fetch(`${base}/dashboard/recent-orders?limit=8`, { headers }),
          ]);

          if (statsRes.ok) {
            const s = await statsRes.json();
            // Map server response to UI stats
            const nf = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
            const pf = (v) => `${v}`;

            const statsMapped = [
              {
                name: 'Total Revenue',
                value: nf.format(s.totalRevenue || 0),
                icon: FaDollarSign,
                change: pf(s.revenueChange || '+0%'),
                changeType: (s.revenueChange || '+0%').startsWith('+') ? 'increase' : 'decrease',
                period: 'vs prev period',
              },
              {
                name: 'Total Orders',
                value: String(s.totalOrders || 0),
                icon: FaShip,
                change: pf(s.ordersChange || '+0%'),
                changeType: (s.ordersChange || '+0%').startsWith('+') ? 'increase' : 'decrease',
                period: 'vs prev period',
              },
              {
                name: 'Active Users',
                value: String(s.activeUsers || 0),
                icon: FaGlobe,
                change: pf(s.usersChange || '+0%'),
                changeType: (s.usersChange || '+0%').startsWith('+') ? 'increase' : 'decrease',
                period: 'vs prev period',
              },
              {
                name: 'Conversion Rate',
                value: `${s.conversionRate ?? 0}%`,
                icon: FaWeight,
                change: pf(s.conversionChange || '+0%'),
                changeType: (s.conversionChange || '+0%').startsWith('+') ? 'increase' : 'decrease',
                period: 'vs prev period',
              },
            ];

            setDashboardData((prev) => ({
              ...prev,
              stats: statsMapped,
            }));
          }

          if (recentRes.ok) {
            const orders = await recentRes.json();
            const nf = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
            const recentMapped = orders.map((o) => ({
              id: `#${o.id?.toString().slice(-6)}`,
              customer: o.user || 'Customer',
              country: '-',
              items: '-',
              total: nf.format(o.amount || 0),
              profit: '-',
              status: o.status || 'pending',
              time: new Date(o.date).toLocaleString(),
              weight: '-',
            }));

            setDashboardData((prev) => ({
              ...prev,
              recentOrders: recentMapped,
            }));
          }

          // Keep other sections empty until endpoints exist
          setDashboardData((prev) => ({
            ...prev,
            loading: false,
            error: null,
          }));
        } else {
          // No token: show clean empty dashboard without samples
          setDashboardData((prev) => ({
            ...prev,
            stats: [],
            recentOrders: [],
            popularItems: [],
            lowStockItems: [],
            notifications: [],
            marketTrends: [],
            loading: false,
            error: null,
          }));
        }
        setIsRefreshing(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData((prev) => ({
          ...prev,
          error: 'Failed to load dashboard data',
          loading: false
        }));
        setIsRefreshing(false);
        // No toast for empty state
      }
    };

    fetchDashboardData();
  }, [timeRange, refreshKey]);

  const { stats, recentOrders, popularItems, lowStockItems, notifications, marketTrends, loading } = dashboardData;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="relative min-h-screen">
        {/* Subtle radial background and animated blob for a cool but minimal effect */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-slate-100 via-white to-slate-200" />
        <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-300/30 blur-3xl"
            animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-slate-400/20 blur-3xl"
            animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-8">
          <Header
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
          />

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {stats.length === 0 ? (
              <GlassCard className="p-6 sm:p-8 text-center text-slate-500 col-span-1 sm:col-span-2 xl:col-span-4">
                No statistics available yet. Once orders and users start flowing in, metrics will appear here.
              </GlassCard>
            ) : (
              stats.map((stat, index) => (
                <StatCard key={stat.name} stat={stat} index={index} />
              ))
            )}
          </div>

          {/* Main Grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <GlassCard>
                <div className="p-4 sm:p-5 border-b border-white/20">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recent Export Orders</h3>
                      <p className="text-xs sm:text-sm text-slate-500">Latest international shipments</p>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-xs sm:text-sm font-medium"
                    >
                      <span>View all</span>
                      <FaEye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  {recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No recent orders yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order, index) => (
                        <OrderCard key={order.id} order={order} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <GlassCard>
                <div className="p-4 sm:p-5 border-b border-white/20">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Quick Actions</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Manage your store</p>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 gap-2">
                  <Link to="/admin/products" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm text-center hover:bg-emerald-700">Manage Products</Link>
                  <Link to="/admin/orders" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm text-center hover:bg-slate-800">Manage Orders</Link>
                  <Link to="/admin/settings" className="px-4 py-2 rounded-xl bg-white/70 border border-white/20 text-slate-700 text-sm text-center hover:bg-white">Settings</Link>
                </div>
              </GlassCard>
              {/* Notifications */}
              <GlassCard>
                <div className="p-4 sm:p-5 border-b border-white/20">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Notifications</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Recent updates</p>
                </div>
                <div className="p-4 sm:p-5">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No notifications.</div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm">
                          <p className="text-sm text-slate-900">{notification.message}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span>{notification.time}</span>
                            {notification.amount && (
                              <span className="font-medium text-emerald-700">{notification.amount}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Low stock */}
              <GlassCard>
                <div className="p-4 sm:p-5 border-b border-white/20">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Inventory Alerts</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Low stock items</p>
                </div>
                <div className="p-4 sm:p-5">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No low stock alerts.</div>
                  ) : (
                    <div className="space-y-3">
                      {lowStockItems.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.supplier}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">{item.stock}</p>
                              <p className="text-[11px] text-slate-500">of {item.minStock}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Last restock: {item.lastRestock}</span>
                            <button className="text*[11px] px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                              Restock
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Top products */}
          <div className="mt-6">
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">Top Export Products</h3>
                <p className="text-xs sm:text-sm text-slate-500">Best performing items this month</p>
              </div>
              <div className="p-4 sm:p-5">
                {popularItems.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No top products yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    {popularItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <FaBoxOpen className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-emerald-700">{item.growth}</span>
                        </div>
                        <h4 className="font-medium text-slate-900">{item.name}</h4>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Orders</span>
                            <span className="font-medium text-slate-900">{item.orders}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Revenue</span>
                            <span className="font-semibold text-emerald-700">{item.revenue}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {item.countries.slice(0, 3).map((country, idx) => (
                            <span key={idx} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                              {country}
                            </span>
                          ))}
                          {item.countries.length > 3 && (
                            <span className="text-[11px] text-slate-500">+{item.countries.length - 3}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Market trends - minimal */}
          <div className="mt-6">
            <GlassCard>
              <div className="p-4 sm:p-5 border-b border-white/20">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">Market Trends</h3>
                <p className="text-xs sm:text-sm text-slate-500">Export demand by country</p>
              </div>
              <div className="p-4 sm:p-5">
                {marketTrends.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No market trend data.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    {marketTrends.map((trend, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 rounded-xl border border-white/20 bg-white/50 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{trend.country}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">{trend.demand}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Growth</span>
                            <span className="font-medium text-emerald-700">{trend.growth}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Revenue</span>
                            <span className="font-semibold text-slate-900">{trend.value}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                              </div>
            </GlassCard>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;