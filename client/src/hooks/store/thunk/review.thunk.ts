import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';
import { 
  ReviewInput, 
  UpdateReviewInput, 
  ReplyInput 
} from '../slice/review.slices';

// Create a new review
export const createReview = createAsyncThunk(
  'review/createReview',
  async (reviewData: ReviewInput, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation CreateReview($input: ReviewInput!) {
            createReview(input: $input) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          input: reviewData
        },
      });

      if (response?.data.data.createReview.statusCode === 201) {
        return response?.data.data.createReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.createReview.message || 'Failed to create review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Get a single review by ID
export const getReview = createAsyncThunk(
  'review/getReview',
  async (reviewId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetReview($reviewId: ID!) {
            getReview(reviewId: $reviewId) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId
        },
      });

      if (response?.data.data.getReview.statusCode === 200) {
        return response?.data.data.getReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getReview.message || 'Failed to fetch review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Get reviews by product ID
export const getReviewsByProduct = createAsyncThunk(
  'review/getReviewsByProduct',
  async ({ productId, limit = 10, offset = 0 }: { productId: string; limit?: number; offset?: number }, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetReviewsByProduct($productId: ID!, $limit: Int, $offset: Int) {
            getReviewsByProduct(productId: $productId, limit: $limit, offset: $offset) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
                status
              }
              statusCode
            }
          }
        `,
        variables: {
          productId,
          limit,
          offset
        },
      });

      if (response?.data.data.getReviewsByProduct.statusCode === 200) {
        return response?.data.data.getReviewsByProduct;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getReviewsByProduct.message || 'Failed to fetch product reviews'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Get reviews by user ID
export const getReviewsByUser = createAsyncThunk(
  'review/getReviewsByUser',
  async ({ userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number }, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetReviewsByUser($userId: ID!, $limit: Int, $offset: Int) {
            getReviewsByUser(userId: $userId, limit: $limit, offset: $offset) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          userId,
          limit,
          offset
        },
      });

      if (response?.data.data.getReviewsByUser.statusCode === 200) {
        return response?.data.data.getReviewsByUser;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getReviewsByUser.message || 'Failed to fetch user reviews'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Update a review
export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, rating, title, text, status }: UpdateReviewInput, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation UpdateReview($reviewId: ID!, $input: UpdateReviewInput!) {
            updateReview(reviewId: $reviewId, input: $input) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
                status
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId,
          input: {
            rating,
            title,
            text,
            status
          }
        },
      });

      if (response?.data.data.updateReview.statusCode === 200) {
        return response?.data.data.updateReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.updateReview.message || 'Failed to update review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Delete a review
export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (reviewId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation DeleteReview($reviewId: ID!) {
            deleteReview(reviewId: $reviewId) {
              success
              message
              data {
                _id
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId
        },
      });

      if (response?.data.data.deleteReview.statusCode === 200) {
        // Return the response with the deleted review ID for proper state updates
        return {
          ...response?.data.data.deleteReview,
          data: { _id: reviewId }
        };
      }

      return thunkApi.rejectWithValue(
        response?.data.data.deleteReview.message || 'Failed to delete review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Like a review
export const likeReview = createAsyncThunk(
  'review/likeReview',
  async (reviewId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation LikeReview($reviewId: ID!) {
            likeReview(reviewId: $reviewId) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId
        },
      });

      if (response?.data.data.likeReview.statusCode === 200) {
        return response?.data.data.likeReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.likeReview.message || 'Failed to like review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Dislike a review
export const dislikeReview = createAsyncThunk(
  'review/dislikeReview',
  async (reviewId: string, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation DislikeReview($reviewId: ID!) {
            dislikeReview(reviewId: $reviewId) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId
        },
      });

      if (response?.data.data.dislikeReview.statusCode === 200) {
        return response?.data.data.dislikeReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.dislikeReview.message || 'Failed to dislike review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Reply to a review
export const replyToReview = createAsyncThunk(
  'review/replyToReview',
  async ({ reviewId, text }: ReplyInput, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation ReplyToReview($reviewId: ID!, $input: ReplyInput!) {
            replyToReview(reviewId: $reviewId, input: $input) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId,
          input: {
            text
          }
        },
      });

      if (response?.data.data.replyToReview.statusCode === 200) {
        return response?.data.data.replyToReview;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.replyToReview.message || 'Failed to reply to review'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Delete a reply
export const deleteReply = createAsyncThunk(
  'review/deleteReply',
  async ({ reviewId, replyId }: { reviewId: string; replyId: string }, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          mutation DeleteReply($reviewId: ID!, $replyId: ID!) {
            deleteReply(reviewId: $reviewId, replyId: $replyId) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
              }
              statusCode
            }
          }
        `,
        variables: {
          reviewId,
          replyId
        },
      });

      if (response?.data.data.deleteReply.statusCode === 200) {
        return response?.data.data.deleteReply;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.deleteReply.message || 'Failed to delete reply'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

// Get all reviews (admin only)
export const getAllReviews = createAsyncThunk(
  'review/getAllReviews',
  async ({ limit = 20, offset = 0 }: { limit?: number; offset?: number }, thunkApi) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetAllReviews($limit: Int, $offset: Int) {
            getAllReviews(limit: $limit, offset: $offset) {
              success
              message
              data {
                _id
                productId
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
                isLiked
                isDisliked
                status
              }
              statusCode
            }
          }
        `,
        variables: {
          limit,
          offset
        },
      });

      if (response?.data.data.getAllReviews?.statusCode === 200) {
        return response?.data.data.getAllReviews;
      }

      return thunkApi.rejectWithValue(
        response?.data.data.getAllReviews?.message || 'Failed to fetch all reviews'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        return thunkApi.rejectWithValue(error.message);
      }
      return thunkApi.rejectWithValue('An unknown error occurred');
    }
  }
);

export const getReviewsForProduct = createAsyncThunk(
  'reviews/getForProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetReviewsForProduct($productId: ID!) {
            getReviewsForProduct(productId: $productId) {
              _id
              rating
              title
              text
              author {
                _id
                name
              }
              product {
                _id
                name
              }
              createdAt
              updatedAt
            }
          }
        `,
        variables: { productId },
      });
      return response.data.data.getReviewsForProduct;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/graphql', {
        query: `
          query GetUserReviews($userId: ID!) {
            getUserReviews(userId: $userId) {
              _id
              rating
              title
              text
              author {
                _id
                name
              }
              product {
                _id
                name
              }
              createdAt
              updatedAt
            }
          }
        `,
        variables: { userId },
      });
      return response.data.data.getUserReviews;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
); 