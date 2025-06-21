// CategoryPage.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  BarChart3,
  Search,
  Star,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../hooks/store/store';
import { useAppDispatch } from '../hooks/store/hooks';
import { GetProductsByCategory } from '../hooks/store/thunk/product.thunk';
import { usePagination, useLoadMore } from '../hooks/usePagination';
import type {
  Product,
  productByCategory,
  productByCategoryResponse,
  productResponse,
  DeleteProductResponse,
} from '../hooks/store/slice/product.slices';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const CategoryIcon = ({ category }: { category: string }) => (
  <BarChart3 className="h-5 w-5" />
);

interface FilterOption {
  name: string;
  options: string[];
  type: 'mandatory' | 'common';
  icon?: React.ComponentType<any>;
}

const isProductByCategoryResponse = (
  response: productResponse | productByCategoryResponse | DeleteProductResponse | null
): response is productByCategoryResponse => {
  return !!(
    response &&
    'success' in response &&
    'data' in response &&
    'message' in response &&
    'statusCode' in response &&
    response.success &&
    Array.isArray(response.data)
  );
};

interface ExtendedProduct extends Product {
  rating?: number;
  reviewCount?: number;
}

/**
 * Generate mandatory and common filters for products
 */
const generateCategoryFilters = (products: ExtendedProduct[]): FilterOption[] => {
  const filters: FilterOption[] = [];

  // MANDATORY FILTERS
  
  // 1. Price Filter (mandatory)
  const priceRanges = [
    'Under $100',
    '$100 - $300',
    '$300 - $500',
    '$500 - $1000',
    'Over $1000'
  ];
  filters.push({
    name: 'Price Range',
    options: priceRanges,
    type: 'mandatory',
    icon: DollarSign
  });

  // 2. Brand Filter (mandatory)
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  if (brands.length > 0) {
    filters.push({
      name: 'Brand',
      options: brands,
      type: 'mandatory',
      icon: Tag
    });
  }

  // COMMON FILTERS
  
  // 3. Rating Filter (common)
  const ratingOptions = ['4+ Stars', '3+ Stars', '2+ Stars', '1+ Stars'];
  filters.push({
    name: 'Rating',
    options: ratingOptions,
    type: 'common',
    icon: Star
  });

  // 4. Additional spec filters (pick top 2 most common specs)
  const freq = new Map<string, number>();
  products.forEach((p) =>
    p.specifications.forEach((s) =>
      freq.set(s.name, (freq.get(s.name) || 0) + 1)
    )
  );

  const topSpecs = Array.from(freq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([name]) => name);

  topSpecs.forEach((specName) => {
    const vals = new Set<string>();
    products.forEach((p) =>
      p.specifications
        .filter((s) => s.name === specName)
        .forEach((s) => vals.add(s.value))
    );
    if (vals.size > 0) {
      filters.push({
        name: specName,
        options: Array.from(vals).sort(),
        type: 'common'
      });
    }
  });

  return filters;
};

