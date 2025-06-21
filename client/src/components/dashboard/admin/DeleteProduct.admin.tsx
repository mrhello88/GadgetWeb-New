import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { GetAllProducts, DeleteProduct, GetProductsByCategory } from '../../../hooks/store/thunk/product.thunk';
import type {
  productResponse,
  productByCategoryResponse,
  DeleteProductResponse,
  Product,
  productByCategory,
} from '../../../hooks/store/slice/product.slices';

// Type guard for category response
const isProductByCategoryResponse = (
  data: any
): data is productByCategoryResponse => {
  return data && data.success && Array.isArray(data.data);
};

const DeleteProductComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isInitialized, setIsInitialized] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState<productByCategory[]>([]);

  const { loading, error, data } = useSelector((state: RootState) => state.product);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(GetAllProducts({ 
          limit: 100, 
          offset: 0 
        })).unwrap();
        if (!result.success) {
          toast.error(result.message || 'Failed to fetch products');
          return;
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch products');
      }
    };

    // Helper function to check if we have valid products data
    const hasValidProductsData = () => {
      return productsByCategory.length > 0;
    };
                      
    if (!isInitialized || !hasValidProductsData()) {
      fetchData();
    }
  }, [dispatch, isInitialized, productsByCategory]);

  // Handle data response from GetAllProducts
  useEffect(() => {
    if (data && 'data' in data && Array.isArray(data.data)) {
      // GetAllProducts returns just an array of products, not categories with products
      // We need to create a temporary category structure for the UI
      const tempCategory: productByCategory = {
        _id: 'all-products',
        category: 'All Products',
        description: 'All available products',
        image: '',
        products: data.data as Product[]
      };
      setProductsByCategory([tempCategory]);
    } else {
      setProductsByCategory([]);
    }
  }, [data]);

  // Get all products from all categories with safety checks
  const allProducts = productsByCategory.flatMap(category => 
    category.products ? category.products.filter(product => product && product._id) : []
  );
  
  // Get available categories for filter dropdown
  const availableCategories = productsByCategory.map(cat => ({
    id: cat._id,
    name: cat.category
  }));

  // Filter products based on search term and selected category with safety checks
  const filteredProducts = allProducts.filter(product => {
    if (!product || !product._id) return false;
    
    const matchesSearch = !searchTerm || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      productsByCategory.find(cat => cat._id === selectedCategory)?.products?.some(p => p._id === product._id);
    
    return matchesSearch && matchesCategory;
  });

    const handleDelete = async (productId: string) => {
    try {
      const result = await dispatch(DeleteProduct(productId)).unwrap();
      if (result.success) {
        toast.success(result.message);
        // Refresh the products list
        dispatch(GetAllProducts({ 
          limit: 100, 
          offset: 0 
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-error-500">Error: {error}</p>
      </div>
    );
  }

  // Show loading state while initializing or loading
  if (!isInitialized || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Delete Products</h1>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Results Counter */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {allProducts.length} products
            {searchTerm && <span className="ml-1">for "{searchTerm}"</span>}
            {selectedCategory !== 'all' && (
              <span className="ml-1">
                in {availableCategories.find(cat => cat.id === selectedCategory)?.name}
              </span>
            )}
          </p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-pink-600 hover:text-pink-800 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: Product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={
                    product.images && Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0].startsWith('http')
                        ? product.images[0]
                        : `http://localhost:5000/images/${product.images[0]}`
                      : '/placeholder.svg'
                  }
                  alt={product.name || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name || 'Unknown Product'}</h3>
                <p className="text-gray-600 mb-2">Category: {product.category || 'N/A'}</p>
                <p className="text-gray-600 mb-2">Brand: {product.brand || 'N/A'}</p>
                <p className="text-primary-600 font-bold mb-4">${Number(product.price || 0).toFixed(2)}</p>
                <div className="flex gap-2">
                  <Link 
                    to={`/product/${product._id}`}
                    className="flex-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-2 bg-warning-500 hover:bg-warning-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Product
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Delete Product
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 py-8">
            No products found{searchTerm ? ' matching your search' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteProductComponent;

