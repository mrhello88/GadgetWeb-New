import { gql } from 'graphql-tag';

export const productTypeDefs = gql`
  scalar Upload

  type Specification {
    name: String!
    value: String!
  }

  type RelatedProduct {
    _id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    brand: String!
    specifications: [Specification!]!
    features: [String!]!
    images: [String!]!
  }

  type Reply {
    _id: ID!
    userId: ID!
    userName: String!
    text: String!
    createdAt: String!
  }

  type Review {
    _id: ID!
    productId: ID!
    userId: ID!
    userName: String!
    userAvatar: String
    rating: Float!
    title: String!
    text: String!
    likes: [ID!]!
    dislikes: [ID!]!
    replies: [Reply!]!
    isEdited: Boolean!
    createdAt: String!
    updatedAt: String!
    likesCount: Int
    dislikesCount: Int
    repliesCount: Int
  }

  type Product {
    _id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    brand: String!
    specifications: [Specification!]!
    features: [String!]!
    images: [String!]! # Store file paths/URLs, not Upload objects
    rating: Float
    reviewCount: Int
    reviews: [Review]
    relatedProducts: [RelatedProduct]
  }

  type productDataResponse {
    success: Boolean!
    message: String!
    data: Product
    token: String
    statusCode: Int!
  }

  type productsDataResponse {
    success: Boolean!
    message: String!
    data: [Product!]!
    total: Int
    hasMore: Boolean
    token: String
    statusCode: Int!
  }

  type Category {
    _id: ID!
    category: String!
    description: String!
    image: String
    products: [Product]
  }

  type Query {
    getProduct(_id: ID!): productDataResponse!
    getAllProducts(
      limit: Int = 20
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
      search: String
    ): productsDataResponse!
    getProductsByCategory(
      category: String!
      limit: Int = 20
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
      filters: ProductFiltersInput
    ): productsDataResponse!
    getProductsByFilters(
      filters: ProductFiltersInput!
      limit: Int = 20
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): productsDataResponse!
    getCategories(
      limit: Int = 10
      offset: Int = 0
    ): CategoriesDataResponse!
    getCategory(id: ID!): Category
  }

  type Mutation {
    addProduct(
      name: String!
      description: String!
      price: Float!
      category: String!
      brand: String!
      specifications: [SpecificationInput!]!
      features: [String!]!
      images: [String!]! # Accept file uploads
    ): productDataResponse!
    updateProduct(
      _id: ID!
      name: String!
      description: String!
      price: Float!
      category: String!
      brand: String!
      specifications: [SpecificationInput!]!
      features: [String!]!
      images: [String!]!
    ): productDataResponse!
    deleteProduct(_id: ID!): productDataResponse!
    addCategory(category: String!, description: String!, image: Upload): CategoryResponse
    deleteCategory(id: ID!): CategoryResponse
  }

  type CategoryResponse {
    success: Boolean!
    message: String!
    data: Category
  }

  type CategoriesDataResponse {
    success: Boolean!
    message: String!
    data: [Category!]!
    total: Int
    hasMore: Boolean
    statusCode: Int!
  }

  input SpecificationInput {
    name: String!
    value: String!
  }

  input ProductFiltersInput {
    category: String
    brand: String
    brands: [String]
    minPrice: Float
    maxPrice: Float
    minRating: Float
    minRatings: [Float]
    search: String
    priceRange: String
    priceRanges: [String]
    specifications: [SpecificationFilterInput]
  }

  input SpecificationFilterInput {
    name: String!
    value: String!
  }
`;