import React, { useMemo, useState } from 'react';
import { FiPlus, FiUpload, FiDownload, FiSearch, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { useCatalog } from '../../state/catalog';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

export default function InventorySection() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    setPrice,
    setStock,
    importCatalog,
    exportCatalog
  } = useCatalog();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(p => {
      const byCat = cat === 'All' || p.category === cat;
      const byLow = !onlyLowStock || ((p.stock ?? 0) <= 5 && p.inStock);
      const byQuery =
        !q ||
        [p.name, p.description, p.category, p.sku]
          .filter(Boolean)
          .some(s => s.toLowerCase().includes(q));
      return byCat && byLow && byQuery;
    });

    switch (sort) {
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'stock-asc':
        list = [...list].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
        break;
      case 'stock-desc':
        list = [...list].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
      case 'newest':
      default:
        // assume id roughly correlates to creation time if generated with Date.now()
        list = [...list];
        break;
    }
    return list;
  }, [products, query, cat, sort, onlyLowStock]);

  const onSave = (data) => {
    if (editing) {
      updateProduct(editing.id, data);
    } else {
      addProduct(data);
    }
    setEditing(null);
    setModalOpen(false);
  };

  const onEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const onDelete = (p) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      deleteProduct(p.id);
    }
  };

  const onImport = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importCatalog(data);
    } catch {
      alert('Invalid JSON file');
    }
  };

  const resetFilters = () => {
    setQuery('');
    setCat('All');
    setSort('newest');
    setOnlyLowStock(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <FiPackage />
          <h3 className="text-lg font-semibold">Inventory</h3>
          <span className="text-sm text-gray-500">({products.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-50 cursor-pointer">
            <FiUpload />
            <span>Import</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => onImport(e.target.files?.[0])}
            />
          </label>
          <button
            onClick={exportCatalog}
            className="px-3 py-2 rounded-full border hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <FiDownload />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-3 py-2 rounded-full bg-green-600 text-white hover:bg-green-500 inline-flex items-center gap-2"
          >
            <FiPlus />
            <span>Add product</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search products by name, category, SKU..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border rounded-lg px-3 py-2"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="All">All categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
          </select>

          <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
            />
            <span className="text-sm">Only low stock</span>
          </label>

          <button
            onClick={resetFilters}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 inline-flex items-center gap-2"
            title="Reset filters"
          >
            <FiRefreshCw />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <ProductTable
        products={filtered}
        onEdit={onEdit}
        onDelete={onDelete}
        onPriceChange={(id, v) => setPrice(id, v)}
        onStockChange={(id, v) => setStock(id, v)}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 max-w-3xl mx-auto mt-10">
            <ProductForm
              initial={editing}
              onCancel={() => setModalOpen(false)}
              onSave={onSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}