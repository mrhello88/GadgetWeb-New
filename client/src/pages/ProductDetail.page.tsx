import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence, type Variants } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Star,
  SquareStack,
  ArrowLeft,
  Check,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Edit,
  Trash2,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../hooks/store/store';
import { getReviewsByProduct, deleteReview, likeReview, dislikeReview } from '../hooks/store/thunk/review.thunk';
import ReviewForm from '../components/ReviewForm';
import EditReviewForm from '../components/EditReviewForm';
import type {
  productResponse,
  productByCategoryResponse,
  DeleteProductResponse,
  productByCategory,
  Product as StoreProduct,
} from '../hooks/store/slice/product.slices';

// Custom SVG components for geometric decorations
const CircleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
  </svg>
);

const TriangleDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,100 0,100" fill="currentColor" />
  </svg>
);

const SquareDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="currentColor" />
  </svg>
);

const HexagonDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="currentColor" />
  </svg>
);

const DonutDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="white" />
  </svg>
);

const StarDecoration = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
      fill="currentColor"
    />
  </svg>
);

// Type definitions
// interface Review {
//   id: string;
//   user: string;
//   avatar: string;
//   rating: number;
//   date: string;
//   comment: string;
//   helpful: number;
//   notHelpful: number;
// }

interface Specification {
  name: string;
  value: string;
}
interface Products {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  inStock: boolean;
  brand: string;
  specifications: Specification[];
  features: string[];
}
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  inStock: boolean;
  category: string;
  brand: string;
  relatedProducts: Products[];
  specifications: Specification[];
  features: string[];
}

interface Category {
  _id: string;
  description: string;
  category: string;
  image: string;
  products: Product[];
}

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 1, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatingAnimation: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

const pulseAnimation: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

const rotateAnimation: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'linear',
    },
  },
};

// Extended Product type with optional rating fields
interface ExtendedProduct extends Omit<StoreProduct, 'relatedProducts'> {
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  relatedProducts: ExtendedRelatedProduct[];
  reviews: any[]; // Add reviews property
}

interface ExtendedRelatedProduct extends Omit<StoreProduct, 'relatedProducts'> {
  rating?: number;
}

// Type guard for productByCategoryResponse
const isProductByCategoryResponse = (
  response: productResponse | productByCategoryResponse | DeleteProductResponse | null
): response is productByCategoryResponse => {
  if (!response) return false;
  if (!('success' in response)) return false;
  if (!('data' in response)) return false;
  if (!('message' in response)) return false;
  if (!('statusCode' in response)) return false;
  return response.success && Array.isArray(response.data);
};

// Define a review interface
interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  notHelpful: number;
}

