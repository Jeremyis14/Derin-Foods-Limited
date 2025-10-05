import axios from 'axios';

// Get the API base URL with proper fallbacks
const getApiBaseUrl = () => {
  // Check for environment variables
  const viteUrl = import.meta.env?.VITE_API_BASE;
  const craUrl = process.env?.REACT_APP_API_URL;

  // Use environment variable or determine based on current location
  if (viteUrl) return viteUrl;
  if (craUrl) return craUrl;

  // In development, use relative path for same-origin requests
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '';
  }

  // In production, use the current domain
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Fallback for SSR/build time
  return 'https://derin-foods-limited.onrender.com';
};

const API_URL = getApiBaseUrl();

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'dev-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Get all products with better error handling
export const getProducts = async () => {
  try {
    console.log('Fetching products from:', API_URL);
    const response = await api.get('/products');
    console.log('Products response:', response.data);

    // Ensure we return an array
    const data = response.data;
    return Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    console.error('Error in getProducts:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
      },
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    // If the API call fails, return empty array instead of throwing
    // This allows the UI to still work with sample data
    console.warn('API call failed, returning empty array for graceful fallback');
    return [];
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(error.response?.data?.message || `Failed to fetch product with ID ${id}`);
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(error.response?.data?.message || `Failed to update product with ID ${id}`);
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    if (!id) {
      throw new Error('Product ID is required');
    }
    
    console.log(`Attempting to delete product with ID: ${id}`);
    const response = await api.delete(`/products/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete product');
    }
    
    console.log(`Successfully deleted product with ID: ${id}`);
    return response.data;
    
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // Throw a more descriptive error message
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        `Failed to delete product with ID ${id}`;
    
    const customError = new Error(errorMessage);
    customError.status = error.response?.status || 500;
    throw customError;
  }
};

// Upload product image
export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading product image:', {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to upload product image');
  }
};
