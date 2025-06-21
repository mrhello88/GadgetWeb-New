import { gql } from 'graphql-tag';

export const categoryTypeDefs = gql`
  input CategoryFilters {
    brand: String
    minPrice: Float
    maxPrice: Float
    minRating: Float
    search: String
  }

  type categoryDataResponse {
    success: Boolean!
    message: String!
    data: [Category]
    token: String
    statusCode: Int!
    total: Int
    hasMore: Boolean
  }

  type Mutation {
    AddCategory(category: String!, description: String!, image: String!): categoryDataResponse!
  }
`;
