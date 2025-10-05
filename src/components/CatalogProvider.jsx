import React, { createContext, useContext, useReducer } from 'react';

// Create context
const CatalogContext = createContext();

// Initial state
const initialState = {
  products: [
    {
      id: '1',
      name: 'Sample Product',
      description: 'This is a sample product',
      category: 'Sample Category',
      price: 9.99,
      stock: 20,
      image: 'https://via.placeholder.com/150',
      inStock: true,
      sku: 'SP001',
      weight: '0.5kg',
      minimumStock: 5
    }
  ]
};

// Reducer function
function catalogReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        )
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
    default:
      return state;
  }
}

// Provider component
export function CatalogProvider({ children }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  // Actions
  const addProduct = (product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const updateProduct = (product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  };

  const removeProduct = (productId) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
  };

  // Value object to be provided by context
  const value = {
    products: state.products,
    addProduct,
    updateProduct,
    removeProduct
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

// Custom hook to use the catalog context
export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}

export default CatalogProvider;
