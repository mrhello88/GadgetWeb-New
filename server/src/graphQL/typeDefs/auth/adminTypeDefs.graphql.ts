const { gql } = require('graphql-tag');

export const adminTypeDefs = gql`
  type adminDataResponse {
    success: Boolean!
    message: String!
    data: Admin
    token: String
    statusCode: Int!
  }

  type Admin {
    _id: ID!
    name: String!
    email: String!
    isAdmin: Boolean!
  }

  type Query {
    getAdmin(email: String!): adminDataResponse
  }

  `;
  
  // type Mutation {
  //   loginAdmin(email: String!, password: String!, isAdmin: Boolean!): adminDataResponse
  // }