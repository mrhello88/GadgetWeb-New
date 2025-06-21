import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';
type specification = {
  name: string;
  value: string;
};

type productData = {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: specification[];
  features: string[];
  images: string[];
};

type categoryData = {
  description: string;
  category: string;
  image: string | null;
};

export const AddProduct = createAsyncThunk(
  'product/AddProduct',
  async (productData: productData, thunkApi) => {
    
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
            mutation AddProduct($name: String!, $description: String!, $price: Float!, $category: String!, $brand: String!, $specifications: [SpecificationInput!]!, $features: [String!]!, $images: [String!]!) {
                addProduct(name: $name, description: $description, price: $price, category: $category, brand: $brand, specifications: $specifications, features: $features, images: $images) {
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
                    relatedProducts {
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
                   }
                   }
                   token
                   statusCode
                }
            }
        `,
        variables: productData,
      });

      if (response?.data.data.addProduct.statusCode === 201) {
        return response?.data.data.addProduct || 'add Product in successfully';
      }

      return thunkApi.rejectWithValue(
        response?.data.data.addProduct.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);



export const AddCategory = createAsyncThunk(
  'product/AddCategory',
  async (categoryData: categoryData, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
            mutation AddCategory($category: String!, $description: String!, $image: String!) {
            AddCategory(category: $category, description: $description, image: $image) {
              success
              message
              data {
                _id
                category
                description
                image
                products {
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
                  relatedProducts {
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
                  }
                }
              }
              token
              statusCode
            }
          }
      `,
        variables: categoryData,
      });
      if (response?.data.data.AddCategory.statusCode === 200) {
        return response?.data.data.AddCategory || 'Category Added successfully in successfully';
      } else {
        return thunkApi.rejectWithValue(
          response?.data.data.AddCategory.message || 'Something went wrong'
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const DeleteProduct = createAsyncThunk(
  'product/DeleteProduct',
  async (productId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation DeleteProduct($id: ID!) {
            deleteProduct(_id: $id) {
              success
              message
              statusCode
            }
          }
        `,
        variables: {
          id: productId
        },
      });

      if (response?.data.data.deleteProduct.statusCode === 200) {
        return response?.data.data.deleteProduct;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.deleteProduct.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const GetAllProducts = createAsyncThunk(
  'product/GetAllProducts',
  async (params: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  } = {}, thunkApi) => {
    try {
      const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', search } = params;
      
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetAllProducts($limit: Int, $offset: Int, $sortBy: String, $sortOrder: String, $search: String) {
            getAllProducts(limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder, search: $search) {
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
        variables: { limit, offset, sortBy, sortOrder, search },
      });

      if (response?.data.data.getAllProducts.statusCode === 200) {
        return response?.data.data.getAllProducts;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getAllProducts.message || 'Something went wrong'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
    }
  }
);

export const GetProductsByCategory = createAsyncThunk(
  'product/GetProductsByCategory',
  async (params: {
    category: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: {
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      search?: string;
      priceRange?: string;
      specifications?: Array<{name: string; value: string}>;
    };
  }, thunkApi) => {
    try {
      // Safety check for params
      if (!params) {
        return thunkApi.rejectWithValue('Parameters are required for GetProductsByCategory');
      }
      
      const { category, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', filters } = params;
      
      // Safety check for required category parameter
      if (!category) {
        return thunkApi.rejectWithValue('Category parameter is required');
      }
      
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetProductsByCategory($category: String!, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String, $filters: ProductFiltersInput) {
            getProductsByCategory(category: $category, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder, filters: $filters) {
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
                reviews {
                  _id
                  userId
                  userName
                  userAvatar
                  rating
                  title
                  text
                  likes
                  dislikes
                  replies {
                    _id
                    userId
                    userName
                    text
                    createdAt
                  }
                  isEdited
                  createdAt
                  updatedAt
                  likesCount
                  dislikesCount
                  repliesCount
                }
                relatedProducts {
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
                }
              }
              total
              hasMore
              statusCode
            }
          }
        `,
        variables: { category, limit, offset, sortBy, sortOrder, filters },
      });

      const result = response?.data?.data?.getProductsByCategory;
      
      if (!result) {
        return thunkApi.rejectWithValue('No data received from server');
      }

      if (result.statusCode === 200 && result.success) {
        return result;
      }

      return thunkApi.rejectWithValue(result.message || 'Failed to fetch products');
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

export const GetCategories = createAsyncThunk(
  'product/GetCategories',
  async (params: {
    limit?: number;
    offset?: number;
  } = {}, thunkApi) => {
    try {
      const { limit = 10, offset = 0 } = params;
      
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetCategories($limit: Int, $offset: Int) {
            getCategories(limit: $limit, offset: $offset) {
              success
              message
              data {
                _id
                category
                description
                image
                products {
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
              }
              total
              hasMore
              statusCode
            }
          }
        `,
        variables: { limit, offset },
      });

      const result = response?.data?.data?.getCategories;
      
      if (!result) {
        return thunkApi.rejectWithValue('No data received from server');
      }

      if (result.statusCode === 200 && result.success) {
        return result;
      }

      return thunkApi.rejectWithValue(result.message || 'Failed to fetch categories');
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

export const DeleteCategory = createAsyncThunk(
  'product/deleteCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(
        'http://localhost:5000/graphql',
        {
          query: `
            mutation DeleteCategory($id: ID!) {
              deleteCategory(id: $id) {
                success
                message
                data {
                  _id
                  category
                  description
                  image
                }
              }
            }
          `,
          variables: {
            id: categoryId
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = response.data.data.deleteCategory;
      if (!result.success) {
        return rejectWithValue(result.message);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error deleting category');
    }
  }
);

export const UpdateProduct = createAsyncThunk(
  'product/UpdateProduct',
  async ({ productId, productData }: { productId: string, productData: productData }, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation UpdateProduct($id: ID!, $name: String!, $description: String!, $price: Float!, $category: String!, $brand: String!, $specifications: [SpecificationInput!]!, $features: [String!]!, $images: [String!]!) {
            updateProduct(_id: $id, name: $name, description: $description, price: $price, category: $category, brand: $brand, specifications: $specifications, features: $features, images: $images) {
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
                relatedProducts {
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
                }
              }
              statusCode
            }
          }
        `,
        variables: {
          id: productId,
          ...productData,
        },
      });

      if (response?.data.data.updateProduct.statusCode === 200) {
        return response?.data.data.updateProduct;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.updateProduct.message || 'Failed to update product'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

export const GetProductById = createAsyncThunk(
  'product/GetProductById',
  async (productId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetProductById($id: ID!) {
            getProduct(_id: $id) {
              success
              message
              data {
                _id
                name
                description
                price
                rating
                reviewCount
                category
                brand
                specifications {
                  name
                  value
                }
                features
                images
                reviews {
                  _id
                  rating
                  title
                  text
                  userName
                  userAvatar
                  createdAt
                }
                relatedProducts {
                  _id
                  name
                  description
                  price
                  category
                  brand
                  images
                }
              }
              statusCode
            }
          }
        `,
        variables: {
          id: productId
        },
      });

      if (response?.data.data.getProduct.statusCode === 200) {
        return response?.data.data.getProduct;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getProduct.message || 'Failed to fetch product'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);
