import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../hooks/store/store';
import { GetCategories } from '../../../hooks/store/thunk/product.thunk';
import { getReviewsByProduct, deleteReview, updateReview } from '../../../hooks/store/thunk/review.thunk';
import { Star, Trash2, ChevronDown, ChevronUp, Search, X, Eye, EyeOff } from 'lucide-react';
import type { productByCategoryResponse, productByCategory, Product } from '../../../hooks/store/slice/product.slices';

// Helper function to get the profile image URL with proper fallback
const getProfileImageUrl = (avatarPath: string | undefined): string => {
  if (!avatarPath) return `http://localhost:5000/profileImages/avatar.png`;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `http://localhost:5000/profileImages/${avatarPath}`;
};

// Format date
const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(Number(dateString));
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const DeleteReviewsComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: productData, loading: productLoading } = useSelector((state: RootState) => state.product);
  const { loading: reviewLoading } = useSelector((state: RootState) => state.review);
  
  const [categories, setCategories] = useState<productByCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedProductsForCategory, setExpandedProductsForCategory] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [toggleStatusId, setToggleStatusId] = useState<string | null>(null);

  // Load categories and products - Always fetch on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch data on component mount to ensure we have fresh data
        const result = await dispatch(GetCategories({ 
          limit: 50, 
          offset: 0 
        })).unwrap();
        if (result.success && result.data) {
          // Set categories directly since GetCategories returns categories, not products by category
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch products by category:', error);
        toast.error('Failed to load categories and products');
      }
    };

    // Fetch data whenever the component mounts
    fetchData();
  }, [dispatch]); // Only depend on dispatch to ensure this runs once on mount

  // Process product data when available
  useEffect(() => {
    if (productData && 'data' in productData && Array.isArray(productData.data)) {
      // Filter out duplicate categories by name
      const uniqueCategoriesMap: Record<string, productByCategory> = {};
      
      (productData.data as productByCategory[]).forEach(category => {
        // Skip categories without products
        if (!category.products || !Array.isArray(category.products) || category.products.length === 0) {
          return;
        }
        
        if (!uniqueCategoriesMap[category.category]) {
          // First instance of this category
          uniqueCategoriesMap[category.category] = {...category};
        } else {
          // Merge products from categories with the same name
          const existingProducts = uniqueCategoriesMap[category.category].products || [];
          const newProducts = category.products || [];
          
          newProducts.forEach((newProduct: Product) => {
            // Only add non-duplicate products
            if (!existingProducts.some(p => p._id === newProduct._id)) {
              existingProducts.push(newProduct);
            }
          });
          
          uniqueCategoriesMap[category.category].products = existingProducts;
        }
      });
      
      const uniqueCategories = Object.values(uniqueCategoriesMap);
      setCategories(uniqueCategories);
    }
  }, [productData]);

  // Auto-select first category and product when no selection exists
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const firstCategory = categories[0];
      setSelectedCategory(firstCategory._id);
      
      // Expand the first category
      setExpandedProductsForCategory(prev => ({
        ...prev,
        [firstCategory._id]: true
      }));
      
      // Auto-select first product if available
      if (firstCategory.products && firstCategory.products.length > 0) {
        const firstProduct = firstCategory.products[0];
        setSelectedProduct(firstProduct._id);
      }
    }
  }, [categories, selectedCategory]);

  // Load reviews when a product is selected
  useEffect(() => {
    const fetchReviews = async () => {
      if (selectedProduct) {
        try {
          setReviewsLoading(true);
          const result = await dispatch(getReviewsByProduct({ 
            productId: selectedProduct 
          })).unwrap();
          
          if (result.success && result.data) {
        
            setReviews(result.data);
          } else {
            setReviews([]);
            toast.info('No reviews found for this product');
          }
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
          toast.error('Failed to load reviews');
          setReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } else {
        setReviews([]);
      }
    };

    if (selectedProduct) {
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [dispatch, selectedProduct]);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedProductsForCategory(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    // If clicking the current category, don't deselect it
    // Just toggle the expanded state and retain the selection
    if (selectedCategory === categoryId) {
      // Don't reset selection when just toggling expanded state
      // Only reset the product selection if we're collapsing the category
      if (expandedProductsForCategory[categoryId]) {
        setSelectedProduct(null);
      }
    } else {
      setSelectedCategory(categoryId);
      // Reset product selection when changing category
      setSelectedProduct(null);
    }
  };

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setSearchTerm(''); // Reset search when changing products
    setStatusFilter('all'); // Reset filter when changing products
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await dispatch(deleteReview(reviewId)).unwrap();
      if (result.success) {
        // Update reviews list by removing the deleted review
        setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
        setShowDeleteConfirm(null);
        toast.success('Review deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Toggle review status (active/disabled)
  const handleToggleStatus = async (reviewId: string, currentStatus: boolean) => {
    try {
      setToggleStatusId(reviewId);
      const newStatus = !currentStatus;
      
      const result = await dispatch(updateReview({
        reviewId,
        status: newStatus ? 'active' : 'disabled'
      })).unwrap();
      
      if (result.success && result.data) {
        // Update the review in the local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId 
              ? { ...review, status: newStatus ? 'active' : 'disabled' } 
              : review
          )
        );
        toast.success(`Review ${newStatus ? 'activated' : 'disabled'} successfully`);
      } else {
        toast.error(result.message || 'Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    } finally {
      setToggleStatusId(null);
    }
  };

  // Helper function to get product name by ID
  const getProductName = (productId: string): string => {
    for (const category of categories) {
      if (category.products && Array.isArray(category.products)) {
        const product = category.products.find(p => p._id === productId);
        if (product) return product.name;
      }
    }
    return 'Unknown Product';
  };

  // Filter reviews based on search term and status filter
  const filteredReviews = reviews.filter(review => {
    const searchMatch = searchTerm === '' || 
      review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.title && review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && (review.status === 'active' || review.status === undefined)) ||
      (statusFilter === 'disabled' && review.status === 'disabled');
    
    return searchMatch && statusMatch;
  });

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Show loading spinner when initially loading categories and products
  if (productLoading && !productData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reviews</h1>
        <p className="text-gray-600 mb-4">Select a category and product to view and manage its reviews.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Categories and Products Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
          
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="space-y-2">
                  <button
                    onClick={() => handleCategoryClick(category._id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      selectedCategory === category._id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-medium truncate">{category.category}</span>
                    {expandedProductsForCategory[category._id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Products within this category */}
                  {expandedProductsForCategory[category._id] && category.products && category.products.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {category.products.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className={`w-full text-left p-2 rounded-md transition-colors ${
                            selectedProduct === product._id
                              ? 'bg-primary-500 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="truncate block">{product.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No categories found</p>
          )}
        </div>

        {/* Reviews Display Area */}
        <div className="md:col-span-8 lg:col-span-9">
          {selectedProduct ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Reviews for {getProductName(selectedProduct)}
              </h2>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 mb-6">
                {/* Search Box */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reviews..."
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Status Filter */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-success-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('disabled')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      statusFilter === 'disabled'
                        ? 'bg-gray-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Disabled
                  </button>
                </div>
              </div>
              
              {/* Results Count */}
              {!reviewsLoading && reviews.length > 0 && (
                <p className="text-sm text-gray-600 mb-4">
                  Showing {filteredReviews.length} of {reviews.length} reviews
                </p>
              )}
              
              {reviewsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-2"></div>
                    <p className="text-gray-500">Loading reviews...</p>
                  </div>
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-6 mt-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredReviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border border-gray-200 rounded-lg p-4 relative ${
                        review.status === 'disabled' ? 'bg-gray-50 border-gray-300' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <img
                            src={getProfileImageUrl(review.userAvatar)}
                            alt={review.userName}
                            className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `http://localhost:5000/profileImages/avatar.png`;
                            }}
                          />
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{review.userName}</span>
                              <span className="text-gray-500 text-sm ml-2">({formatDate(review.createdAt)})</span>
                              
                              {/* Status indicator */}
                              {review.status === 'disabled' && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  Disabled
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-warning-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-sm text-gray-600">{review.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {/* Toggle status button */}
                          <button
                            className={`p-2 rounded-full ${
                              review.status === 'disabled'
                                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                : 'bg-success-100 text-success-600 hover:bg-success-200'
                            }`}
                            onClick={() => handleToggleStatus(
                              review._id, 
                              !(review.status === 'disabled')
                            )}
                            disabled={toggleStatusId === review._id}
                          >
                            {toggleStatusId === review._id ? (
                              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : review.status === 'disabled' ? (
                              <Eye className="h-5 w-5" />
                            ) : (
                              <EyeOff className="h-5 w-5" />
                            )}
                          </button>
                          
                          {/* Delete button */}
                          <button
                            className="p-2 rounded-full bg-error-100 text-error-600 hover:bg-error-200"
                            onClick={() => setShowDeleteConfirm(review._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-medium text-gray-800 mt-3">{review.title}</h4>
                      )}
                      <p className={`mt-2 ${review.status === 'disabled' ? 'text-gray-500' : 'text-gray-700'}`}>
                        {review.text}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Likes: {review.likesCount || review.likes?.length || 0}</span>
                          <span>Dislikes: {review.dislikesCount || review.dislikes?.length || 0}</span>
                          {review.repliesCount > 0 && (
                            <span>Replies: {review.repliesCount}</span>
                          )}
                        </div>
                        {review.isEdited && <span>Edited</span>}
                      </div>
                      
                      {/* Delete confirmation dialog */}
                      {showDeleteConfirm === review._id && (
                        <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center p-4 z-10">
                          <p className="text-gray-700 mb-4 text-center">Are you sure you want to delete this review?</p>
                          <div className="flex space-x-3">
                            <button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                              onClick={() => setShowDeleteConfirm(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : searchTerm || statusFilter !== 'all' ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No reviews found matching your filters</p>
                  <button 
                    className="mt-2 text-primary-500 hover:underline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No reviews found for this product</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-10 text-center">
              <h3 className="text-xl text-gray-600 font-medium mb-2">No Product Selected</h3>
              <p className="text-gray-500">Select a product from the sidebar to view its reviews</p>
            </div>
          )}
        </div>
      </div>
      
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
        `}
      </style>
    </div>
  );
};

export default DeleteReviewsComponent;
