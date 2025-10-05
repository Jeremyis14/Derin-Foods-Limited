import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FaTimes, FaUpload, FaImage, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as productService from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

const ProductForm = ({ isOpen, onClose, onSubmit, product, isSubmitting: parentIsSubmitting }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    image: '',
    unit: 'kg',
    origin: '',
    organic: false,
    featured: false
  });
  const [previewImage, setPreviewImage] = useState('');
  const categories = [
    'Grains & Cereals',
    'Nuts & Seeds',
    'Legumes & Pulses',
    'Spices & Herbs',
    'Dried Fruits',
    'Oils & Fats',
    'Meat & Poultry',
    'Seafood',
    'Dairy & Eggs',
    'Beverages',
    'Sauces & Condiments',
    'Bakery & Confectionery'
  ];
  
  const units = ['kg', 'g', 'lb', 'oz', 'piece', 'pack', 'bottle', 'jar'];
  const origins = ['Nigeria', 'Ghana', 'South Africa', 'Kenya', 'Ethiopia', 'Other African', 'International'];
  

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '0',
        image: product.image || ''
      });
      setPreviewImage(product.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '0',
        image: ''
      });
      setPreviewImage('');
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload image
      const response = await productService.uploadProductImage(file);
      
      setFormData(prev => ({
        ...prev,
        image: response.imageUrl
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setPreviewImage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0
    });
  };

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-start justify-center p-1 sm:p-2 overflow-y-auto">
        <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 p-3 sm:p-4 my-4">
          <div className="flex justify-between items-center mb-2">
            <Dialog.Title className="text-md font-medium">
              {product ? 'Edit Product' : 'Add New Product'}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Product Name */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2.5 rounded-lg border ${isAdmin ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border-transparent bg-transparent'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="e.g., Premium Basmati Rice"
                  required
                  readOnly={!isAdmin}
                />
              </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 text-sm rounded-lg border ${isAdmin ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border-transparent bg-transparent'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    required
                    disabled={!isAdmin}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (₦) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className={`block w-full pl-8 pr-4 py-2.5 rounded-lg border ${isAdmin ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border-transparent bg-transparent pl-10'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                      placeholder="0.00"
                      required
                      readOnly={!isAdmin}
                    />
                  </div>
                </div>

                {/* Stock & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      id="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 text-sm rounded-lg border ${isAdmin ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border-transparent bg-transparent'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                      required
                      readOnly={!isAdmin}
                    />
                  </div>
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      readOnly={!isAdmin}
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Origin
                  </label>
                  <select
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    readOnly={!isAdmin}
                  >
                    <option value="">Select origin</option>
                    {origins.map((origin) => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Toggle Switches */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      id="organic"
                      name="organic"
                      type="checkbox"
                      checked={formData.organic}
                      onChange={(e) => setFormData({...formData, organic: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      readOnly={!isAdmin}
                    />
                    <label htmlFor="organic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Organic
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      readOnly={!isAdmin}
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Featured
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 text-sm rounded-lg border ${isAdmin ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border-transparent bg-transparent'} transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    placeholder="Product details, special features, etc."
                    readOnly={!isAdmin}
                  />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Image
                  </label>
                  <div className="mt-1 flex justify-center p-3 sm:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 transition-colors duration-200">
                    {previewImage ? (
                      <div className="relative group">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="mx-auto h-40 w-40 object-cover rounded-lg shadow-md group-hover:opacity-90 transition-opacity duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewImage('')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                          title="Remove image"
                        >
                          <FaTimes className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <FaImage className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-transparent rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none transition-colors duration-200"
                            >
                              <span>Upload an image</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleImageChange}
                                accept="image/*"
                              />
                            </label>
                            <span className="ml-1">or drag and drop</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
              {isAdmin && (
                <button
                  type="submit"
                  disabled={parentIsSubmitting}
                  className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all duration-200 ${
                    parentIsSubmitting 
                      ? 'bg-green-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
                >
                  {parentIsSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      {product ? 'Saving Changes...' : 'Adding Product...'}
                    </>
                  ) : (
                    product ? 'Update Product' : 'Add Product'
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 rounded-lg border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ProductForm;