const SpecificCategoryPage = () => {
  const dispatch = useAppDispatch();
  const { categoryProducts, loading } = useSelector((state: RootState) => state.product);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([]);
  const { category } = useParams<{ category: string }>();
  
  const { loadMoreCategoryProducts } = useLoadMore();
  const { loadInitial } = usePagination({ 
    type: 'categoryProducts', 
    category: category || '', 
    filters: {} 
  });

  // Build server-side filters object
  const buildServerFilters = useMemo(() => {
    const filters: any = {};
    
    // Search
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }
    
    // Price Range
    if (activeFilters['Price Range']?.length > 0) {
      const priceRange = activeFilters['Price Range'][0];
      switch (priceRange) {
        case 'Under $100':
          filters.priceRange = 'under-100';
          break;
        case '$100 - $300':
          filters.priceRange = '100-300';
          break;
        case '$300 - $500':
          filters.priceRange = '300-500';
          break;
        case '$500 - $1000':
          filters.priceRange = '500-1000';
          break;
        case 'Over $1000':
          filters.priceRange = 'over-1000';
          break;
      }
    }
    
    // Brand
    if (activeFilters['Brand']?.length > 0) {
      filters.brand = activeFilters['Brand'][0];
    }
    
    // Rating
    if (activeFilters['Rating']?.length > 0) {
      const rating = activeFilters['Rating'][0];
      switch (rating) {
        case '4+ Stars':
          filters.minRating = 4;
          break;
        case '3+ Stars':
          filters.minRating = 3;
          break;
        case '2+ Stars':
          filters.minRating = 2;
          break;
        case '1+ Stars':
          filters.minRating = 1;
          break;
      }
    }
    
    // Specifications
    const specFilters: Array<{name: string; value: string}> = [];
    Object.entries(activeFilters).forEach(([filterName, values]) => {
      if (!['Price Range', 'Brand', 'Rating'].includes(filterName) && values.length > 0) {
        values.forEach(value => {
          specFilters.push({ name: filterName, value });
        });
      }
    });
    if (specFilters.length > 0) {
      filters.specifications = specFilters;
    }
    
    return filters;
  }, [activeFilters, searchQuery]);

  // Fetch initial data when category or filters change
  useEffect(() => {
    if (category) {
      const sortBy = sortOption === 'price-low' ? 'price' : 
                     sortOption === 'price-high' ? 'price' :
                     sortOption === 'rating' ? 'rating' : 'createdAt';
      const sortOrder = sortOption === 'price-high' ? 'desc' : 'asc';
      
      dispatch(GetProductsByCategory({
        category,
        limit: 20,
        offset: 0,
        sortBy,
        sortOrder,
        filters: buildServerFilters
      }));
    }
  }, [dispatch, category, buildServerFilters, sortOption]);

  // Generate filters from current products for UI
  useEffect(() => {
    if (categoryProducts.data.length > 0) {
      setCategoryFilters(generateCategoryFilters(categoryProducts.data as ExtendedProduct[]));
    }
  }, [categoryProducts.data]);

  // Load more products
  const handleLoadMore = () => {
    if (category && categoryProducts.hasMore && !categoryProducts.loading) {
      const sortBy = sortOption === 'price-low' ? 'price' : 
                     sortOption === 'price-high' ? 'price' :
                     sortOption === 'rating' ? 'rating' : 'createdAt';
      const sortOrder = sortOption === 'price-high' ? 'desc' : 'asc';
      
      loadMoreCategoryProducts({
        category,
        currentData: categoryProducts.data,
        limit: 20,
        filters: buildServerFilters,
        sortBy,
        sortOrder
      });
    }
  };

  // Enhanced filtering logic with price, brand, rating, and search
  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const toggleFilter = (name: string, opt: string) => {
    setActiveFilters((prev) => {
      const curr = prev[name] || [];
      const next = curr.includes(opt)
        ? curr.filter((x) => x !== opt)
        : [...curr, opt];
      return { ...prev, [name]: next };
    });
  };

  const toggleExpandedFilter = (name: string) =>
    setExpandedFilters((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );

  const clearFilters = () => setActiveFilters({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">
          The category you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Return to Home
        </Link>
      </div>
    );
  }
  const findCategoryData = category.charAt(0).toUpperCase() + category.slice(1);
  const findDescriptionData = `Browse our collection of ${findCategoryData} products`;

  const formatPrice = (price: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));

  return (
    <>
      <Helmet>
        <title>{findCategoryData} | Your Store</title>
        <meta
          name="description"
          content={
            findCategoryData
              ? `Browse our collection of ${findCategoryData} with detailed specifications and comparisons.`
              : 'Browse our product collection.'
          }
        />
      </Helmet>

      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div variants={fadeInUp}>
            <div className="flex items-center mb-2">
              <CategoryIcon category={findCategoryData} />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span>{findCategoryData}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{findCategoryData}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
              {findDescriptionData}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
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
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black bg-opacity-25"
                onClick={() => setMobileFiltersOpen(false)}
              />
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

          <div className="hidden lg:block w-64 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            {/* All Filters */}
            <div className="space-y-4">
              {categoryFilters.map((filter) => (
                <div key={filter.name} className="border-b border-gray-200 pb-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-sm text-gray-400 hover:text-gray-500"
                    onClick={() => toggleExpandedFilter(filter.name)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{filter.name}</span>
                    </div>
                    <span className="ml-6 flex items-center">
                      {expandedFilters.includes(filter.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
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
                    <div className="pt-3 pl-2 space-y-3">
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

          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <p className="text-gray-500 text-sm">
                Showing {categoryProducts.data.length} of {categoryProducts.total} products
                {searchQuery && <span className="ml-1">for "{searchQuery}"</span>}
              </p>
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

            {categoryProducts.data.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || Object.keys(activeFilters).length > 0
                    ? "No products match your current filters or search criteria."
                    : `No products available in the ${category} category yet.`}
                </p>
                {(searchQuery || Object.keys(activeFilters).length > 0) ? (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/categories"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse All Categories
                  </Link>
                )}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {categoryProducts.data.map((product) => (
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
                              : `http://localhost:5000/images/${product.images[0]}`
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
                          {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating || 0) ? 'text-warning-300' : 'text-gray-300'
                                  }`}
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                  viewBox="0 0 22 20"
                                >
                                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                </svg>
                              ))}
                              <span className="bg-info-100 text-info-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-info-200 dark:text-info-800 ms-3">
                                {product.reviewCount} reviews
                              </span>
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
            
            {/* Load More Button */}
            {categoryProducts.hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={categoryProducts.loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {categoryProducts.loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Products
                      <ChevronDown className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecificCategoryPage;

