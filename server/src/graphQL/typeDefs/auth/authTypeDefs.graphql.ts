import { gql } from 'graphql-tag';

export const authTypeDefs = gql`
  type userDataResponse {
    success: Boolean!
    message: String!
    data: User
    token: String
    statusCode: Int!
  }

  type User {
    _id: ID
    name: String!
    email: String!
    isAdmin: Boolean!
    profileImage: String
    status: String
  }

  type Query { 
    getUser(_id: ID!): userDataResponse
    getUsers: [User!]!
    }
    
    type Mutation {
    registerUser(name: String!, email: String!, password: String!, confirmPassword: String!, isAdmin: Boolean!): userDataResponse
    verifyUser(token: String!): userDataResponse
    loginUser(email: String!, password: String!, isAdmin: Boolean!): userDataResponse
    updateUser(_id: ID!): User
    deleteUser(_id: ID!): User
    updateUserProfile(_id: ID!, name: String!, email: String!, profileImage: String): userDataResponse
    toggleUserStatus(userId: ID!): userDataResponse
  }
`;
