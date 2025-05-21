import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AddProduct, GetProductsByCategory, AddCategory, DeleteProduct, GetAllProducts, UpdateProduct, GetProductById } from '../thunk/product.thunk';

export type specification = {
  name: string;
  value: string;
};

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: string;
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
  price: string;
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
  statusCode: number;
}

interface SingleProductResponse {
  success: boolean;
  data: Product | null;
  message: string;
  statusCode: number;
}

interface InitialState {
  data: productResponse | productByCategoryResponse | DeleteProductResponse | AllProductsResponse | SingleProductResponse | null;
  loading: boolean;
  error: string | null;
  token?: string | null;
}

const initialState: InitialState = {
  data: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token') || null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
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
        state.data = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        GetProductsByCategory.fulfilled,
        (state, action: PayloadAction<productByCategoryResponse>) => {
          state.error = null;
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(GetProductsByCategory.rejected, (state, action) => {
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
        state.loading = true;
        state.error = null;
      })
      .addCase(GetAllProducts.fulfilled, (state, action: PayloadAction<AllProductsResponse>) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
      })
      .addCase(GetAllProducts.rejected, (state, action) => {
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
      });
  },
});

//   export const {  } = productSlice.actions;
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
