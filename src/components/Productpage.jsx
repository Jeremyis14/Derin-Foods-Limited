import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiShoppingCart,
  FiInfo,
  FiMinus,
  FiPlus,
  FiCheck,
  FiFilter,
  FiTag,
  FiSearch,
  // user view does not include edit/delete
} from 'react-icons/fi';
import { useCart } from './CartContext';
import { useUser } from './auth/UserAuth'; // Current user (for future personalization only)

gsap.registerPlugin(ScrollTrigger);

// Config
const CURRENCY = 'NGN';
const LOCALE = 'en-NG';

function formatCurrency(amount, currency = CURRENCY, locale = LOCALE) {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `₦${(amount || 0).toFixed(2)}`;
  }
}

function SearchAndSort({ categories, selectedCategory, onSelectCategory, search, setSearch, sort, setSort }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-green-600" />
          <select
            className="border rounded-lg px-3 py-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popular">Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="category-buttons flex flex-wrap items-center gap-3">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category)}
            className={`px-5 py-2 rounded-full text-sm font-medium border ${
              selectedCategory === category
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 hover:bg-green-50 border-gray-200'
            } transition-colors duration-300`}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

const ProductCard = ({ product, onAdd }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const maxQty = useMemo(() => {
    const max = Number.isFinite(product?.stock) ? product.stock : (product?.inStock ? 99 : 0);
    return Math.max(0, Math.min(99, max));
  }, [product]);

  const canAdd = product.inStock && maxQty > 0;

  const inc = () => setQty((q) => Math.min(q + 1, maxQty || 1));
  const dec = () => setQty((q) => Math.max(q - 1, 1));

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl p-5 shadow-xl border border-green-100 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3] bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            <FiTag />
            {product.category}
          </span>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-1 text-gray-900">{product.name}</h3>
      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-green-600">{formatCurrency(product.price)}</span>
        {Number.isFinite(product?.stock) && (
          <span className={`text-xs font-medium ${product.stock > 5 ? 'text-gray-500' : 'text-red-600'}`}>
            {product.inStock ? `In stock: ${product.stock}` : 'Unavailable'}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={dec}
            disabled={!canAdd || qty <= 1}
            className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <FiMinus />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={maxQty || 1}
            className="w-14 border rounded px-2 py-1 text-center"
            value={qty}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (Number.isNaN(val)) return;
              setQty(Math.max(1, Math.min(val, maxQty || 1)));
            }}
            aria-label="Quantity"
          />
          <button
            onClick={inc}
            disabled={!canAdd || qty >= (maxQty || 1)}
            className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <FiPlus />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          disabled={!canAdd}
          className={`px-4 py-2 rounded-full inline-flex items-center gap-2 font-medium transition-colors ${
            canAdd ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {added ? <FiCheck /> : <FiShoppingCart />}
          {added ? 'Added!' : 'Add to Cart'}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
        className="mt-4 text-sm text-gray-600"
      >
        <div className="flex items-center gap-2">
          <FiInfo className="text-green-600" />
          {product.weight || product.volume}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ProductsPage() {
  const sectionRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const { addItem, openCart } = useCart();
  const { user } = useUser(); // Get current user
  const isAdmin = user?.role === 'admin';
  const { currentTier, totalSpent } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://derin-foods-limited.onrender.com/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        // Fallback to sample data if API fails
        setProducts([
          {
            _id: '1',
            name: "Egusi Seeds",
            price: 2499,
            image: "https://yournativefoodstore.com/wp-content/uploads/2023/01/ingredients-for-egusi-soup.jpg",
            description: "Premium ground melon seeds, perfect for traditional Egusi soup.",
            category: "Seeds",
            weight: "500g",
            inStock: true,
            stock: 30
          },
          {
            _id: '2',
            name: "Pounded Yam Flour",
            price: 4299,
            image: "https://images.unsplash.com/photo-1549890762-0a3f8933bcf9?q=80&w=1374&auto=format&fit=crop",
            description: "Fine yam flour for quick pounded yam.",
            category: "Flours",
            weight: "1.5kg",
            inStock: true,
            stock: 33
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') list.sort((a, b) => (b?._id || b?.id || 0) - (a?._id || a?.id || 0));
    // 'popular' default - keep original order (could add a popularity metric later)

    return list;
  }, [selectedCategory, search, sort]);

  const handleAdd = (product, qty = 1) => {
    // Ensure we pass the fields CartContext expects
    addItem(
      {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: Number.isFinite(product?.stock) ? product.stock : (product.inStock ? 99 : 0)
      },
      qty
    );
    openCart();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".products-header", {
        scrollTrigger: {
          trigger: ".products-header",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8
      });

      // Category buttons animation
      gsap.from(".category-buttons button", {
        scrollTrigger: {
          trigger: ".category-buttons",
          start: "top 85%",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08
      });

      // Product cards animation
      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedCategory, search, sort]);

  return (
    <div ref={sectionRef} className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="products-header text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Nigerian Food Ingredients
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Authentic ingredients sourced directly from Nigeria, bringing the true taste of home to your kitchen.
            </p>
            {/* Rewards Badge */}
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-green-200 bg-white shadow-sm">
              <span className="text-xl">{currentTier?.icon || '🎖️'}</span>
              <div className="text-sm text-left">
                <div className="font-semibold">{currentTier?.name || 'Member'} Tier</div>
                <div className="text-gray-600">{currentTier?.discount || 0}% off on every order</div>
              </div>
              <span className="ml-2 text-xs text-gray-500">Total spent: {formatCurrency(totalSpent || 0)}</span>
            </div>
          </div>

          <SearchAndSort
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
          />

          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
            {filtered.map((product) => (
              <div key={product._id || product.id} className="product-card">
                <ProductCard product={product} onAdd={handleAdd} />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-gray-600 py-16">
              <p>No products match your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}