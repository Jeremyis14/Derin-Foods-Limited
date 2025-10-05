import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogProvider, useCatalog } from './CatalogProvider';
import BusinessSettings from '../components/admin/BusinessSettings';
import { 
  FiPackage, FiAlertTriangle, FiBox, FiDollarSign, FiSettings, 
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUpload, FiDownload,
  FiSearch, FiFilter, FiBarChart2, FiUsers, FiShoppingCart, FiTag, FiPieChart, FiCheckCircle
} from 'react-icons/fi';
// Simple stats display component
const StatCard = ({ title, value, icon: Icon, color = 'text-gray-800', bg = 'bg-gray-50', iconColor = 'text-gray-600' }) => (
  <div className={`p-4 rounded-2xl border ${bg} flex items-center gap-3`}>
    <div className={`p-2 rounded-lg bg-white border ${iconColor}`}>
      <Icon />
    </div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  </div>
);

// New component for product management
function ProductManager() {
  const { products, addProduct, updateProduct, removeProduct } = useCatalog();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const initialProductState = {
    id: '',
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    image: '',
    inStock: true,
    sku: '',
    weight: '',
    minimumStock: 5
  };

  const [formData, setFormData] = useState(initialProductState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      id: formData.id || Date.now().toString()
    };

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }

    setFormData(initialProductState);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleBulkPriceUpdate = (percentage) => {
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const newPrice = product.price * (1 + percentage / 100);
        updateProduct({
          ...product,
          price: Number(newPrice.toFixed(2))
        });
      }
    });
    setBulkEditMode(false);
    setSelectedProducts([]);
  };

  // CSV Export/Import functions
  const exportToCsv = () => {
    const headers = ['id,name,description,category,price,stock,image,inStock,sku,weight,minimumStock'];
    const csvData = products.map(p => 
      `${p.id},"${p.name}","${p.description}","${p.category}",${p.price},${p.stock},"${p.image}",${p.inStock},"${p.sku}","${p.weight}",${p.minimumStock}`
    );
    const csvContent = [...headers, ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const importFromCsv = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result.split('\n');
        const headers = csvData[0].split(',');
        const newProducts = csvData.slice(1).map(row => {
          const values = row.split(',');
          const product = {};
          headers.forEach((header, index) => {
            product[header.trim()] = values[index]?.trim() || '';
          });
          return product;
        });
        // Update catalog with new products
        newProducts.forEach(product => {
          if (product.id && product.name) {
            addProduct(product);
          }
        });
      };
      reader.readAsText(file);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [products, searchTerm, categoryFilter, sortConfig]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)].sort();
  }, [products]);

  // Chart data for product categories
  const categoryChartData = useMemo(() => {
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          label: 'Products by Category',
          data: Object.values(categoryCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [products]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-2 appearance-none bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                cat && <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex-1 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 px-4 py-2"
            >
              <FiPlus /> Add Product
            </motion.button>
            
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border border-gray-300 rounded-xl p-2 hover:bg-gray-50"
              >
                <FiDownload className="text-gray-600" />
              </motion.button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                <div className="py-1">
                  <button
                    onClick={exportToCsv}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export CSV
                  </button>
                  <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    Import CSV
                    <input type="file" accept=".csv" onChange={importFromCsv} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBulkEditMode(true)}
              className="bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 px-4 py-2"
            >
              <FiEdit2 /> Bulk Edit
            </motion.button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData(initialProductState);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="https://"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      setFormData(initialProductState);
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <FiSave />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiPackage size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.stock <= 5).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiAlertTriangle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiTag size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
                  products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
                )}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FiDollarSign size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
          <FiBarChart2 /> Inventory Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total Products" 
            value={products.length} 
            icon={FiPackage} 
            color="text-blue-700" 
            bg="bg-blue-50" 
            iconColor="text-blue-600 border-blue-200" 
          />
          <StatCard 
            title="Low Stock" 
            value={products.filter(p => p.stock <= 5).length} 
            icon={FiAlertTriangle} 
            color="text-red-700" 
            bg="bg-red-50" 
            iconColor="text-red-600 border-red-200" 
          />
          <StatCard 
            title="In Stock" 
            value={products.filter(p => p.stock > 5 && p.stock <= 20).length} 
            icon={FiCheckCircle} 
            color="text-green-700" 
            bg="bg-green-50" 
            iconColor="text-green-600 border-green-200" 
          />
          <StatCard 
            title="Overstocked" 
            value={products.filter(p => p.stock > 20).length} 
            icon={FiBox} 
            color="text-yellow-700" 
            bg="bg-yellow-50" 
            iconColor="text-yellow-600 border-yellow-200" 
          />
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Product
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.key === 'category' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center justify-end">
                    Price
                    {sortConfig.key === 'price' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('stock')}
                >
                  <div className="flex items-center justify-end">
                    Stock
                    {sortConfig.key === 'stock' && (
                      <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`${
                        product.stock <= 5 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit product"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              removeProduct(product.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete product"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Rest of your existing AdminPage code...
function StatsBar() {
  const { products } = useCatalog();

  const stats = useMemo(() => {
    const totalSKUs = products.length;
    let lowStock = 0;
    let totalUnits = 0;
    let inventoryValue = 0;

    for (const p of products) {
      const stock = Number(p.stock || 0);
      const price = Number(p.price || 0);
      if (p.inStock && stock <= 5) lowStock += 1;
      totalUnits += stock;
      inventoryValue += stock * price;
    }
    return { totalSKUs, lowStock, totalUnits, inventoryValue };
  }, [products]);

  const Stat = ({ icon: Icon, label, value, color = 'text-gray-800', bg = 'bg-gray-50', iconColor = 'text-gray-600' }) => (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${bg}`}>
      <div className={`p-2 rounded-lg bg-white border ${iconColor}`}>
        <Icon />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-lg font-semibold ${color} truncate`}>{value}</div>
      </div>
    </div>
  );

  const formatMoney = (v) => {
    try {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(v || 0);
    } catch {
      return `NGN ${Number(v || 0).toFixed(2)}`;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat icon={FiBox} label="Total products" value={stats.totalSKUs} />
      <Stat icon={FiPackage} label="Total units" value={stats.totalUnits} />
      <Stat icon={FiAlertTriangle} label="Low stock" value={stats.lowStock} color="text-orange-700" bg="bg-orange-50" iconColor="text-orange-600 border-orange-200" />
      <Stat icon={FiDollarSign} label="Inventory value" value={formatMoney(stats.inventoryValue)} color="text-green-700" bg="bg-green-50" iconColor="text-green-600 border-green-200" />
    </div>
  );
}

function AdminDashboardInner() {
  const [tab, setTab] = useState('inventory');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-green-600">ManagePro</h1>
          ) : (
            <div className="w-8 h-8 bg-green-600 rounded-lg"></div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {isSidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          <button
            onClick={() => setTab('inventory')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${tab === 'inventory' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiPackage className="text-lg" />
            {isSidebarOpen && <span>Inventory</span>}
          </button>
          
          <button
            onClick={() => setTab('analytics')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${tab === 'analytics' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiBarChart2 className="text-lg" />
            {isSidebarOpen && <span>Analytics</span>}
          </button>
          
          <button
            onClick={() => setTab('orders')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${tab === 'orders' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiShoppingCart className="text-lg" />
            {isSidebarOpen && <span>Orders</span>}
          </button>
          
          <button
            onClick={() => setTab('customers')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${tab === 'customers' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiUsers className="text-lg" />
            {isSidebarOpen && <span>Customers</span>}
          </button>
          
          <div className="border-t border-gray-200 my-2"></div>
          
          <button
            onClick={() => setTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg ${tab === 'settings' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiSettings className="text-lg" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
              {localStorage.getItem('userName')?.charAt(0) || 'A'}
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {localStorage.getItem('userName') || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {tab === 'inventory' && 'Inventory Management'}
                {tab === 'analytics' && 'Analytics Dashboard'}
                {tab === 'orders' && 'Order Management'}
                {tab === 'customers' && 'Customer Management'}
                {tab === 'settings' && 'Settings'}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 w-64 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  <FiAlertTriangle className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setTab('inventory')}
                  className={`px-4 py-2 rounded-full border ${tab === 'inventory' ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'}`}
                  aria-pressed={tab === 'inventory'}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setTab('settings')}
                  className={`px-4 py-2 rounded-full border ${tab === 'settings' ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'}`}
                  aria-pressed={tab === 'settings'}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiSettings />
                    Settings
                  </span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <StatsBar />

            {/* Tabs (mobile) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setTab('inventory')}
                className={`flex-1 px-3 py-2 rounded-full border ${tab === 'inventory' ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'}`}
                aria-pressed={tab === 'inventory'}
              >
                Inventory
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`flex-1 px-3 py-2 rounded-full border ${tab === 'settings' ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-100'}`}
                aria-pressed={tab === 'settings'}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <FiSettings />
                  Settings
                </span>
              </button>
            </div>

            {tab === 'inventory' ? (
              <ProductManager /> // Replace InventorySection with new ProductManager
            ) : (
              <BusinessSettings />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Simple authentication wrapper
function AdminGate({ children }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  return <>{children}</>;
}

export default function AdminDashboard() {
  return (
    <AdminGate>
      <CatalogProvider>
        <AdminDashboardInner />
      </CatalogProvider>
    </AdminGate>
  );
}