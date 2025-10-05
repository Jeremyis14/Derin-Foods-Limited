import axios from 'axios';

const API_URL = '/api/products';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Get all products
export const getProducts = async () => {
  try {
    console.log('Fetching products from:', API_URL);
    const response = await api.get('/products');
    console.log('Products response:', response.data);
    return response.data;
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
    
    // Throw a more descriptive error
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch products';
    throw new Error(errorMessage);
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
