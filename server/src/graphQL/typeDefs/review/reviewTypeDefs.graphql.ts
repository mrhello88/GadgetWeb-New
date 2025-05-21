import { gql } from 'graphql-tag';

export const reviewTypeDefs = gql`
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
    isLiked: Boolean
    isDisliked: Boolean
    status: String
  }

  type ReviewResponse {
    success: Boolean!
    message: String!
    data: Review
    statusCode: Int!
  }

  type ReviewsResponse {
    success: Boolean!
    message: String!
    data: [Review]
    statusCode: Int!
  }

  input ReviewInput {
    productId: ID!
    rating: Float!
    title: String!
    text: String!
  }

  input UpdateReviewInput {
    rating: Float
    title: String
    text: String
    status: String
  }

  input ReplyInput {
    text: String!
  }

  type Query {
    getReview(reviewId: ID!): ReviewResponse!
    getAllReviews(limit: Int, offset: Int): ReviewsResponse!
    getReviewsByProduct(productId: ID!, limit: Int, offset: Int): ReviewsResponse!
    getReviewsByUser(userId: ID!, limit: Int, offset: Int): ReviewsResponse!
  }

  type Mutation {
    createReview(input: ReviewInput!): ReviewResponse!
    updateReview(reviewId: ID!, input: UpdateReviewInput!): ReviewResponse!
    deleteReview(reviewId: ID!): ReviewResponse!
    likeReview(reviewId: ID!): ReviewResponse!
    dislikeReview(reviewId: ID!): ReviewResponse!
    replyToReview(reviewId: ID!, input: ReplyInput!): ReviewResponse!
    deleteReply(reviewId: ID!, replyId: ID!): ReviewResponse!
  }
`; 