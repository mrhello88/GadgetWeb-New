import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { GetAllProducts, DeleteProduct } from '../../../hooks/store/thunk/product.thunk';
import type {
  productResponse,
  productByCategoryResponse,
  DeleteProductResponse,
  Product,
} from '../../../hooks/store/slice/product.slices';

interface AllProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  statusCode: number;
}

const isProductResponse = (
  data: productResponse | productByCategoryResponse | DeleteProductResponse | AllProductsResponse | null
): data is AllProductsResponse => {
  if (!data) return false;
  if (!('success' in data)) return false;
  if (!data.success) return false;
  if (!('data' in data)) return false;
  if (!Array.isArray(data.data)) return false;
  return true;
};

const DeleteProductComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const { loading, error, data } = useSelector((state: RootState) => state.product);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(GetAllProducts()).unwrap();
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

    // Fetch data if not initialized or if data is empty
    if (!isInitialized || !data || (data && (!('data' in data) || !Array.isArray(data.data) || data.data.length === 0))) {
      fetchData();
    } else {
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized, data]);

  const products = (data && 'data' in data && Array.isArray(data.data)) ? data.data as Product[] : [];
  const filteredProducts = products.filter((product) =>
    product?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
  );

  const handleDelete = async (productId: string) => {
    try {
      const result = await dispatch(DeleteProduct(productId)).unwrap();
      if (result.success) {
        toast.success(result.message);
        // Refresh the products list
        dispatch(GetAllProducts());
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
        <p className="text-red-500">Error: {error}</p>
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
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                    product.images && product.images.length > 0
                      ? product.images[0].startsWith('http')
                        ? product.images[0]
                        : `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                      : '/placeholder.svg'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">Category: {product.category}</p>
                <p className="text-gray-600 mb-2">Brand: {product.brand}</p>
                <p className="text-teal-600 font-bold mb-4">${Number(product.price).toFixed(2)}</p>
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
                      className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Product
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
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
