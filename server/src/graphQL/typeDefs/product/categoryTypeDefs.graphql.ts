import { gql } from 'graphql-tag';

export const categoryTypeDefs = gql`
  type Category {
    _id: ID!
    category: String!
    description: String!
    image: String!
    products: [Product!]!
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
    images: [String!]!
    rating: Float
    reviewCount: Int
    reviews: [Review]
    relatedProducts: [RelatedProduct]
  }

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

  type categoryDataResponse {
    success: Boolean!
    message: String!
    data: [Category]
    token: String
    statusCode: Int!
  }

  type Query {
    getProductsByCategory: categoryDataResponse!
    getCategories: [Category!]!
  }

  type Mutation {
    AddCategory(category: String!, description: String!, image: String!): categoryDataResponse!
  }
`;
