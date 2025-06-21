import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  GitCompare,
  Plus,
  Minus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/store/hooks';
import { 
  GetProductById,
  GetProductsByCategory
} from '../hooks/store/thunk/product.thunk';
import {
  getReviewsByProduct,
  deleteReview,
  likeReview,
  dislikeReview
} from '../hooks/store/thunk/review.thunk';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DataNotFound from '../components/common/DataNotFound';
import ReviewForm from '../components/ReviewForm';
import EditReviewForm from '../components/EditReviewForm';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { 
    loading: productsLoading, 
    error: productsError 
  } = useAppSelector((state) => state.product);
  const userState = useAppSelector((state) => state.user);
  const isLoggedIn = userState.isLoggedIn;
  // Handle different possible user state structures
  const currentUser = (userState as any).user || (userState as any).currentUser || null;

  // Local state
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specifications'); // New tab state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [isInCompare, setIsInCompare] = useState(false);

  // Load compare products from localStorage
  useEffect(() => {
    const savedCompareProducts = localStorage.getItem('compareProducts');
    if (savedCompareProducts) {
      try {
        const parsed = JSON.parse(savedCompareProducts);
        setCompareProducts(parsed);
        setIsInCompare(parsed.some((p: any) => p._id === productId));
      } catch (error) {
        console.error('Error parsing compare products:', error);
        localStorage.removeItem('compareProducts');
      }
    }
  }, [productId]);

  // Compare functionality
  const handleCompareToggle = () => {
    if (!product) return;

    let updatedCompareProducts = [...compareProducts];

    if (isInCompare) {
      // Remove from compare
      updatedCompareProducts = updatedCompareProducts.filter(p => p._id !== product._id);
      setIsInCompare(false);
    } else {
      // Add to compare (max 3 products)
      if (updatedCompareProducts.length >= 3) {
        alert('You can compare up to 3 products at a time. Please remove a product first.');
        return;
      }
      updatedCompareProducts.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        images: product.images,
        brand: product.brand,
        category: product.category,
        specifications: product.specifications,
        features: product.features
      });
      setIsInCompare(true);
    }

    setCompareProducts(updatedCompareProducts);
    localStorage.setItem('compareProducts', JSON.stringify(updatedCompareProducts));
  };

  const goToCompare = () => {
    if (compareProducts.length > 0) {
      navigate('/compare');
    }
  };

  // Fetch product data from database
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch product by ID from database
        const productResponse = await dispatch(GetProductById(productId)).unwrap();
        
        if (productResponse.success && productResponse.data) {
          setProduct(productResponse.data);
          
          // Fetch related products from the same category
          if (productResponse.data.category) {
            try {
              const categoryResponse = await dispatch(GetProductsByCategory({ 
                category: productResponse.data.category 
              })).unwrap();
              
              if (categoryResponse.success && categoryResponse.data) {
                // Filter out current product and limit to 4 related products
                const related = categoryResponse.data
                  .filter((p: any) => p._id !== productId)
                  .slice(0, 4);
                setRelatedProducts(related);
              }
            } catch (error) {
              console.error('Error fetching related products:', error);
            }
          }

          // Fetch reviews for this product from database
          try {
            const reviewsResponse = await dispatch(getReviewsByProduct({ 
              productId 
            })).unwrap();
            
            if (reviewsResponse.success && reviewsResponse.data) {
              setReviews(reviewsResponse.data);
            }
          } catch (error) {
            console.error('Error fetching reviews:', error);
          }
        } else {
          setError('Product not found');
        }
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, dispatch]);

  // Helper functions
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numPrice);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(Number(dateString));
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getProfileImageUrl = (avatarPath: string | undefined): string => {
    if (!avatarPath) return `http://localhost:5000/profileImages/avatar.png`;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000/profileImages/${avatarPath}`;
  };

  const refreshReviews = async () => {
    if (!productId) return;
    
    try {
      const response = await dispatch(getReviewsByProduct({ productId })).unwrap();
      if (response.success && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    }
  };

  const nextImage = (): void => {
    if (product && product.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (): void => {
    if (product && product.images && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleThumbnailClick = (index: number): void => {
    setActiveImageIndex(index);
  };

  const getRatingDisplay = (rating: number | undefined): number => {
    return rating || 0;
  };

  const hasValidReviews = (rating?: number, reviewCount?: number): boolean => {
    return Boolean((rating && rating > 0) || (reviewCount && reviewCount > 0));
  };

  const isReviewAuthor = (review: any): boolean => {
    return Boolean(currentUser && review.userId === currentUser._id);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await dispatch(deleteReview(reviewId)).unwrap();
      if (result.success) {
        refreshReviews();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!isLoggedIn) return;
    try {
      await dispatch(likeReview(reviewId)).unwrap();
      refreshReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislikeReview = async (reviewId: string) => {
    if (!isLoggedIn) return;
    try {
      await dispatch(dislikeReview(reviewId)).unwrap();
      refreshReviews();
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DataNotFound 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <DataNotFound 
          message="Product not found"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Details Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <motion.img
                  key={activeImageIndex}
                  src={
                    product.images && product.images[activeImageIndex]
                      ? product.images[activeImageIndex].startsWith('http')
                        ? product.images[activeImageIndex]
                        : `http://localhost:5000/images/${product.images[activeImageIndex]}`
                      : '/placeholder.svg'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Navigation buttons */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === activeImageIndex
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={
                          image.startsWith('http')
                            ? image
                            : `http://localhost:5000/images/${image}`
                        }
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <motion.h1
                  className="text-3xl font-bold text-gray-900 mb-2"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  {product.name}
                </motion.h1>
                
                <motion.p
                  className="text-gray-600 mb-4"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  {product.description}
                </motion.p>

                {/* Rating - Always show if product has rating */}
                {product.rating && product.rating > 0 && (
                  <motion.div
                    className="flex items-center space-x-2 mb-4"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const rating = product.rating || 0;
                        const isFilled = i < Math.floor(rating);
                        const isPartial = i === Math.floor(rating) && rating % 1 >= 0.5;
                        
                        return (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              isFilled || isPartial
                                ? 'text-warning-500'
                                : 'text-gray-300'
                            }`}
                            fill={
                              isFilled || isPartial
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviewCount || 0} {(product.reviewCount || 0) === 1 ? 'review' : 'reviews'})
                    </span>
                  </motion.div>
                )}

                {/* Price */}
                <motion.div
                  className="mb-6"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-4xl font-bold text-primary-500">
                    {formatPrice(product.price)}
                  </span>
                </motion.div>

                {/* Action Buttons - Compare Product */}
                <motion.div
                  className="mb-6"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                >
                  {/* Compare Button - Direct redirect */}
                  <motion.button 
                    className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/compare/${product._id}`)}
                  >
                    <GitCompare className="h-5 w-5 mr-2" />
                    Compare This Product
                  </motion.button>
                </motion.div>

                {/* Product Features */}
                {product.features && product.features.length > 0 && (
                  <motion.div
                    className="mb-6"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feature: string, index: number) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center bg-gray-50 rounded-lg p-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Check className="h-4 w-4 text-success-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 pt-6">
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'specifications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold mb-6">Product Specifications</h3>
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.specifications.map((spec: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <span className="text-gray-600 font-medium">{spec.name}</span>
                            <span className="text-gray-900 font-semibold text-right ml-4">{spec.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No specifications available for this product.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Customer Reviews</h3>
                    {isLoggedIn ? (
                      <motion.button
                        className="py-2 px-4 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                      </motion.button>
                    ) : (
                      <Link
                        to="/login"
                        className="py-2 px-4 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Login to Write Review
                      </Link>
                    )}
                  </div>

                  {/* Review Form */}
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                      >
                        <ReviewForm
                          productId={product._id}
                          onReviewAdded={() => {
                            setShowReviewForm(false);
                            refreshReviews();
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review, index) => (
                        <motion.div
                          key={review._id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                          variants={fadeInUp}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              src={getProfileImageUrl(review.userAvatar)}
                              alt={review.userName}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `http://localhost:5000/profileImages/avatar.png`;
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'text-warning-500' : 'text-gray-300'
                                      }`}
                                      fill={i < review.rating ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {review.title && (
                                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                              )}
                              <p className="text-gray-700 mb-4">{review.text}</p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <button 
                                    className={`flex items-center ${
                                      isLoggedIn && review.isLiked ? 'text-success-600' : 'text-gray-500 hover:text-success-600'
                                    } transition-colors`}
                                    onClick={() => handleLikeReview(review._id)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">{review.likes?.length || 0}</span>
                                  </button>
                                  <button 
                                    className={`flex items-center ${
                                      isLoggedIn && review.isDisliked ? 'text-error-600' : 'text-gray-500 hover:text-error-600'
                                    } transition-colors`}
                                    onClick={() => handleDislikeReview(review._id)}
                                    disabled={!isLoggedIn}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    <span className="text-xs font-medium">{review.dislikes?.length || 0}</span>
                                  </button>
                                </div>
                                
                                {/* Show edit/delete for user's own reviews */}
                                {isReviewAuthor(review) && (
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                                      onClick={() => setEditingReviewId(review._id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                      className="p-1 text-gray-500 hover:text-error-600 transition-colors"
                                      onClick={() => setShowDeleteConfirm(review._id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Delete confirmation dialog */}
                              {showDeleteConfirm === review._id && (
                                <div className="mt-4 p-3 bg-error-50 rounded-lg">
                                  <p className="text-error-700 font-medium mb-2">Are you sure you want to delete this review?</p>
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                      onClick={() => setShowDeleteConfirm(null)}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      className="px-3 py-1 bg-error-600 text-white rounded hover:bg-error-700"
                                      onClick={() => handleDeleteReview(review._id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Edit review form */}
                              {editingReviewId === review._id && (
                                <div className="mt-4">
                                  <EditReviewForm 
                                    reviewId={review._id}
                                    initialData={{
                                      rating: review.rating,
                                      title: review.title || '',
                                      text: review.text
                                    }}
                                    onUpdate={() => {
                                      setEditingReviewId(null);
                                      refreshReviews();
                                    }}
                                    onCancel={() => setEditingReviewId(null)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                      {!isLoggedIn && (
                        <p className="text-sm text-gray-400 mt-2">
                          <Link to="/login" className="text-primary-500 hover:underline">
                            Login
                          </Link> to write a review
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              <Link
                to={`/category/${product.category}`}
                className="text-primary-500 font-medium flex items-center hover:underline"
              >
                View All
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        relatedProduct.images && relatedProduct.images[0]
                          ? relatedProduct.images[0].startsWith('http')
                            ? relatedProduct.images[0]
                            : `http://localhost:5000/images/${relatedProduct.images[0]}`
                          : '/placeholder.svg'
                      }
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-500">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <Link
                        to={`/product/${relatedProduct._id}`}
                        className="px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
