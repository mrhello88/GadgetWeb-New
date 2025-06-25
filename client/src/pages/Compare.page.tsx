'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  PlusCircle,
  Smartphone,
  Laptop,
  Headphones,
  Tablet,
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../hooks/store/store';
import { GetCategories } from '../hooks/store/thunk/product.thunk';
import { useAppSelector } from '../hooks/store/hooks';

// Animated decorations
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const rotateAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

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
  category: string;
  brand: string;
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

// Category icons mapping
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'smartphones':
      return <Smartphone className="w-5 h-5" />;
    case 'laptops':
      return <Laptop className="w-5 h-5" />;
    case 'tablets':
      return <Tablet className="w-5 h-5" />;
    case 'headphones':
      return <Headphones className="w-5 h-5" />;
    default:
      return <BarChart3 className="w-5 h-5" />;
  }
};

// Function to calculate similarity percentage between two products
const calculateSimilarity = (product1: Product, product2: Product): number => {
  const allSpecNames = new Set([
    ...product1.specifications.map((spec) => spec.name),
    ...product2.specifications.map((spec) => spec.name),
  ]);

  let matchCount = 0;
  const totalSpecs = allSpecNames.size;

  allSpecNames.forEach((specName) => {
    const spec1 = product1.specifications.find((s) => s.name === specName);
    const spec2 = product2.specifications.find((s) => s.name === specName);

    if (spec1 && spec2 && spec1.value === spec2.value) {
      matchCount++;
    }
  });

  return Math.round((matchCount / totalSpecs) * 100);
};

