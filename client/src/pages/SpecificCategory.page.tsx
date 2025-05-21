// CategoryPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Star,
  X,
  Smartphone,
  Laptop,
  Headphones,
  Tablet,
  BarChart3,
  Watch,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../hooks/store/store';
import { useAppDispatch, useAppSelector } from '../hooks/store/hooks';
import { GetProductsByCategory } from '../hooks/store/thunk/product.thunk';
import type {
  Product,
  productByCategory,
  productByCategoryResponse,
  productResponse,
  DeleteProductResponse,
} from '../hooks/store/slice/product.slices';

// Import animation variants from your existing code
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Category icons mapping - using a more generic approach
const CategoryIcon = ({ category }: { category: string }) => {
  // Use a generic icon for all categories since we don't know what categories exist
  return <BarChart3 className="h-5 w-5" />;
};

// Interface for filter options
interface FilterOption {
  name: string;
  options: string[];
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

// Extended Product type with optional rating fields
interface ExtendedProduct extends Product {
  rating?: number;
  reviewCount?: number;
}

// Function to generate filters from products
const generateFiltersFromProducts = (products: ExtendedProduct[]): FilterOption[] => {
  // Create a Map to store unique values for each specification
  const filterMap = new Map<string, Set<string>>();

  // Process each product's specifications
  products.forEach((product) => {
    // Add specification-based filters
    product.specifications.forEach((spec) => {
      if (!filterMap.has(spec.name)) {
        filterMap.set(spec.name, new Set());
      }
      filterMap.get(spec.name)?.add(spec.value);
    });
  });

  // Convert Map to array of filter objects and sort by number of options
  const filters = Array.from(filterMap)
    .map(([name, options]) => ({
      name,
      options: Array.from(options).sort(),
    }))
    .filter((filter) => filter.options.length > 0) // Only include filters with options
    .sort((a, b) => b.options.length - a.options.length); // Sort by number of options

  // Return top 5 filters or all if less than 5
  return filters.slice(0, 5);
};

// Main CategoryPage component
const SpecificCategoryPage = () => {
  const [productsByCategory, setProductsByCategory] = useState<productByCategory[]>([]);
  const { data, loading } = useSelector((state: RootState) => state.product);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([]);
  const { category } = useParams<{ category: string }>();

  // Get categories from Redux data
  useEffect(() => {
    if (data && isProductByCategoryResponse(data)) {
      setProductsByCategory(data.data || []);
    } else {
      console.error('Unexpected data format:', data);
      setProductsByCategory([]); // Set empty array as fallback
    }
  }, [data]);

  // Update products and generate filters
  useEffect(() => {
    if (category && productsByCategory.length > 0) {
      const selectedCategory = productsByCategory.find((cat) => cat._id === category);
      const categoryProducts = selectedCategory ? selectedCategory.products : [];
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);

      // Generate dynamic filters (limited to 5)
      const filters = generateFiltersFromProducts(categoryProducts);
      setCategoryFilters(filters);

      // Reset active filters
      setActiveFilters({});
      setExpandedFilters([]);
    }
  }, [category, productsByCategory]);

