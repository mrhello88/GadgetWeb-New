import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { GetProductsByCategory, DeleteCategory } from '../../../hooks/store/thunk/product.thunk';
import { Trash2, Search, X } from 'lucide-react';
import type { productByCategoryResponse, productByCategory } from '../../../hooks/store/slice/product.slices';

const DeleteCategoryComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: productData } = useSelector((state: RootState) => state.product);
  
  const [categories, setCategories] = useState<productByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!productData) {
          await dispatch(GetProductsByCategory()).unwrap();
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, productData]);

  // Process category data when available
  useEffect(() => {
    if (productData && 'data' in productData && Array.isArray(productData.data)) {
      setCategories(productData.data as productByCategory[]);
    }
  }, [productData]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const result = await dispatch(DeleteCategory(categoryId)).unwrap();
      if (result.success) {
        // Update categories list by removing the deleted category
        setCategories(prevCategories => prevCategories.filter(category => category._id !== categoryId));
        setShowDeleteConfirm(null);
        toast.success(result.message || 'Category deleted successfully');
        
        // Refresh the categories list
        await dispatch(GetProductsByCategory()).unwrap();
      } else {
        toast.error(result.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4 md:mb-6">Manage Categories</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4">View and manage product categories.</p>
      </motion.div>

      {/* Search Box */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid - with responsive gap adjustments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 sm:gap-y-4 gap-y-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-36 sm:h-40 md:h-48">
                <img
                  src={
                    category.image
                      ? category.image.startsWith('http')
                        ? category.image
                        : `${import.meta.env.VITE_API_URL}/categoryImages/${category.image}`
                      : '/placeholder.svg'
                  }
                  alt={category.category}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">{category.category}</h3>
                <p className="text-sm text-gray-600 mb-2 sm:mb-4 line-clamp-2">{category.description}</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  Products: {category.products?.length || 0}
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(category._id)}
                  className="w-full px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium sm:font-semibold text-sm sm:text-base transition-colors"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" />
                  Delete Category
                </button>
              </div>

              {/* Delete confirmation dialog */}
              {showDeleteConfirm === category._id && (
                <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center p-3 sm:p-4 z-10">
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 text-center">
                    Are you sure you want to delete this category? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2 sm:space-x-3">
                    <button
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 py-6 sm:py-8">
            No categories found{searchTerm ? ' matching your search' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteCategoryComponent; 