// Main Compare page component
const ProductCompare = () => {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { data: categoriesData = [], loading, error } = useAppSelector((state) => state.product.categories);
  const userState = useAppSelector((state) => state.user);
  const isLoggedIn = userState.isLoggedIn;
  // Handle different possible user state structures
  const currentUser = (userState as any).user || (userState as any).currentUser || null;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load categories data if it's not already in the store - Fixed to prevent continuous fetching
  useEffect(() => {
    const loadCategories = async () => {
      if (hasAttemptedLoad) return; // Prevent multiple calls
      
      try {
        setHasAttemptedLoad(true);
        await dispatch(GetCategories({ limit: 20, offset: 0 }));
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    // Only load if we haven't attempted to load yet and not currently loading
    if (!hasAttemptedLoad && categoriesData.length === 0 && !loading) {
      loadCategories();
    }
  }, [hasAttemptedLoad, categoriesData.length, loading, dispatch]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Categories error:', error);
    }
  }, [error]);

  // Process categories data from the store into local state for the page
  useEffect(() => {
    if (categoriesData.length > 0) {
      const allProds = categoriesData.flatMap((cat) =>
        (cat.products || []).map((prod) => ({
          ...prod,
          rating: prod.rating ?? 0,
          reviewCount: prod.reviewCount ?? 0,
          specifications: prod.specifications || [],
          features: prod.features || [],
        }))
      );
      setAllProducts(allProds);

      const uniqueCategories = Array.from(new Set(categoriesData.map((cat) => cat.category)));
      setCategories(uniqueCategories);
    }
  }, [categoriesData]);

  // Handle URL parameter to pre-select a product
  useEffect(() => {
    if (id && allProducts.length > 0) {
      const foundProduct = allProducts.find((p) => p._id === id);
      
      if (foundProduct) {
        if (!selectedProducts.some((p) => p._id === id)) {
          setSelectedProducts([foundProduct]);
          setSelectedCategory(foundProduct.category);
        }
      }
    }
  }, [id, allProducts, selectedProducts]);

  // Update available products when the category changes
  useEffect(() => {
    if (selectedCategory && allProducts.length > 0) {
      const categoryProducts = allProducts.filter(p => p.category === selectedCategory);
      setAvailableProducts(categoryProducts);
    } else {
      setAvailableProducts([]);
    }
  }, [selectedCategory, allProducts]);
  
  // Handle product selection
  const selectProduct = (product: Product) => {
    if (selectedProducts.some((p) => p._id === product._id)) {
      return;
    }

    if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, product]);
      setSuccessMessage(`${product.name} added to comparison!`);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  // Remove a product from comparison
  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // When changing category, clear selections unless the pre-selected one from the URL is in that category
    const productFromUrl = allProducts.find(p => p._id === id);
    if (productFromUrl && productFromUrl.category === category) {
      setSelectedProducts([productFromUrl]);
    } else {
      setSelectedProducts([]);
    }
    setShowProductDropdown(false);
  };
  
  // Calculate similarity when selected products change
  useEffect(() => {
    if (selectedProducts.length === 2) {
      const score = calculateSimilarity(selectedProducts[0], selectedProducts[1]);
      setSimilarityScore(score);
    } else if (selectedProducts.length === 3) {
      const score1 = calculateSimilarity(selectedProducts[0], selectedProducts[1]);
      const score2 = calculateSimilarity(selectedProducts[0], selectedProducts[2]);
      const score3 = calculateSimilarity(selectedProducts[1], selectedProducts[2]);
      const avgScore = Math.round((score1 + score2 + score3) / 3);
      setSimilarityScore(avgScore);
    } else {
      setSimilarityScore(null);
    }
  }, [selectedProducts]);
  
  // Get all unique specs from selected products for the comparison table
  const getAllSpecifications = () => {
    if (selectedProducts.length === 0) return [];

    const allSpecs = new Set<string>();
    selectedProducts.forEach((product) => {
      (product.specifications || []).forEach((spec) => {
        allSpecs.add(spec.name);
      });
    });

    return Array.from(allSpecs);
  };

  // Best product recommendation logic
  const getBestProduct = (): { product: Product; reasons: string[]; score: number } | null => {
    if (selectedProducts.length < 2) return null;

    const productScores = selectedProducts.map((product) => {
      let score = 0;
      const reasons: string[] = [];

      // Price factor (lower is better) - 30% weight
      const prices = selectedProducts.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      if (priceRange > 0) {
        const priceScore = ((maxPrice - product.price) / priceRange) * 30;
        score += priceScore;
        if (product.price === minPrice) {
          reasons.push('Best price value');
        }
      }

      // Rating factor (higher is better) - 25% weight
      const ratings = selectedProducts.map(p => p.rating || 0);
      const maxRating = Math.max(...ratings);
      if (maxRating > 0) {
        const ratingScore = ((product.rating || 0) / maxRating) * 25;
        score += ratingScore;
        if (product.rating === maxRating && product.rating > 0) {
          reasons.push('Highest customer rating');
        }
      }

      // Review count factor (more reviews = more reliable) - 15% weight
      const reviewCounts = selectedProducts.map(p => p.reviewCount || 0);
      const maxReviews = Math.max(...reviewCounts);
      if (maxReviews > 0) {
        const reviewScore = ((product.reviewCount || 0) / maxReviews) * 15;
        score += reviewScore;
        if (product.reviewCount === maxReviews && product.reviewCount > 0) {
          reasons.push('Most customer reviews');
        }
      }

      // Specifications completeness factor - 20% weight
      const specCounts = selectedProducts.map(p => (p.specifications || []).length);
      const maxSpecs = Math.max(...specCounts);
      if (maxSpecs > 0) {
        const specScore = ((product.specifications || []).length / maxSpecs) * 20;
        score += specScore;
        if ((product.specifications || []).length === maxSpecs) {
          reasons.push('Most detailed specifications');
        }
      }

      // Features count factor - 10% weight
      const featureCounts = selectedProducts.map(p => (p.features || []).length);
      const maxFeatures = Math.max(...featureCounts);
      if (maxFeatures > 0) {
        const featureScore = ((product.features || []).length / maxFeatures) * 10;
        score += featureScore;
        if ((product.features || []).length === maxFeatures) {
          reasons.push('Most features included');
        }
      }
      
      return { product, score, reasons };
    });

    // Find the product with the highest score
    const bestProduct = productScores.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    return bestProduct;
  };

  // Capitalize category names for display
  const categoryTitles = categories.reduce(
    (acc, cat) => ({
      ...acc,
      [cat]: cat.charAt(0).toUpperCase() + cat.slice(1),
    }),
    {} as Record<string, string>
  );

  // Show loading state only on initial load
  if (loading && categoriesData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading comparison data...</h2>
          <p className="text-gray-500 mt-2">Please wait while we prepare your product comparison</p>
        </div>
      </div>
    );
  }

  // Show error state if fetching fails
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Error Loading Data</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button 
            onClick={() => dispatch(GetCategories({ limit: 20, offset: 0 }))} 
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no products are available at all
  if (!loading && categoriesData.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Products Available</h2>
          <p className="text-gray-500 mt-2">There are no products available for comparison at the moment.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Compare Products | Your Store</title>
        <meta
          name="description"
          content="Compare products side by side to find the perfect match for your needs."
        />
      </Helmet>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-success-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <TriangleDecoration className="absolute top-0 right-0 w-64 h-64 text-primary-100 opacity-40 transform -translate-y-32 translate-x-16" />
        <CircleDecoration className="absolute bottom-0 left-0 w-96 h-96 text-pink-100 opacity-30 transform translate-y-24 -translate-x-24" />
        <SquareDecoration className="absolute top-1/3 left-1/4 w-32 h-32 text-warning-100 opacity-30 transform -rotate-15" />
        <HexagonDecoration className="absolute top-3/4 right-1/4 w-48 h-48 text-primary-100 opacity-20" />
        <DonutDecoration className="absolute bottom-1/3 right-1/5 w-40 h-40 text-pink-100 opacity-40" />

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-1/4 left-1/2 w-72 h-72 text-warning-100 opacity-30"
        >
          <HexagonDecoration className="w-full h-full" />
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={rotateAnimation}
          className="absolute top-2/3 left-1/3 w-48 h-48 text-primary-100 opacity-20"
        >
          <CircleDecoration className="w-full h-full" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Compare {categoryTitles[selectedCategory] || 'Products'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Compare specifications side by side to find the perfect product for your needs. Search
            and add up to three products to compare.
          </p>
        </motion.div>

        {/* Category selector */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <CategoryIcon category={cat} />
                <span>{categoryTitles[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Selected Products Section */}
        <div className="max-w-6xl mx-auto mb-12">
          {/* Product Selection Dropdown */}
          <div className="relative mb-8">
            <button
              onClick={() => setShowProductDropdown(!showProductDropdown)}
              disabled={!selectedCategory || availableProducts.length === 0}
              className={`w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white shadow-sm transition-colors ${
                !selectedCategory || availableProducts.length === 0
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
              }`}
            >
              <div className="flex items-center">
                <PlusCircle className="w-5 h-5 mr-3 text-primary-500" />
                <span>
                  {selectedCategory 
                    ? `Add ${categoryTitles[selectedCategory]} to compare (${availableProducts.length} available)`
                    : 'Select a category first'
                  }
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Product dropdown */}
            {showProductDropdown && availableProducts.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    Select from {availableProducts.length} {categoryTitles[selectedCategory]} products:
                  </p>
                </div>
                {availableProducts
                  .filter(product => !selectedProducts.some(selected => selected._id === product._id))
                  .map((product) => (
                    <div
                      key={product._id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                      onClick={() => {
                        selectProduct(product);
                        setShowProductDropdown(false);
                      }}
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={
                            product.images && product.images[0]
                              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${product.images[0]}`
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
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <div className="flex items-center mt-1">
                          {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
                            <>
                              <Star className="w-3 h-3 text-warning-500 fill-current mr-1" />
                              <span className="text-xs text-gray-500">
                                {product.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                          <DollarSign className="w-3 h-3 text-success-500 ml-2 mr-1" />
                          <span className="text-xs text-gray-500">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-primary-600">
                        <PlusCircle className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                {availableProducts.every(product => selectedProducts.some(selected => selected._id === product._id)) && (
                  <div className="p-4 text-center text-gray-500">
                    <p>All products in this category are already selected for comparison</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected products for comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Show selected products */}
            {selectedProducts.map((product, index) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-xl p-4 min-h-[120px] flex"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-md overflow-hidden">
                        <img
                          src={
                            product.images && product.images[0]
                              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${product.images[0]}`
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
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeProduct(product._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-auto text-lg font-bold">
                    ${product.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show one "Add product" box only if less than 3 products are selected */}
            {selectedProducts.length < 3 && (
              <div className="border-dashed border-gray-300 bg-gray-50 rounded-xl p-4 min-h-[120px] flex">
                <div className="flex flex-col items-center justify-center w-full text-gray-400">
                  <PlusCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm text-center">
                    {selectedProducts.length === 0 
                      ? 'Add your first product to compare'
                      : selectedProducts.length === 1
                      ? 'Add a second product to compare'
                      : 'Add a third product to compare'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Similarity score visualization */}
          {similarityScore !== null && selectedProducts.length >= 2 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Similarity Score</h2>
              <div className="flex justify-center items-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={
                        similarityScore > 70
                          ? '#10b981'
                          : similarityScore > 40
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      strokeWidth="10"
                      strokeDasharray={`${(similarityScore / 100) * 283} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      fontSize="22"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#1f2937"
                    >
                      {similarityScore}%
                    </text>
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">
                {similarityScore > 70
                  ? 'These products are very similar with many matching specifications!'
                  : similarityScore > 40
                  ? 'These products have moderate similarity with some matching specifications.'
                  : 'These products have substantial differences in specifications.'}
              </p>
            </motion.div>
          )}

          {/* Best Product Recommendation */}
          {(() => {
            const bestProduct = getBestProduct();
            return bestProduct && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg p-6 mb-10 border-2 border-warning-200"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-warning-500 rounded-full p-3 mr-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">🏆 Best Choice</h2>
                    <p className="text-gray-600">Based on our analysis</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                        <img
                          src={
                            bestProduct.product.images && bestProduct.product.images[0]
                              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/images/${bestProduct.product.images[0]}`
                              : '/placeholder.svg'
                          }
                          alt={bestProduct.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{bestProduct.product.name}</h3>
                        <p className="text-gray-600">{bestProduct.product.brand}</p>
                        {bestProduct.product.rating && bestProduct.product.rating > 0 && bestProduct.product.reviewCount && bestProduct.product.reviewCount > 0 && (
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-warning-500 fill-current mr-1" />
                            <span className="text-sm text-gray-600">
                              {bestProduct.product.rating.toFixed(1)} ({bestProduct.product.reviewCount} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success-600">
                        ${bestProduct.product.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {Math.round(bestProduct.score)}/100
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-success-500" />
                      Why this is the best choice:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bestProduct.reasons.map((reason, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Specs comparison table */}
          {selectedProducts.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Specifications Comparison
                  </h2>
                  <p className="text-gray-600">Compare technical specifications side by side</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-left text-gray-500 font-medium">
                        Specification
                      </th>
                      {selectedProducts.map((product) => (
                        <th
                          key={product._id}
                          className="py-4 px-6 text-left text-gray-500 font-medium"
                        >
                          {product.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getAllSpecifications().map((specName) => (
                      <tr key={specName} className="hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium">{specName}</td>
                        {selectedProducts.map((product) => {
                          const spec = product.specifications.find((s) => s.name === specName);
                          const otherValues = selectedProducts
                            .filter((p) => p._id !== product._id)
                            .map((p) => p.specifications.find((s) => s.name === specName)?.value);

                          const isMatch = spec && otherValues.every((val) => val === spec.value);
                          const isPartialMatch =
                            spec && otherValues.some((val) => val === spec.value);
                          const isDifferent = spec && otherValues.length > 0 && !isPartialMatch;

                          return (
                            <td
                              key={`${product._id}-${specName}`}
                              className={`py-4 px-6 ${
                                !spec
                                  ? 'text-gray-400 italic'
                                  : isDifferent
                                  ? 'text-pink-600 font-medium'
                                  : isMatch
                                  ? 'text-primary-600 font-medium'
                                  : isPartialMatch
                                  ? 'text-warning-600 font-medium'
                                  : ''
                              }`}
                            >
                              {spec ? (
                                <div className="flex items-center">
                                  {isDifferent && (
                                    <XCircle className="w-4 h-4 mr-1 text-pink-500" />
                                  )}
                                  {isMatch && (
                                    <CheckCircle2 className="w-4 h-4 mr-1 text-primary-500" />
                                  )}
                                  {isPartialMatch && !isMatch && (
                                    <PieChart className="w-4 h-4 mr-1 text-warning-500" />
                                  )}
                                  {spec.value}
                                </div>
                              ) : (
                                'Not specified'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-4 px-6">Price</td>
                      {selectedProducts.map((product) => (
                        <td key={`${product._id}-price`} className="py-4 px-6">
                          ${product.price.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mr-2"></div>
                    <span>Matching specs</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                    <span>Partially matching</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span>Different specs</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {selectedProducts.length === 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-md p-10 text-center"
            >
              <div className="flex justify-center mb-4 text-primary-500">
                <PlusCircle className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold mb-2">Start comparing products</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory 
                  ? `Select ${categoryTitles[selectedCategory]} from the dropdown above to add them to the comparison. You can compare up to 3 products side by side.`
                  : 'Choose a category first, then select products to add them to the comparison. You can compare up to 3 products side by side.'
                }
              </p>
              {!selectedCategory && (
                <p className="text-sm text-gray-500 italic">
                  💡 Tip: Click on a category button above to get started!
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCompare;


