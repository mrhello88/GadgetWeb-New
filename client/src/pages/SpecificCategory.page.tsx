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
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../hooks/store/store';
import { useAppDispatch } from '../hooks/store/hooks';
import { GetProductsByCategory } from '../hooks/store/thunk/product.thunk';
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
 * Build filters from the 5 most-common spec names in `products`.
 */
const generateTopFiveFilters = (products: ExtendedProduct[]): FilterOption[] => {
  // 1) count frequency of each spec name
  const freq = new Map<string, number>();
  products.forEach((p) =>
    p.specifications.forEach((s) =>
      freq.set(s.name, (freq.get(s.name) || 0) + 1)
    )
  );

  // 2) pick top 5 spec names by descending count
  const topNames = Array.from(freq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  // 3) for each top name, collect unique values
  return topNames.map((name) => {
    const vals = new Set<string>();
    products.forEach((p) =>
      p.specifications
        .filter((s) => s.name === name)
        .forEach((s) => vals.add(s.value))
    );
    return { name, options: Array.from(vals).sort() };
  });
};

const SpecificCategoryPage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useSelector((state: RootState) => state.product);
  const [productsByCategory, setProductsByCategory] = useState<productByCategory[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { category } = useParams<{ category: string }>();

  // fetch on mount/category change
  useEffect(() => {
    if (category) {
      dispatch(GetProductsByCategory(category));
    }
  }, [dispatch, category]);

  // respond to redux data
  useEffect(() => {
    if (isProductByCategoryResponse(data)) {
      setProductsByCategory(data.data || []);
    } else {
      setProductsByCategory([]);
      console.error('Unexpected data format:', data);
    }
  }, [data]);

  // update products + filters when category or data updates
  useEffect(() => {
    if (!category) return;
    const cat = productsByCategory.find((c) => c._id === category);
    const prods: ExtendedProduct[] = cat ? cat.products : [];
    setProducts(prods);
    setFilteredProducts(prods);
    // build the top-5 most common spec filters
    setCategoryFilters(generateTopFiveFilters(prods));
    // clear filters for fresh view
    setActiveFilters({});
    setExpandedFilters([]);
  }, [category, productsByCategory]);

  const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([]);

  // sorting helpers
  const sortByRating = (a: ExtendedProduct, b: ExtendedProduct) =>
    (b.rating || 0) - (a.rating || 0);
  const sortByPrice = (a: ExtendedProduct, b: ExtendedProduct) =>
    parseFloat(a.price) - parseFloat(b.price);
  const sortByName = (a: ExtendedProduct, b: ExtendedProduct) =>
    a.name.localeCompare(b.name);

  const applySorting = (arr: ExtendedProduct[], type: string) => {
    switch (type) {
      case 'rating':
        return [...arr].sort(sortByRating);
      case 'price-low':
        return [...arr].sort(sortByPrice);
      case 'price-high':
        return [...arr].sort((a, b) => -sortByPrice(a, b));
      case 'name':
        return [...arr].sort(sortByName);
      default:
        return arr;
    }
  };

  // apply filters + sort whenever they change
  useEffect(() => {
    let result = [...products];
    Object.entries(activeFilters).forEach(([name, opts]) => {
      if (opts.length) {
        result = result.filter((p) => {
          const spec = p.specifications.find((s) => s.name === name);
          return spec && opts.some((o) => spec.value.includes(o));
        });
      }
    });
    result = applySorting(result, sortOption);
    setFilteredProducts(result);
  }, [activeFilters, products, sortOption]);

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
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!category || !productsByCategory.some((c) => c._id === category)) {
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

  const categoryData = productsByCategory.find((c) => c._id === category)!;
  const findCategoryData = categoryData.category;
  const findDescriptionData = categoryData.description;

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <p className="text-gray-500 text-sm">
                Showing {filteredProducts.length} of {products.length} products
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
                          {product.rating && (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating) ? 'text-yellow-300' : 'text-gray-300'
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