// Create a helper function to get the profile image URL with proper fallback
const getProfileImageUrl = (avatarPath: string | undefined): string => {
  if (!avatarPath) return `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${import.meta.env.VITE_API_URL}/profileImages/${avatarPath}`;
};

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data } = useSelector((state: RootState) => state.product);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const [productsByCategory, setProductsByCategory] = useState<productByCategory[]>([]);
  const [specificCategory, setSpecificCategory] = useState<productByCategory | null>(null);
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description'
  );
  const [expandedSpecs, setExpandedSpecs] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const controls = useAnimation();
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { data: userData } = useSelector((state: RootState) => state.user);
  const currentUserId = userData?.data?._id;

  // Get categories from Redux data
  useEffect(() => {
    if (data && isProductByCategoryResponse(data)) {
      setProductsByCategory(data.data || []);
    } else if (data) {
      console.error('Unexpected data format:', data);
      setProductsByCategory([]); // Set empty array as fallback
    } else {
      console.warn('No product data available in Redux store');
      setProductsByCategory([]); // Handle null data
    }
  }, [data]);

  // Format price with currency
  const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  // Transform product data to include ratings and fallback to dummy data when needed
  const transformProductData = (product: StoreProduct): ExtendedProduct => {
    // Add the generateDummyReviews function back (it will be used as fallback)
    const generateDummyReviews = (): Review[] => {
      return [
        {
          id: '1',
          user: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=1',
          rating: 5,
          date: '2023-06-15',
          comment: 'Excellent product! Exceeded my expectations in every way. Would definitely recommend to others.',
          helpful: 12,
          notHelpful: 2
        },
        {
          id: '2',
          user: 'Alice Smith',
          avatar: 'https://i.pravatar.cc/150?img=5',
          rating: 4,
          date: '2023-05-20',
          comment: 'Very good product overall. Just a few minor issues but nothing significant.',
          helpful: 8,
          notHelpful: 1
        },
        {
          id: '3',
          user: 'Robert Johnson',
          avatar: 'https://i.pravatar.cc/150?img=3',
          rating: 5,
          date: '2023-07-02',
          comment: 'Amazing value for money. Works perfectly and looks great too!',
          helpful: 15,
          notHelpful: 0
        }
      ];
    };

    return {
      ...product,
      rating: product.rating || 4.5, // Use actual rating with fallback
      reviewCount: product.reviewCount || 145, // Use actual review count with fallback
      inStock: true, // Default stock status
      relatedProducts: product.relatedProducts.map((rp) => {
        // Create a copy of the related product with an optional rating property
        return {
          ...rp,
          rating: 4.5, // Default rating for related products
        };
      }),
      // Use actual reviews if available, otherwise use dummy reviews
      reviews: product.reviews || generateDummyReviews() 
    };
  };

  // Fetch product data based on productId
  useEffect(() => {
    setLoading(true);
    
    // If no productId is provided, show error
    if (!productId) {
      setLoading(false);
      return;
    }
    
    // If no product data in Redux store, show loading
    if (!productsByCategory || productsByCategory.length === 0) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return;
    }
    
    setTimeout(() => {
      const specificCategoryData = productsByCategory.find((item) => {
        return item.products && Array.isArray(item.products) && item.products.some((product) => product._id === productId);
      });

      const foundProduct = specificCategoryData?.products?.find(
        (product) => product._id === productId
      );

      setSpecificCategory(specificCategoryData || null);
      setProduct(foundProduct ? transformProductData(foundProduct) : null);
      setLoading(false);
      controls.start('visible');
    }, 800);
  }, [productId, controls, productsByCategory]);

  // Compare prices for sorting
  const comparePrices = (a: string, b: string): number => {
    return parseFloat(a) - parseFloat(b);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fix the refreshReviews function to address the TypeScript errors
  const refreshReviews = async () => {
    try {
      const reviewsResponse = await dispatch(getReviewsByProduct({ 
        productId: productId || '' 
      })).unwrap();
      
      if (reviewsResponse.success && reviewsResponse.data) {
        // Update the product with the new reviews
        if (product) {
          setProduct({
            ...product,
            reviews: reviewsResponse.data,
            reviewCount: reviewsResponse.data.length,
            // Calculate the new average rating with proper typing
            rating: reviewsResponse.data.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsResponse.data.length
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    }
  };

  // Handle image navigation
  const nextImage = (): void => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (): void => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number): void => {
    setActiveImageIndex(index);
  };

  // Get rating display value
  const getRatingDisplay = (rating: number | undefined): number => {
    return rating || 4.5; // Default to 4.5 if rating is undefined
  };

  // Add a function to check if the current user is the author of a review
  const isReviewAuthor = (review: any): boolean => {
    return !!currentUserId && review.userId === currentUserId;
  };

  // Add a handleDeleteReview function
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await dispatch(deleteReview(reviewId)).unwrap();
      if (result.success) {
        refreshReviews();
        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete review:', result.message);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Add functions for liking and disliking reviews
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-teal-500"
          >
            <svg className="w-16 h-16 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="absolute -top-10 -left-10 w-16 h-16 text-pink-500 opacity-30"
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
          >
            <CircleDecoration className="w-full h-full" />
          </motion.div>

          <motion.div
            className="absolute -bottom-8 -right-8 w-12 h-12 text-yellow opacity-30"
            variants={pulseAnimation}
            initial="initial"
            animate="animate"
          >
            <StarDecoration className="w-full h-full" />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute mt-24 text-gray-600 font-medium"
        >
          Loading amazing products...
        </motion.p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-lg text-center px-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the product you're looking for. It might have been removed or the ID is incorrect.
          </p>
          <p className="text-gray-500 mb-6 text-sm">
            Product ID: {productId}
          </p>
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white font-medium rounded-lg hover:bg-teal-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Browse Categories
          </Link>

          {/* Decorative elements */}
          <motion.div
            className="absolute -top-20 -left-20 w-24 h-24 text-pink-500 opacity-30"
            variants={rotateAnimation}
            initial="initial"
            animate="animate"
          >
            <TriangleDecoration className="w-full h-full" />
          </motion.div>

          <motion.div
            className="absolute -bottom-16 -right-16 w-20 h-20 text-teal-500 opacity-30"
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
          >
            <HexagonDecoration className="w-full h-full" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 right-[5%] w-64 h-64 text-teal-500 opacity-50 z-0"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 45 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <SquareDecoration className="w-full h-full" />
      </motion.div>

      <motion.div
        className="absolute top-[60%] left-[3%] w-40 h-40 text-yellow-500 opacity-50 z-0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
      >
        <CircleDecoration className="w-full h-full" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-[15%] w-48 h-48 text-pink-500 opacity-50 z-0"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 180 }}
        transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
      >
        <TriangleDecoration className="w-full h-full" />
      </motion.div>

      <motion.div
        className="absolute top-[30%] right-[8%] w-36 h-36 text-pink-500 opacity-40 z-0"
        variants={{
          initial: { scale: 1, rotate: 0 },
          animate: {
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          },
        }}
        initial="initial"
        animate="animate"
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      >
        <StarDecoration className="w-full h-full" />
      </motion.div>

      <motion.div
        className="absolute top-[15%] left-[15%] w-24 h-24 text-yellow-500 opacity-30 z-0"
        variants={{
          initial: { scale: 1 },
          animate: {
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
          },
        }}
        initial="initial"
        animate="animate"
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
      >
        <DonutDecoration className="w-full h-full" />
      </motion.div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center text-sm text-gray-600"
        >
          <Link to="/" className="hover:text-teal-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/categories" className="hover:text-teal-500 transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            to={`/category/${specificCategory?._id}`}
            className="hover:text-teal-500 transition-colors"
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </motion.div>
      </div>

      {/* Product Details */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <motion.div
            className="w-full lg:w-1/2"
            variants={fadeIn}
            animate={controls}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-xl overflow-hidden aspect-square mb-4 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={
                    product.images && product.images[activeImageIndex]
                      ? product.images[activeImageIndex].startsWith('http')
                        ? product.images[activeImageIndex]
                        : `${import.meta.env.VITE_API_URL}/images/${
                            product.images[activeImageIndex]
                          }`
                      : '/placeholder.svg'
                  }
                  alt={`${product.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </AnimatePresence>

              <motion.button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-900 hover:bg-white hover:text-teal-500 transition-colors shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-900 hover:bg-white hover:text-teal-500 transition-colors shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>

              {/* Image indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`w-2 h-2 rounded-full ${
                      activeImageIndex === index ? 'bg-teal-200' : 'bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 0.8 }}
                    initial={{ scale: activeImageIndex === index ? 1.2 : 1 }}
                    animate={{ scale: activeImageIndex === index ? 1.2 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative rounded-lg overflow-hidden w-20 h-20 flex-shrink-0 ${
                    activeImageIndex === index
                      ? 'ring-2 ring-teal shadow-md'
                      : 'ring-1 ring-gray-200 hover:ring-teal-500'
                  }`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={
                      image.startsWith('http')
                        ? image
                        : `${import.meta.env.VITE_API_URL}/images/${image}`
                    }
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />

                  {activeImageIndex === index && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="w-full lg:w-1/2 ml-8"
            variants={fadeInRight}
            initial="hidden"
            animate={controls}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <motion.span
                className="px-3 py-1 rounded-full bg-teal-200 text-teal-500 text-xs font-medium"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 128, 128, 0.2)' }}
              >
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </motion.span>

              <motion.span
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(209, 213, 219, 0.5)' }}
              >
                {product.brand}
              </motion.span>
            </div>

            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {product.name}
            </motion.h1>

            <motion.div
              className="flex items-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(getRatingDisplay(product?.rating))
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                    fill={
                      i < Math.floor(getRatingDisplay(product?.rating)) ? 'currentColor' : 'none'
                    }
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {getRatingDisplay(product?.rating).toFixed(1)}
                </span>
              </div>
            </motion.div>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span className="text-3xl font-bold text-teal-500">{formatPrice(product.price)}</span>
              {parseFloat(String(product.price)) >= 100 && (
                <span className="ml-2 text-sm text-gray-600">
                  or {formatPrice(Math.round(parseFloat(String(product.price)) / 12))} /month with
                  financing
                </span>
              )}
            </motion.div>

            <motion.div
              className="prose prose-gray mb-6 max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-gray-700 leading-relaxed">
                {product.description.split('.')[0] + '.'}
              </p>
            </motion.div>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-3">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.slice(0, 6).map((feature, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    variants={{
                      hidden: { opacity: 1, x: -10 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    initial="hidden"
                    animate={controls}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="bg-teal-200 p-1 rounded-full mr-2 mt-0.5 flex-shrink-0">
                      <Check className="h-4 w-4 text-teal-500" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.div
                className=""
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 128, 128, 0.1), 0 4px 6px -2px rgba(0, 128, 128, 0.05)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoggedIn ? (
                  <>
                    <Link
                      to={`/compare/${product._id}`}
                      className="flex-1 py-3 px-6 bg-teal text-white bg-teal-500 font-medium rounded-lg hover:bg-teal-900 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <SquareStack className="h-5 w-5" />
                      Compare
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/user/login`}
                      className="flex-1 py-3 px-6 bg-teal text-white bg-teal-500 font-medium rounded-lg hover:bg-teal-900 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <SquareStack className="h-5 w-5" />
                      Compare
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              className="border-t border-gray-200 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>
                  SKU: {product._id.toUpperCase()}-{Math.floor(Math.random() * 10000)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>
                  Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>Brand: {product.brand}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          className="border-b border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <div className="flex overflow-x-auto hide-scrollbar">
            <motion.button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'description'
                  ? 'border-teal text-teal-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              } transition-colors`}
              onClick={() => setActiveTab('description')}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Description
            </motion.button>
            <motion.button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'specifications'
                  ? 'border-teal text-teal-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              } transition-colors`}
              onClick={() => setActiveTab('specifications')}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Specifications
            </motion.button>
            <motion.button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-teal text-teal-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              } transition-colors flex items-center gap-2`}
              onClick={() => setActiveTab('reviews')}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Reviews
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {product.reviews.filter(review => review.status !== 'disabled').length}
              </span>
            </motion.button>
          </div>
        </motion.div>

        <div className="py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="prose prose-gray max-w-none"
              >
                <p className="mb-4 text-gray-700 leading-relaxed">{product.description}</p>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Features & Benefits</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="bg-teal-200 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                        <Check className="h-4 w-4 text-teal-500" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                key="specifications"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md"
                    whileHover={{
                      y: -5,
                      boxShadow:
                        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Technical Specifications
                    </h3>
                    <div className="space-y-3">
                      {product.specifications
                        .slice(0, expandedSpecs ? undefined : 6)
                        .map((spec, index) => (
                          <motion.div
                            key={index}
                            className="flex justify-between border-b border-gray-200 pb-2 last:border-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <span className="text-gray-600">{spec.name}</span>
                            <span className="font-medium text-gray-900">{spec.value}</span>
                          </motion.div>
                        ))}
                    </div>
                    {product.specifications.length > 6 && (
                      <motion.button
                        className="mt-4 text-teal-500 font-medium text-sm flex items-center"
                        onClick={() => setExpandedSpecs(!expandedSpecs)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {expandedSpecs ? 'Show Less' : 'Show All Specifications'}
                        <ChevronDown
                          className={`h-4 w-4 ml-1 transition-transform ${
                            expandedSpecs ? 'rotate-180' : ''
                          }`}
                        />
                      </motion.button>
                    )}
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md"
                    whileHover={{
                      y: -5,
                      boxShadow:
                        '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">What's in the Box</h3>
                    <ul className="space-y-3">
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-teal-500" />
                        </div>
                        <span className="text-gray-700">1 x {product.name}</span>
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-teal-500" />
                        </div>
                        <span className="text-gray-700">1 x User Manual</span>
                      </motion.li>
                      <motion.li
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                          <Check className="h-4 w-4 text-teal-500" />
                        </div>
                        <span className="text-gray-700">1 x Warranty Card</span>
                      </motion.li>
                      {product.category === 'smartphones' && (
                        <>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                              <Check className="h-4 w-4 text-teal-500" />
                            </div>
                            <span className="text-gray-700">1 x USB-C Charging Cable</span>
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                              <Check className="h-4 w-4 text-teal-500" />
                            </div>
                            <span className="text-gray-700">1 x SIM Ejector Tool</span>
                          </motion.li>
                        </>
                      )}
                      {product.category === 'laptops' && (
                        <>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                              <Check className="h-4 w-4 text-teal-500" />
                            </div>
                            <span className="text-gray-700">1 x Power Adapter</span>
                          </motion.li>
                          <motion.li
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="bg-teal-200 p-1 rounded-full mr-3 flex-shrink-0">
                              <Check className="h-4 w-4 text-teal-500" />
                            </div>
                            <span className="text-gray-700">1 x Charging Cable</span>
                          </motion.li>
                        </>
                      )}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
                    <motion.button
                      className="py-2 px-4 bg-teal bg-teal-200 text-white text-sm font-medium rounded-lg hover:bg-teal-900 transition-colors shadow-md"
                      whileHover={{
                        scale: 1.05,
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 128, 128, 0.1), 0 2px 4px -1px rgba(0, 128, 128, 0.06)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </motion.button>
                  </div>

                  {/* Add the review form */}
                  {showReviewForm && (
                    <div className="mb-8">
                      <ReviewForm 
                        productId={product._id} 
                        onReviewAdded={() => {
                          setShowReviewForm(false);
                          refreshReviews();
                        }} 
                      />
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                      <motion.div
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md"
                        whileHover={{
                          y: -5,
                          boxShadow:
                            '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        <div className="flex items-center mb-4">
                          <motion.span
                            className="text-4xl font-bold text-teal-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                          >
                            {getRatingDisplay(product?.rating)}
                          </motion.span>
                          <div className="ml-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      i < Math.floor(getRatingDisplay(product?.rating))
                                        ? 'text-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                    fill={
                                      i < Math.floor(getRatingDisplay(product?.rating))
                                        ? 'currentColor'
                                        : 'none'
                                    }
                                  />
                                </motion.div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              Based on {product.reviews.filter(review => 
                                review.status !== 'disabled').length} reviews
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const activeReviews = product.reviews.filter(
                              review => review.status !== 'disabled'
                            );
                            const percentage =
                              activeReviews.length > 0 
                                ? (activeReviews.filter(
                                    (review) => Math.floor(review.rating) === star
                                  ).length /
                                  activeReviews.length) *
                                100
                                : 0;
                            return (
                              <div key={star} className="flex items-center">
                                <span className="text-sm text-gray-600 w-6">{star}</span>
                                <Star
                                  className="h-4 w-4 text-yellow-500 ml-1 mr-2"
                                  fill="currentColor"
                                />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-yellow-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.2 + (5 - star) * 0.1 }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 ml-2 w-8">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>

                    <div className="w-full md:w-2/3">
                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                          {product.reviews
                            .filter(review => review.status !== 'disabled') // Only show active reviews
                            .map((review, index) => {
                            // Check if this is a dummy review or a real review from the API
                            const isDummyReview = 'id' in review;
                            const reviewId = isDummyReview ? (review as any).id : (review as any)._id;
                            const userName = isDummyReview ? (review as any).user : (review as any).userName;
                            const reviewText = isDummyReview ? (review as any).comment : (review as any).text;
                            const reviewTitle = isDummyReview ? '' : (review as any).title;
                            const reviewDate = isDummyReview ? (review as any).date : (review as any).createdAt;
                            const reviewLikes = isDummyReview ? (review as any).helpful : 
                              ((review as any).likesCount || ((review as any).likes && (review as any).likes.length) || 0);
                            const reviewDislikes = isDummyReview ? (review as any).notHelpful : 
                              ((review as any).dislikesCount || ((review as any).dislikes && (review as any).dislikes.length) || 0);
                            const reviewRepliesCount = isDummyReview ? 0 : 
                              ((review as any).repliesCount || ((review as any).replies && (review as any).replies.length) || 0);
                            
                            return (
                              <motion.div
                                key={reviewId}
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                variants={fadeInUp}
                                transition={{ delay: 0.1 * Math.min(index, 5) }} // Cap delay for better performance with many reviews
                                whileHover={{ y: -5 }}
                              >
                                <div className="flex justify-between mb-4">
                                  <div className="flex items-center">
                                    <img
                                      src={isDummyReview 
                                        ? (review as any).avatar 
                                        : getProfileImageUrl((review as any).userAvatar)}
                                      alt={userName}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-200"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `${import.meta.env.VITE_API_URL}/profileImages/avatar.png`;
                                      }}
                                    />
                                    <div className="ml-3">
                                      <h4 className="font-medium text-gray-900">{userName}</h4>
                                      <span className="text-sm text-gray-600">
                                        {formatDate(reviewDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                          i < (review as any).rating ? 'text-yellow-500' : 'text-gray-300'
                                        }`}
                                        fill={i < (review as any).rating ? 'currentColor' : 'none'}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  {reviewTitle && <h5 className="font-medium text-gray-900 mb-2">{reviewTitle}</h5>}
                                  <p className="text-gray-700">{reviewText}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                  <div className="flex items-center space-x-4">
                                    <button 
                                      className={`flex items-center ${
                                        isLoggedIn && ((review as any).isLiked) ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                                      } transition-colors`}
                                      onClick={() => handleLikeReview((review as any)._id)}
                                      disabled={!isLoggedIn}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      <span className="text-xs font-medium">{reviewLikes}</span>
                                    </button>
                                    <button 
                                      className={`flex items-center ${
                                        isLoggedIn && ((review as any).isDisliked) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                      } transition-colors`}
                                      onClick={() => handleDislikeReview((review as any)._id)}
                                      disabled={!isLoggedIn}
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-1" />
                                      <span className="text-xs font-medium">{reviewDislikes}</span>
                                    </button>
                                  </div>
                                  
                                  {/* Show edit/delete for user's own reviews */}
                                  {isReviewAuthor(review as any) && (
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        className="p-1 text-gray-500 hover:text-teal-600 transition-colors"
                                        onClick={() => setEditingReviewId((review as any)._id)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button 
                                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                        onClick={() => setShowDeleteConfirm((review as any)._id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                  
                                  {reviewRepliesCount > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {reviewRepliesCount} {reviewRepliesCount === 1 ? 'reply' : 'replies'}
                                    </span>
                                  )}
                                </div>

                                {/* Delete confirmation dialog */}
                                {showDeleteConfirm === (review as any)._id && (
                                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-red-700 font-medium mb-2">Are you sure you want to delete this review?</p>
                                    <div className="flex justify-end space-x-2">
                                      <button 
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        onClick={() => setShowDeleteConfirm(null)}
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        onClick={() => handleDeleteReview((review as any)._id)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Edit review form */}
                                {editingReviewId === (review as any)._id && (
                                  <div className="mt-4">
                                    <EditReviewForm 
                                      reviewId={(review as any)._id}
                                      initialData={{
                                        rating: (review as any).rating,
                                        title: (review as any).title || '',
                                        text: (review as any).text
                                      }}
                                      onUpdate={() => {
                                        setEditingReviewId(null);
                                        refreshReviews();
                                      }}
                                      onCancel={() => setEditingReviewId(null)}
                                    />
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Related Products
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={`/category/${specificCategory?._id}`}
              className="text-teal-500 font-medium flex items-center hover:underline"
            >
              View All
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {product.relatedProducts.map((relatedProduct, index) => (
            <motion.div
              key={relatedProduct._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 * index }}
              whileHover={{
                y: -10,
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="h-48 overflow-hidden relative group">
                <img
                  src={
                    relatedProduct.images && relatedProduct.images[0]
                      ? relatedProduct.images[0].startsWith('http')
                        ? relatedProduct.images[0]
                        : `${import.meta.env.VITE_API_URL}/images/${relatedProduct.images[0]}`
                      : '/placeholder.svg'
                  }
                  alt={relatedProduct.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                  {/* <div className="p-4 w-full">
                    <motion.button
                      className="w-full py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-900 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Quick View
                    </motion.button>
                  </div> */}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{relatedProduct.name}</h3>
                  <span className="text-lg font-bold text-teal-500">
                    {formatPrice(relatedProduct.price)}
                  </span>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(getRatingDisplay(relatedProduct?.rating))
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                      fill={
                        i < Math.floor(getRatingDisplay(relatedProduct?.rating))
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {getRatingDisplay(relatedProduct?.rating).toFixed(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/product/${relatedProduct._id}`}
                    className="flex-1 py-2 px-3 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-900 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
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
      `}</style>
    </div>
  );
};

export default ProductDetailPage;