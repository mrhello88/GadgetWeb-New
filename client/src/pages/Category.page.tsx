import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Star, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../hooks/store/store';
import { useAppDispatch } from '../hooks/store/hooks';
import { GetCategories } from '../hooks/store/thunk/product.thunk';
import type {
  productResponse,
  productByCategoryResponse,
  DeleteProductResponse,
  productByCategory as Category,
  Product,
} from '../hooks/store/slice/product.slices';

// Custom SVG components for geometric decorations
const CircleDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
  </svg>
);

const TriangleDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,100 0,100" fill="currentColor" />
  </svg>
);

const SquareDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="currentColor" />
  </svg>
);

const HexagonDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="currentColor" />
  </svg>
);

const DonutDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="currentColor" />
    <circle cx="50" cy="50" r="25" fill="transparent" />
  </svg>
);

const StarDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
      fill="currentColor"
    />
  </svg>
);

const ZigzagDecoration: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polyline
      points="0,50 20,20 40,50 60,20 80,50 100,20"
      stroke="currentColor"
      strokeWidth="8"
      fill="none"
    />
  </svg>
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Format price with currency
const formatPrice = (price: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(parseFloat(price));
};

// Type guard for productByCategoryResponse
const isProductByCategoryResponse = (
  response: productResponse | productByCategoryResponse | DeleteProductResponse | null
): response is productByCategoryResponse => {
  if (!response) return false;
  if (!('success' in response)) return false;
  if (!('data' in response)) return false;
  return response.success && Array.isArray(response.data);
};

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [categoryInView, setCategoryInView] = useState<boolean[]>([]);

  const { data, loading, categories: categoriesFromStore } = useSelector((state: RootState) => state.product);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const dispatch = useAppDispatch();

  // Load categories with products on mount
  useEffect(() => {
    const loadCategoriesWithProducts = async () => {
      try {
        // Load all categories with their products
        await dispatch(GetCategories({
          limit: 20,
          offset: 0
        }));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    // Only load if we don't have categories already
    if (categories.length === 0 && !categoriesFromStore.loading) {
      loadCategoriesWithProducts();
    }
  }, [dispatch, categories.length, categoriesFromStore.loading]);

  // Get categories from Redux categories state
  useEffect(() => {
    if (categoriesFromStore.data && categoriesFromStore.data.length > 0) {
      setCategories(categoriesFromStore.data);
    }
  }, [categoriesFromStore.data]);

  // Update categoryInView and animation controls when categories change
  useEffect(() => {
    // Update categoryInView
    setCategoryInView(new Array(categories.length).fill(false));
  }, [categories]);

  // Set up intersection observer for category sections
  useEffect(() => {
    // Initialize refs array with correct length
    categoryRefs.current = categoryRefs.current.slice(0, categories.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const index = categories.findIndex((cat) => cat._id === id);

          if (index !== -1) {
            setCategoryInView((prev) => {
              const updated = [...prev];
              updated[index] = entry.isIntersecting;
              return updated;
            });
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '-100px',
      }
    );

    // Observe all category sections
    categoryRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      categoryRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [categories]);

  // Scroll handlers for product carousels
  const scroll = (categoryId: string, direction: 'left' | 'right'): void => {
    const container = document.getElementById(`product-container-${categoryId}`);
    if (container) {
      const scrollAmount =
        direction === 'left' ? -container.clientWidth * 0.8 : container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading || categoriesFromStore.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Categories Found</h2>
          <p className="text-gray-600">Please check back later for available categories.</p>
          <button 
            onClick={() => dispatch(GetCategories({ limit: 20, offset: 0 }))}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry Loading Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Product Categories | Gadget Comparison Platform</title>
        <meta
          name="description"
          content="Browse and compare products across different categories including smartphones, laptops, headphones, and more."
        />
      </Helmet>

      <div className="relative overflow-hidden">
        {/* Decorative background elements */}
        <motion.div
          className="absolute top-20 right-[5%] w-64 h-64 text-primary-500 opacity-50 z-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <SquareDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-[30%] left-[3%] w-40 h-40 text-warning-500 opacity-50 z-0"
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
          className="absolute bottom-[40%] left-[10%] w-32 h-32 text-primary-500 opacity-50 z-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 90 }}
          transition={{ duration: 1.5, delay: 0.9, ease: 'easeOut' }}
        >
          <HexagonDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-[60%] right-[8%] w-36 h-36 text-pink-500 opacity-40 z-0"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        >
          <StarDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute top-[15%] left-[15%] w-24 h-24 text-warning-500 opacity-30 z-0"
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        >
          <DonutDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute bottom-[20%] left-[20%] w-48 h-12 text-primary-500 opacity-40 z-0"
          initial={{ scale: 0, x: -50 }}
          animate={{
            scale: 1,
            x: 0,
            rotateZ: [0, 10, -10, 0],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse' }}
        >
          <ZigzagDecoration className="w-full h-full" />
        </motion.div>

        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-1 rounded-full bg-primary-100 text-primary-500 text-sm font-medium">
                  Categories
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Explore Our <span className="text-primary-500">Product</span> Categories
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                Browse through our extensive collection of products across different categories.
                Compare features, prices, and find the perfect gadget for your needs.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Category Sections */}
        {categories.map((category, index) => (
          <section
            key={category._id}
            id={category._id}
            className={`py-16 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} relative`}
            ref={(el) => {
              categoryRefs.current[index] = el as HTMLDivElement | null;
            }}
          >
            {/* Category-specific decorative elements */}
            <motion.div
              className={`absolute ${
                index % 2 === 0 ? 'right-5' : 'left-5'
              } top-10 w-16 h-16 text-${
                index % 3 === 0 ? 'teal' : index % 3 === 1 ? 'pink' : 'yellow'
              }-500 opacity-30 z-0`}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, index % 2 === 0 ? 90 : -90, 0],
              }}
              transition={{
                duration: 5 + index,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
              }}
            >
              {index % 4 === 0 ? (
                <CircleDecoration className="w-full h-full" />
              ) : index % 4 === 1 ? (
                <SquareDecoration className="w-full h-full" />
              ) : index % 4 === 2 ? (
                <TriangleDecoration className="w-full h-full" />
              ) : (
                <HexagonDecoration className="w-full h-full" />
              )}
            </motion.div>

            <motion.div
              className={`absolute ${
                index % 2 === 0 ? 'left-[10%]' : 'right-[10%]'
              } bottom-10 w-12 h-12 text-${
                index % 3 === 0 ? 'yellow' : index % 3 === 1 ? 'teal' : 'pink'
              }-500 opacity-30 z-0`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4 + index,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
              }}
            >
              {index % 4 === 0 ? (
                <StarDecoration className="w-full h-full" />
              ) : index % 4 === 1 ? (
                <DonutDecoration className="w-full h-full" />
              ) : index % 4 === 2 ? (
                <ZigzagDecoration className="w-full h-full" />
              ) : (
                <HexagonDecoration className="w-full h-full" />
              )}
            </motion.div>
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <motion.div
                  className="w-full md:w-1/3"
                  variants={fadeInUp}
                  initial="hidden"
                  animate={categoryInView[index] ? 'visible' : 'hidden'}
                >
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                    <img
                      src={
                        category.image?.startsWith('http')
                          ? category.image
                          : `http://localhost:5000/categoryImage/${category.image}`
                      }
                      alt={category.category}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-3xl font-bold text-white mb-2">{category.category}</h2>
                      <p className="text-white/90">{category.description}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="w-full md:w-2/3"
                  variants={fadeInUp}
                  initial="hidden"
                  animate={categoryInView[index] ? 'visible' : 'hidden'}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Latest <span className="text-primary-500">{category.category}</span>
                    </h3>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => scroll(category._id, 'left')}
                        className="p-2 rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Scroll ${category.category} left`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => scroll(category._id, 'right')}
                        className="p-2 rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Scroll ${category.category} right`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>

                  <div
                    id={`product-container-${category._id}`}
                    className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {category.products && category.products.length > 0 ? (
                      category.products.map((product) => (
                        <motion.div
                          key={product._id}
                          className="min-w-[280px] max-w-[280px] bg-white rounded-xl shadow-md overflow-hidden snap-start"
                          whileHover={{ y: -10 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        >
                          <div className="h-40 overflow-hidden bg-gray-100 flex items-center justify-center">
                            <img
                              src={
                                product.images && product.images[0]
                                  ? product.images[0].startsWith('http')
                                    ? product.images[0]
                                    : `http://localhost:5000/images/${product.images[0]}`
                                  : '/placeholder.svg'
                              }
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                              <span className="text-lg font-bold text-primary-500">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {product.description}
                            </p>
                            {/* Displaying product rating with stars */}
                            {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
                              <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating || 0) ? 'text-warning-500' : 'text-gray-300'
                                    }`}
                                    fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-1">{product.rating.toFixed(1)}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Link
                                to={`/product/${product._id}`}
                                className="flex-1 py-2 px-3 bg-primary-200 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors text-center"
                              >
                                View Details
                              </Link>
                              {isLoggedIn ? (
                                <>
                                  <Link
                                    to={`/compare/${product._id}`}
                                    className="py-2 px-3 border border-pink text-pink-500 text-sm font-medium rounded-lg hover:bg-pink-100 transition-colors"
                                  >
                                    Compare
                                  </Link>
                                </>
                              ) : (
                                <Link
                                  to={`/user/login`}
                                  className="py-2 px-3 border border-pink text-pink-500 text-sm font-medium rounded-lg hover:bg-pink-100 transition-colors"
                                >
                                  Compare
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="w-full text-center py-8 text-gray-500">
                        No products available in this category yet.
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="text-center"
                variants={fadeInUp}
                initial="hidden"
                animate={categoryInView[index] ? 'visible' : 'hidden'}
              >
                <Link
                  to={`/category/${category.category}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-primary-500 text-primary-500 font-medium rounded-lg hover:bg-primary-100 transition-colors group"
                >
                  View All {category.category}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        {/* <section className="py-16 bg-gradient-to-r from-teal to-teal-900 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Can't Find What You're Looking For?
              </motion.h2>
              <motion.p
                className="text-xl text-white/90 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                We're constantly adding new products and categories to our comparison platform. Let us know what you'd
                like to see next!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-500 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Request a Product
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>

          decorative divs
          <motion.div
            className="absolute bottom-10 left-10 w-20 h-20 text-white/10"
            animate={{
              rotate: [0, 180],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <CircleDecoration className="w-full h-full" />
          </motion.div>
          <motion.div
            className="absolute top-10 right-10 w-16 h-16 text-white/10"
            animate={{
              rotate: [180, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          >
            <SquareDecoration className="w-full h-full" />
          </motion.div>
        </section> */}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default CategoryPage;


