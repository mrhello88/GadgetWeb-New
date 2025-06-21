import { useCallback } from 'react';
import { useAppDispatch } from './store/hooks';
import { GetAllProducts, GetProductsByCategory, GetCategories } from './store/thunk/product.thunk';

interface UsePaginationProps {
  type: 'products' | 'categoryProducts' | 'categories';
  category?: string;
  filters?: any;
  limit?: number;
}

export const usePagination = ({ type, category, filters, limit = 20 }: UsePaginationProps) => {
  const dispatch = useAppDispatch();

  const loadMore = useCallback((currentData: any[], currentPage: number) => {
    const offset = currentPage * limit;
    
    switch (type) {
      case 'products':
        return dispatch(GetAllProducts({ 
          limit, 
          offset,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }));
      
      case 'categoryProducts':
        if (!category) return Promise.reject('Category is required');
        return dispatch(GetProductsByCategory({ 
          category,
          limit, 
          offset,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          filters
        }));
      
      case 'categories':
        return dispatch(GetCategories({ 
          limit: limit || 10, 
          offset 
        }));
      
      default:
        return Promise.reject('Invalid type');
    }
  }, [dispatch, type, category, filters, limit]);

  const loadInitial = useCallback((searchTerm?: string, customFilters?: any) => {
    switch (type) {
      case 'products':
        return dispatch(GetAllProducts({ 
          limit, 
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          search: searchTerm
        }));
      
      case 'categoryProducts':
        if (!category) return Promise.reject('Category is required');
        return dispatch(GetProductsByCategory({ 
          category,
          limit, 
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          filters: customFilters || filters
        }));
      
      case 'categories':
        return dispatch(GetCategories({ 
          limit: limit || 10, 
          offset: 0 
        }));
      
      default:
        return Promise.reject('Invalid type');
    }
  }, [dispatch, type, category, filters, limit]);

  return { loadMore, loadInitial };
};

// Hook for load more with automatic state management
export const useLoadMore = () => {
  const dispatch = useAppDispatch();

  const loadMoreProducts = useCallback((params: {
    currentData: any[];
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const { currentData, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const offset = currentData.length;
    
    return dispatch(GetAllProducts({ 
      limit, 
      offset,
      sortBy,
      sortOrder,
      search
    }));
  }, [dispatch]);

  const loadMoreCategoryProducts = useCallback((params: {
    category: string;
    currentData: any[];
    limit?: number;
    filters?: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const { category, currentData, limit = 20, filters, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const offset = currentData.length;
    
    return dispatch(GetProductsByCategory({ 
      category,
      limit, 
      offset,
      sortBy,
      sortOrder,
      filters
    }));
  }, [dispatch]);

  const loadMoreCategories = useCallback((params: {
    currentData: any[];
    limit?: number;
  }) => {
    const { currentData, limit = 10 } = params;
    const offset = currentData.length;
    
    return dispatch(GetCategories({ 
      limit, 
      offset 
    }));
  }, [dispatch]);

  return { 
    loadMoreProducts, 
    loadMoreCategoryProducts, 
    loadMoreCategories 
  };
}; 