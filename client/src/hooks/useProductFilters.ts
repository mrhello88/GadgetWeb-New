import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';
import axiosInstance from './services/api';
import useErrorHandler from './useErrorHandler';

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
}

export interface SortOptions {
  sortBy: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

interface UseProductFiltersResult {
  // State
  filters: ProductFilters;
  sortOptions: SortOptions;
  pagination: PaginationOptions;
  products: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;

  // Actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  updateFilter: (key: keyof ProductFilters, value: string | number | undefined) => void;
  clearFilters: () => void;
  setSortOptions: (options: Partial<SortOptions>) => void;
  loadProducts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;

  // Derived state
  hasActiveFilters: boolean;
  isFirstLoad: boolean;
}

const DEFAULT_FILTERS: ProductFilters = {};
const DEFAULT_SORT: SortOptions = { sortBy: 'createdAt', sortOrder: 'desc' };
const DEFAULT_PAGINATION: PaginationOptions = { limit: 20, offset: 0 };

export const useProductFilters = (): UseProductFiltersResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleApiError } = useErrorHandler();

  // State
  const [filters, setFiltersState] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sortOptions, setSortOptionsState] = useState<SortOptions>(DEFAULT_SORT);
  const [pagination, setPagination] = useState<PaginationOptions>(DEFAULT_PAGINATION);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Derived state
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  // Actions
  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(DEFAULT_PAGINATION); // Reset pagination when filters change
  }, []);

  const updateFilter = useCallback((key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const setSortOptions = useCallback((options: Partial<SortOptions>) => {
    setSortOptionsState(prev => ({ ...prev, ...options }));
    setPagination(DEFAULT_PAGINATION); // Reset pagination when sort changes
  }, []);

  const loadProducts = useCallback(async (reset = false) => {
    const currentPagination = reset ? DEFAULT_PAGINATION : pagination;
    
    setLoading(true);
    setError(null);

    try {
      const hasFilters = Object.values(filters).some(value => 
        value !== undefined && value !== null && value !== ''
      );

      let response;
      
      if (hasFilters) {
        // Use filtered query
        response = await axiosInstance.post('/graphql', {
          query: `
            query GetProductsByFilters(
              $filters: ProductFiltersInput!
              $limit: Int
              $offset: Int
              $sortBy: String
              $sortOrder: String
            ) {
              getProductsByFilters(
                filters: $filters
                limit: $limit
                offset: $offset
                sortBy: $sortBy
                sortOrder: $sortOrder
              ) {
                success
                message
                data {
                  _id
                  name
                  description
                  price
                  category
                  brand
                  specifications {
                    name
                    value
                  }
                  features
                  images
                  rating
                  reviewCount
                }
                total
                hasMore
                statusCode
              }
            }
          `,
          variables: {
            filters,
            limit: currentPagination.limit,
            offset: currentPagination.offset,
            sortBy: sortOptions.sortBy,
            sortOrder: sortOptions.sortOrder,
          },
        });

        const result = response?.data?.data?.getProductsByFilters;
        
        if (result?.success) {
          if (reset || currentPagination.offset === 0) {
            setProducts(result.data || []);
          } else {
            setProducts(prev => [...prev, ...(result.data || [])]);
          }
          setTotal(result.total || 0);
          setHasMore(result.hasMore || false);
        } else {
          throw new Error(result?.message || 'Failed to fetch filtered products');
        }
      } else {
        // Use regular query for all products
        response = await axiosInstance.post('/graphql', {
          query: `
            query GetAllProducts(
              $limit: Int
              $offset: Int
              $sortBy: String
              $sortOrder: String
            ) {
              getAllProducts(
                limit: $limit
                offset: $offset
                sortBy: $sortBy
                sortOrder: $sortOrder
              ) {
                success
                message
                data {
                  _id
                  name
                  description
                  price
                  category
                  brand
                  specifications {
                    name
                    value
                  }
                  features
                  images
                  rating
                  reviewCount
                }
                total
                hasMore
                statusCode
              }
            }
          `,
          variables: {
            limit: currentPagination.limit,
            offset: currentPagination.offset,
            sortBy: sortOptions.sortBy,
            sortOrder: sortOptions.sortOrder,
          },
        });

        const result = response?.data?.data?.getAllProducts;
        
        if (result?.success) {
          if (reset || currentPagination.offset === 0) {
            setProducts(result.data || []);
          } else {
            setProducts(prev => [...prev, ...(result.data || [])]);
          }
          setTotal(result.total || 0);
          setHasMore(result.hasMore || false);
        } else {
          throw new Error(result?.message || 'Failed to fetch products');
        }
      }

      setIsFirstLoad(false);
    } catch (error) {
      const handledError = handleApiError(error);
      setError(handledError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sortOptions, pagination, handleApiError]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSortOptionsState(DEFAULT_SORT);
    setPagination(DEFAULT_PAGINATION);
    setProducts([]);
    setError(null);
    setHasMore(true);
    setTotal(0);
    setIsFirstLoad(true);
  }, []);

  // Load products when pagination changes (for loadMore)
  useEffect(() => {
    if (pagination.offset > 0) {
      loadProducts(false);
    }
  }, [pagination.offset]);

  // Load products when filters or sort options change
  useEffect(() => {
    loadProducts(true);
  }, [filters, sortOptions]);

  return {
    // State
    filters,
    sortOptions,
    pagination,
    products,
    loading,
    error,
    hasMore,
    total,

    // Actions
    setFilters,
    updateFilter,
    clearFilters,
    setSortOptions,
    loadProducts,
    loadMore,
    reset,

    // Derived state
    hasActiveFilters,
    isFirstLoad,
  };
};

export default useProductFilters; 