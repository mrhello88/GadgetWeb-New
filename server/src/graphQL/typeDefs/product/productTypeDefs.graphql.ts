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
    getAllProducts: productsDataResponse!
    getCategories: [Category]
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

  input SpecificationInput {
    name: String!
    value: String!
  }
`;