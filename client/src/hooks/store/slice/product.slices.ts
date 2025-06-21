import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddProduct, GetProductsByCategory, AddCategory, DeleteProduct, GetAllProducts, UpdateProduct, GetProductById, GetCategories } from '../thunk/product.thunk';

export type specification = {
  name: string;
  value: string;
};

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: specification[] | [];
  features: string[] | [];
  relatedProducts: RelatedProduct[];
  images: string[];
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
}

export interface RelatedProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: specification[];
  features: string[];
  images: string[];
  rating?: number;
  reviewCount?: number;
}

export interface productByCategory {
  _id: string;
  description: string;
  category: string;
  image: string;
  products: Product[];
}

export interface productByCategoryResponse {
  success: boolean;
  data: productByCategory[] | null;
  message: string;
  token?: string;
  statusCode?: number;
}

export interface productResponse {
  success: boolean;
  data: Product | null;
  message: string;
  token?: string;
  statusCode?: number;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
  statusCode: number;
}

interface AllProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  total: number;
  hasMore: boolean;
  statusCode: number;
}

interface CategoryProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
  total: number;
  hasMore: boolean;
  statusCode: number;
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: productByCategory[];
  total: number;
  hasMore: boolean;
  statusCode: number;
}

interface SingleProductResponse {
  success: boolean;
  data: Product | null;
  message: string;
  statusCode: number;
}

interface InitialState {
  // All products with pagination
  allProducts: {
    data: Product[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    currentPage: number;
  };
  
  // Category products with pagination and filtering
  categoryProducts: {
    data: Product[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    currentPage: number;
    currentCategory: string | null;
    filters: any;
  };
  
  // Categories with pagination
  categories: {
    data: productByCategory[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    currentPage: number;
  };
  
  // Single product
  singleProduct: {
    data: Product | null;
    loading: boolean;
    error: string | null;
  };
  
  // Legacy data for backward compatibility
  data: productResponse | productByCategoryResponse | DeleteProductResponse | AllProductsResponse | SingleProductResponse | null;
  loading: boolean;
  error: string | null;
  token?: string | null;
}

const initialState: InitialState = {
  // All products with pagination
  allProducts: {
    data: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
    currentPage: 0,
  },
  
  // Category products with pagination and filtering
  categoryProducts: {
    data: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
    currentPage: 0,
    currentCategory: null,
    filters: {},
  },
  
  // Categories with pagination
  categories: {
    data: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
    currentPage: 0,
  },
  
  // Single product
  singleProduct: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Legacy data for backward compatibility
  data: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token') || null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Action to reset pagination
    resetAllProducts: (state) => {
      state.allProducts = initialState.allProducts;
    },
    resetCategoryProducts: (state) => {
      state.categoryProducts = initialState.categoryProducts;
    },
    resetCategories: (state) => {
      state.categories = initialState.categories;
    },
    // Action to set filters
    setCategoryFilters: (state, action) => {
      state.categoryProducts.filters = action.payload;
      state.categoryProducts.currentPage = 0;
      state.categoryProducts.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(AddProduct.pending, (state) => {
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(AddProduct.fulfilled, (state, action: PayloadAction<productResponse>) => {
        state.error = null;
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(AddProduct.rejected, (state, action) => {
        state.data = null;
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      // productByCategory
      .addCase(GetProductsByCategory.pending, (state) => {
        state.categoryProducts.loading = true;
        state.categoryProducts.error = null;
        // Legacy support
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        GetProductsByCategory.fulfilled,
        (state, action: PayloadAction<CategoryProductsResponse>) => {
          state.categoryProducts.data = action.payload.data;
          state.categoryProducts.total = action.payload.total;
          state.categoryProducts.hasMore = action.payload.hasMore;
          state.categoryProducts.loading = false;
          state.categoryProducts.error = null;
          // Legacy support
          state.error = null;
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(GetProductsByCategory.rejected, (state, action) => {
        state.categoryProducts.loading = false;
        state.categoryProducts.error = (action.payload as string) || 'An error occurred';
        // Legacy support
        state.data = null;
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      .addCase(AddCategory.pending, (state) => {
        state.error = null;
        state.loading = true;
        state.data = null;
      })
      .addCase(AddCategory.rejected, (state, action) => {
        state.data = null;
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(AddCategory.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(DeleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteProduct.fulfilled, (state, action: PayloadAction<DeleteProductResponse>) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(DeleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      .addCase(GetAllProducts.pending, (state) => {
        state.allProducts.loading = true;
        state.allProducts.error = null;
        // Legacy support
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllProducts.fulfilled, (state, action: PayloadAction<AllProductsResponse>) => {
        state.allProducts.data = action.payload.data;
        state.allProducts.total = action.payload.total;
        state.allProducts.hasMore = action.payload.hasMore;
        state.allProducts.loading = false;
        state.allProducts.error = null;
        // Legacy support
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(GetAllProducts.rejected, (state, action) => {
        state.allProducts.loading = false;
        state.allProducts.error = (action.payload as string) || 'An error occurred';
        // Legacy support
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      // GetProductById
      .addCase(GetProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetProductById.fulfilled, (state, action: PayloadAction<SingleProductResponse>) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(GetProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      // UpdateProduct
      .addCase(UpdateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateProduct.fulfilled, (state, action: PayloadAction<productResponse>) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(UpdateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'An error occurred';
      })
      // GetCategories
      .addCase(GetCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(GetCategories.fulfilled, (state, action: PayloadAction<CategoriesResponse>) => {
        state.categories.data = action.payload.data;
        state.categories.total = action.payload.total;
        state.categories.hasMore = action.payload.hasMore;
        state.categories.loading = false;
        state.categories.error = null;
      })
      .addCase(GetCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = (action.payload as string) || 'An error occurred';
      });
  },
});

export const { resetAllProducts, resetCategoryProducts, resetCategories, setCategoryFilters } = productSlice.actions;
export default productSlice.reducer;

// Define Review interface
export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  text: string;
  likes: string[];
  dislikes: string[];
  replies: Reply[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  dislikesCount?: number;
  repliesCount?: number;
}

// Define Reply interface
export interface Reply {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}
