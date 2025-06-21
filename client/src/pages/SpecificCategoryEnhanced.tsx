// Enhanced SpecificCategory Page with Mandatory and Common Filters
'use client';

import React, { useEffect, useState } from 'react';
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
import type {
  Product,
  productByCategory,
  productByCategoryResponse,
  productResponse,
  DeleteProductResponse,
} from '../hooks/store/slice/product.slices';

interface FilterOption {
  name: string;
  options: string[];
  type: 'mandatory' | 'common';
  icon?: React.ComponentType<any>;
}

interface ExtendedProduct extends Product {
  rating?: number;
  reviewCount?: number;
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

const generateCategoryFilters = (products: ExtendedProduct[]): FilterOption[] => {
  const filters: FilterOption[] = [];

  // MANDATORY FILTERS
  
  // 1. Price Filter (mandatory)
  filters.push({
    name: 'Price Range',
    options: ['Under $100', '$100 - $300', '$300 - $500', '$500 - $1000', 'Over $1000'],
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
  filters.push({
    name: 'Rating',
    options: ['4+ Stars', '3+ Stars', '2+ Stars', '1+ Stars'],
    type: 'common',
    icon: Star
  });

  // 4. Additional spec filters (top 2 most common)
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

const EnhancedSpecificCategoryPage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useSelector((state: RootState) => state.product);
  const [productsByCategory, setProductsByCategory] = useState<productByCategory[]>([]);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedFilters, setExpandedFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([]);
  const { category } = useParams<{ category: string }>();

  // Fetch data
  useEffect(() => {
    if (category) {
      dispatch(GetProductsByCategory({
        category,
        limit: 20,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }));
    }
  }, [dispatch, category]);

  // Handle data response
  useEffect(() => {
    if (isProductByCategoryResponse(data)) {
      setProductsByCategory(data.data || []);
    } else {
      setProductsByCategory([]);
    }
  }, [data]);

  // Update products when category changes
  useEffect(() => {
    if (!category) return;
    const cat = productsByCategory.find((c) => c._id === category);
    const prods: ExtendedProduct[] = cat ? cat.products : [];
    setProducts(prods);
    setFilteredProducts(prods);
    setCategoryFilters(generateCategoryFilters(prods));
    setActiveFilters({});
    setExpandedFilters([]);
    setSearchQuery('');
  }, [category, productsByCategory]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterName, selectedOptions]) => {
      if (selectedOptions.length === 0) return;

      if (filterName === 'Price Range') {
        result = result.filter((p) => {
          const price = parseFloat(p.price);
          return selectedOptions.some((option) => {
            switch (option) {
              case 'Under $100': return price < 100;
              case '$100 - $300': return price >= 100 && price <= 300;
              case '$300 - $500': return price >= 300 && price <= 500;
              case '$500 - $1000': return price >= 500 && price <= 1000;
              case 'Over $1000': return price > 1000;
              default: return false;
            }
          });
        });
      } else if (filterName === 'Brand') {
        result = result.filter((p) => selectedOptions.includes(p.brand));
      } else if (filterName === 'Rating') {
        result = result.filter((p) => {
          const rating = p.rating || 0;
          return selectedOptions.some((option) => {
            switch (option) {
              case '4+ Stars': return rating >= 4;
              case '3+ Stars': return rating >= 3;
              case '2+ Stars': return rating >= 2;
              case '1+ Stars': return rating >= 1;
              default: return false;
            }
          });
        });
      } else {
        // Specification filters
        result = result.filter((p) => {
          const spec = p.specifications.find((s) => s.name === filterName);
          return spec && selectedOptions.some((o) => spec.value.includes(o));
        });
      }
    });

    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.reverse();
        break;
    }

    setFilteredProducts(result);
  }, [activeFilters, products, sortOption, searchQuery]);

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

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!category || !productsByCategory.some((c) => c._id === category)) {
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

  const categoryData = productsByCategory.find((c) => c._id === category)!;

  return (
    <>
      <Helmet>
        <title>{categoryData.category} | Your Store</title>
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{categoryData.category}</h1>
          <p className="text-gray-600 max-w-3xl">{categoryData.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
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
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            {/* All Filters */}
            <div className="space-y-4">
              {categoryFilters.map((filter) => (
                <div key={filter.name} className="border-b border-gray-200 pb-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-sm hover:text-gray-500"
                    onClick={() => toggleExpandedFilter(filter.name)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{filter.name}</span>
                    </div>
                    {expandedFilters.includes(filter.name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedFilters.includes(filter.name) && (
                    <div className="pt-3 pl-2 space-y-3">
                      {filter.options.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            id={`${filter.name}-${option}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={(activeFilters[filter.name] || []).includes(option)}
                            onChange={() => toggleFilter(filter.name, option)}
                          />
                          <label htmlFor={`${filter.name}-${option}`} className="ml-3 text-sm text-gray-600">
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {Object.values(activeFilters).some((arr) => arr.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800">
                  Clear all filters ({Object.values(activeFilters).flat().length})
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && <span className="ml-1">for "{searchQuery}"</span>}
              </p>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products match your filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/product/${product._id}`}>
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={
                            product.images[0]?.startsWith('http')
                              ? product.images[0]
                              : `http://localhost:5000/images/${product.images[0]}`
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        {product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0 && (
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating || 0) ? 'text-warning-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">({product.reviewCount})</span>
                          </div>
                        )}
                        <p className="text-xl font-bold text-gray-900">
                          ${parseFloat(product.price).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedSpecificCategoryPage; 