  // Sort products by rating (high to low)
  const sortByRating = (a: ExtendedProduct, b: ExtendedProduct): number => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ratingB - ratingA;
  };

  // Sort products by price (low to high)
  const sortByPrice = (a: ExtendedProduct, b: ExtendedProduct): number => {
    return parseFloat(a.price) - parseFloat(b.price);
  };

  // Sort products by name (A to Z)
  const sortByName = (a: ExtendedProduct, b: ExtendedProduct): number => {
    return a.name.localeCompare(b.name);
  };

  // Apply sorting
  const applySorting = (productsToSort: ExtendedProduct[], sortType: string): ExtendedProduct[] => {
    switch (sortType) {
      case 'rating':
        return [...productsToSort].sort(sortByRating);
      case 'price':
        return [...productsToSort].sort(sortByPrice);
      case 'name':
        return [...productsToSort].sort(sortByName);
      default:
        return productsToSort;
    }
  };

  // Apply filters when activeFilters changes
  useEffect(() => {
    let result = [...products];
    // Apply active filters
    Object.entries(activeFilters).forEach(([filterName, selectedOptions]) => {
      if (selectedOptions.length > 0) {
        result = result.filter((product) => {
          // Look for matches in specifications
          const spec = product.specifications.find((s) => s.name === filterName);
          if (spec) {
            // Check if any selected option is included in the spec value
            return selectedOptions.some((option) => spec.value.includes(option));
          }
          return false;
        });
      }
    });

    // Apply sorting
    result = applySorting(result, sortOption);

    setFilteredProducts(result);
  }, [activeFilters, products, sortOption]);

  // Toggle a filter option
  const toggleFilter = (filterName: string, option: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterName] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];

      return {
        ...prev,
        [filterName]: updated,
      };
    });
  };

  // Toggle expanded filter section
  const toggleExpandedFilter = (filterName: string) => {
    setExpandedFilters((prev) =>
      prev.includes(filterName) ? prev.filter((f) => f !== filterName) : [...prev, filterName]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
  };

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If category doesn't exist
  if (!category || !productsByCategory.some((cat) => cat._id === category)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Return to Home
        </Link>
      </div>
    );
  }

  const findCategoryData = productsByCategory.find((cat) => cat._id === category)?.category;
  const findDescriptionData = productsByCategory.find((cat) => cat._id === category)?.description;

  // Format price with currency
  const formatPrice = (price: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <>
      <Helmet>
        <title>{findCategoryData} | Your Store</title>
        <meta 
          name="description" 
          content={findCategoryData ? `Browse our collection of ${findCategoryData} with detailed specifications and comparisons.` : 'Browse our product collection.'} 
        />
      </Helmet>

      {/* Hero section */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div variants={fadeInUp}>
            <div className="flex items-center mb-2">
              <CategoryIcon category={findCategoryData || ''} />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span>{findCategoryData}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{findCategoryData}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl">{findDescriptionData}</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile filters button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filters */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setMobileFiltersOpen(false)}
              ></div>
              <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile filter options */}
                <div className="mt-4 border-t border-gray-200">
                  {categoryFilters.map((filter) => (
                    <div key={filter.name} className="px-4 py-6 border-b border-gray-200">
                      <h3 className="flow-root -mx-2 -my-3">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500"
                          onClick={() => toggleExpandedFilter(filter.name)}
                        >
                          <span className="font-medium text-gray-900">{filter.name}</span>
                          <span className="ml-6 flex items-center">
                            {expandedFilters.includes(filter.name) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </span>
                        </button>
                      </h3>

                      {expandedFilters.includes(filter.name) && (
                        <div className="pt-6 pl-2">
                          <div className="space-y-4">
                            {filter.options.map((option) => (
                              <div key={option} className="flex items-center">
                                <input
                                  id={`mobile-${filter.name}-${option}`}
                                  name={`${filter.name}[]`}
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={(activeFilters[filter.name] || []).includes(option)}
                                  onChange={() => toggleFilter(filter.name, option)}
                                />
                                <label
                                  htmlFor={`mobile-${filter.name}-${option}`}
                                  className="ml-3 text-sm text-gray-600"
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Active filter count and clear button */}
                {Object.values(activeFilters).some((arr) => arr.length > 0) && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {Object.values(activeFilters).flat().length} active filters
                      </span>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop sidebar filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="space-y-6">
              {categoryFilters.map((filter) => (
                <div key={filter.name} className="border-b border-gray-200 pb-6">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500"
                    onClick={() => toggleExpandedFilter(filter.name)}
                  >
                    <span className="font-medium text-gray-900">{filter.name}</span>
                    <span className="ml-6 flex items-center">
                      {expandedFilters.includes(filter.name) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </span>
                  </button>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedFilters.includes(filter.name) ? 'auto' : 0,
                      opacity: expandedFilters.includes(filter.name) ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-2 space-y-4">
                      {filter.options.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            id={`${filter.name}-${option}`}
                            name={`${filter.name}[]`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={(activeFilters[filter.name] || []).includes(option)}
                            onChange={() => toggleFilter(filter.name, option)}
                          />
                          <label
                            htmlFor={`${filter.name}-${option}`}
                            className="ml-3 text-sm text-gray-600"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Active filter count and clear button */}
            {Object.values(activeFilters).some((arr) => arr.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {Object.values(activeFilters).flat().length} active filters
                  </span>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <p className="text-gray-500 text-sm">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              {/* Sort options */}
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    variants={fadeInUp}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
                  >
                    <Link to={`/product/${product._id}`} className="block">
                      <div className="relative pb-[60%] overflow-hidden">
                        <img
                          src={
                            product.images[0]?.startsWith('http')
                              ? product.images[0]
                              : `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                          }
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                          {product.name}
                        </h3>
                        <div className="flex items-center mt-2.5 mb-5">
                          {/* Show rating stars only if rating exists */}
                          {product.rating && (
                            <>
                              {[...Array(5)].map((_, index) => (
                                <svg
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < Math.floor(product.rating || 0)
                                      ? 'text-yellow-300'
                                      : 'text-gray-300'
                                  }`}
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                  viewBox="0 0 22 20"
                                >
                                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                </svg>
                              ))}
                              {product.reviewCount && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ms-3">
                                  {product.reviewCount} reviews
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(product.price.toString())}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecificCategoryPage;
