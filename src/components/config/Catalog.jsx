import { createContext, useContext, useEffect, useMemo, useState } from 'react';

  const STORAGE_KEY = 'catalog:v1';
  const EVT = 'catalog:updated';

  const seedProducts = [
    { id: '1', name: 'Egusi Seeds', price: 2499, image: 'https://yournativefoodstore.com/wp-content/uploads/2023/01/ingredients-for-egusi-soup.jpg', description: 'Premium ground melon seeds, perfect for Egusi soup.', category: 'Seeds', weight: '500g', stock: 30, inStock: true },
    { id: '2', name: 'Dried Stockfish (Okporoko)', price: 3999, image: 'https://i.etsystatic.com/42464239/r/il/86a6d4/5030772110/il_1080xN.5030772110_amqo.jpg', description: 'High-quality dried stockfish, essential for Nigerian soups.', category: 'Proteins', weight: '250g', stock: 12, inStock: true },
    { id: '3', name: 'Red Palm Oil', price: 1999, image: 'https://www.tastingtable.com/img/gallery/what-is-red-palm-oil-and-how-is-it-best-used/intro-1693393090.jpg', description: 'Pure, unrefined red palm oil for authentic cooking.', category: 'Oils', volume: '1L', stock: 50, inStock: true },
    { id: '4', name: 'Dried Pepper Mix', price: 1299, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTQtbtE7yPA9wVuoyvRA3gp9w4ZZ4wFo-bvQ&s', description: 'Blend of scotch bonnet and dried bell peppers.', category: 'Spices', weight: '200g', stock: 40, inStock: true },
    { id: '5', name: 'Ogbono Seeds', price: 2999, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXGysK5-bABsKRV4884ezRenbuwAi-YB4Mag&s', description: 'Ground wild mango seeds for Ogbono soup.', category: 'Seeds', weight: '400g', stock: 20, inStock: true },
  ];

  function loadCatalog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...seedProducts];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [...seedProducts];
    } catch {
      return [...seedProducts];
    }
  }

  function saveCatalog(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent(EVT, { detail: products }));
    } catch {}
  }

  function genId() {
    return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8);
  }

  const CatalogCtx = createContext(null);

  export function CatalogProvider({ children }) {
    const [products, setProducts] = useState(() => loadCatalog());

    useEffect(() => {
      const onChange = (e) => setProducts(Array.isArray(e?.detail) ? e.detail : loadCatalog());
      window.addEventListener(EVT, onChange);
      return () => window.removeEventListener(EVT, onChange);
    }, []);

    const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]);

    const addProduct = (data) => {
      const product = {
        id: genId(),
        name: data.name?.trim() || 'Unnamed',
        price: Math.max(0, Number(data.price) || 0),
        image: data.image || '',
        description: data.description || '',
        category: data.category || '',
        stock: Math.max(0, Number(data.stock) || 0),
        inStock: data.inStock ?? (Number(data.stock) > 0),
        weight: data.weight || '',
        volume: data.volume || '',
        sku: data.sku || '',
      };
      const next = [product, ...products];
      setProducts(next);
      saveCatalog(next);
      return product;
    };

    const updateProduct = (id, patch) => {
      setProducts(prev => {
        const next = prev.map(p => p.id === id ? { ...p, ...patch } : p);
        saveCatalog(next);
        return next;
      });
    };

    const deleteProduct = (id) => {
      setProducts(prev => {
        const next = prev.filter(p => p.id !== id);
        saveCatalog(next);
        return next;
      });
    };

    const setStock = (id, stock) => updateProduct(id, { stock: Math.max(0, Number(stock) || 0), inStock: (Number(stock) || 0) > 0 });
    const setPrice = (id, price) => updateProduct(id, { price: Math.max(0, Number(price) || 0) });

    const importCatalog = (list) => {
      if (!Array.isArray(list)) return;
      const normalized = list.map(it => ({
        id: String(it.id || genId()),
        name: String(it.name || 'Unnamed'),
        price: Math.max(0, Number(it.price) || 0),
        image: it.image || '',
        description: it.description || '',
        category: it.category || '',
        stock: Math.max(0, Number(it.stock) || 0),
        inStock: it.inStock ?? (Number(it.stock) > 0),
        weight: it.weight || '',
        volume: it.volume || '',
        sku: it.sku || '',
      }));
      setProducts(normalized);
      saveCatalog(normalized);
    };

    const exportCatalog = () => {
      const data = JSON.stringify(products, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalog.json';
      a.click();
      URL.revokeObjectURL(url);
    };

    const value = {
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      setStock,
      setPrice,
      importCatalog,
      exportCatalog,
    };

    return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
  }

  export function useCatalog() {
    const ctx = useContext(CatalogCtx);
    if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
    return ctx;
  }

  export function readCatalog() {
    return loadCatalog();
  }