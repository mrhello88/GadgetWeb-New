import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  createReview, 
  getReview, 
  getReviewsByProduct, 
  getReviewsByUser, 
  updateReview, 
  deleteReview, 
  likeReview, 
  dislikeReview,
  replyToReview,
  deleteReply
} from '../thunk/review.thunk';

// Interface for Reply
export interface Reply {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

// Interface for Review
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
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  status?: string;
}

// Interface for single review response
export interface ReviewResponse {
  success: boolean;
  message: string;
  data: Review | null;
  statusCode: number;
}

// Interface for multiple reviews response
export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[] | null;
  statusCode: number;
}

// Interface for review input
export interface ReviewInput {
  productId: string;
  rating: number;
  title: string;
  text: string;
}

// Interface for update review input
export interface UpdateReviewInput {
  reviewId: string;
  rating?: number;
  title?: string;
  text?: string;
  status?: string;
}

// Interface for reply input
export interface ReplyInput {
  reviewId: string;
  text: string;
}

// Initial state interface
interface InitialState {
  currentReview: ReviewResponse | null;
  productReviews: ReviewsResponse | null;
  userReviews: ReviewsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: InitialState = {
  currentReview: null,
  productReviews: null,
  userReviews: null,
  loading: false,
  error: null
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewState: (state) => {
      state.currentReview = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = [
            action.payload.data,
            ...(state.productReviews.data || [])
          ];
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Review
      .addCase(getReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
      })
      .addCase(getReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Reviews By Product
      .addCase(getReviewsByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewsByProduct.fulfilled, (state, action: PayloadAction<ReviewsResponse>) => {
        state.loading = false;
        state.productReviews = action.payload;
      })
      .addCase(getReviewsByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Reviews By User
      .addCase(getReviewsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviewsByUser.fulfilled, (state, action: PayloadAction<ReviewsResponse>) => {
        state.loading = false;
        state.userReviews = action.payload;
      })
      .addCase(getReviewsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update in product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = state.productReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
        
        // Update in user reviews if they exist
        if (state.userReviews?.data && action.payload.data) {
          state.userReviews.data = state.userReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = null;
        
        // Remove from product reviews if they exist
        if (state.productReviews?.data && action.payload.success) {
          state.productReviews.data = state.productReviews.data.filter(
            review => review._id !== action.payload.data?._id
          );
        }
        
        // Remove from user reviews if they exist
        if (state.userReviews?.data && action.payload.success) {
          state.userReviews.data = state.userReviews.data.filter(
            review => review._id !== action.payload.data?._id
          );
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Like Review
      .addCase(likeReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update in product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = state.productReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
        
        // Update in user reviews if they exist
        if (state.userReviews?.data && action.payload.data) {
          state.userReviews.data = state.userReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
      })
      .addCase(likeReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Dislike Review
      .addCase(dislikeReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dislikeReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update in product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = state.productReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
        
        // Update in user reviews if they exist
        if (state.userReviews?.data && action.payload.data) {
          state.userReviews.data = state.userReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
      })
      .addCase(dislikeReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reply to Review
      .addCase(replyToReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(replyToReview.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update in product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = state.productReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
        
        // Update in user reviews if they exist
        if (state.userReviews?.data && action.payload.data) {
          state.userReviews.data = state.userReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
      })
      .addCase(replyToReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Reply
      .addCase(deleteReply.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReply.fulfilled, (state, action: PayloadAction<ReviewResponse>) => {
        state.loading = false;
        state.currentReview = action.payload;
        
        // Update in product reviews if they exist
        if (state.productReviews?.data && action.payload.data) {
          state.productReviews.data = state.productReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
        
        // Update in user reviews if they exist
        if (state.userReviews?.data && action.payload.data) {
          state.userReviews.data = state.userReviews.data.map(review => 
            review._id === action.payload.data?._id ? action.payload.data : review
          );
        }
      })
      .addCase(deleteReply.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer; 