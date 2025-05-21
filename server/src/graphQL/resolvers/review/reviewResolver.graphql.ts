import { Types } from 'mongoose';
import { ReviewModel, IReview } from '../../../models/Review.model';
import { ProductModel } from '../../../models/Product.model';
import { UserModel, IUser } from '../../../models/User.model';

// Exporting IReply interface to match the one in Review model
export interface IReply {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
}

interface ReviewInput {
  productId: string;
  rating: number;
  title: string;
  text: string;
}

interface UpdateReviewInput {
  rating?: number;
  title?: string;
  text?: string;
  status?: string;
}

interface ReplyInput {
  text: string;
}

interface Context {
  authorize: {
    success: boolean;
    message: string;
    data?: {
      name: string;
      email: string;
      isAdmin: boolean;
      jwtToken: string;
    };
  };
}

export const reviewResolvers = {
  Query: {
    getReview: async (_: any, { reviewId }: { reviewId: string }) => {
      try {
        const review = await ReviewModel.findById(reviewId);
        
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }

        // Format data for frontend
        const formattedReview = {
          ...review.toObject(),
          likesCount: review.likes.length,
          dislikesCount: review.dislikes.length,
          repliesCount: review.replies.length,
        };
        
        return { 
          success: true, 
          message: 'Review fetched successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error fetching review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error fetching review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    getAllReviews: async (_: any, { 
      limit = 20, 
      offset = 0 
    }: { 
      limit?: number; 
      offset?: number;
    }, context: Context) => {
      try {
        // Check if user is authorized and is admin
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { isAdmin } = context.authorize.data;
        if (!isAdmin) {
          return { 
            success: false, 
            message: 'Admin access required', 
            data: null, 
            statusCode: 403 
          };
        }
        
        // Get all reviews with pagination
        const reviews = await ReviewModel.find()
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        
        if (!reviews.length) {
          return { 
            success: true, 
            message: 'No reviews found', 
            data: [], 
            statusCode: 200 
          };
        }

        // Format data for frontend
        const formattedReviews = reviews.map(review => ({
          ...review.toObject(),
          likesCount: review.likes.length,
          dislikesCount: review.dislikes.length,
          repliesCount: review.replies.length,
        }));
        
        return { 
          success: true, 
          message: 'Reviews fetched successfully', 
          data: formattedReviews, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error fetching all reviews:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error fetching reviews', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    getReviewsByProduct: async (_: any, { 
      productId, 
      limit = 10, 
      offset = 0 
    }: { 
      productId: string; 
      limit?: number; 
      offset?: number;
    }, context: Context) => {
      try {
        // Create query filter
        const filter: any = { productId };
        
        // Check if user is admin, if not admin, only show active reviews
        const isAdmin = context?.authorize?.success && context?.authorize?.data?.isAdmin;
        if (!isAdmin) {
          filter.status = 'active'; // Only return active reviews for non-admins
        }
        
        const reviews = await ReviewModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        
        if (!reviews.length) {
          return { 
            success: true, 
            message: 'No reviews found for this product', 
            data: [], 
            statusCode: 200 
          };
        }

        // Format data for frontend
        const formattedReviews = reviews.map(review => ({
          ...review.toObject(),
          likesCount: review.likes.length,
          dislikesCount: review.dislikes.length,
          repliesCount: review.replies.length,
        }));
        
        return { 
          success: true, 
          message: 'Reviews fetched successfully', 
          data: formattedReviews, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error fetching reviews by product:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error fetching reviews', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    getReviewsByUser: async (_: any, { 
      userId, 
      limit = 10, 
      offset = 0 
    }: { 
      userId: string; 
      limit?: number; 
      offset?: number;
    }) => {
      try {
        const reviews = await ReviewModel.find({ userId })
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit);
        
        if (!reviews.length) {
          return { 
            success: true, 
            message: 'No reviews found for this user', 
            data: [], 
            statusCode: 200 
          };
        }

        // Format data for frontend
        const formattedReviews = reviews.map(review => ({
          ...review.toObject(),
          likesCount: review.likes.length,
          dislikesCount: review.dislikes.length,
          repliesCount: review.replies.length,
        }));
        
        return { 
          success: true, 
          message: 'Reviews fetched successfully', 
          data: formattedReviews, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error fetching reviews by user:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error fetching reviews', 
          data: null, 
          statusCode: 500 
        };
      }
    },
  },
  
  Mutation: {
    createReview: async (_: any, { input }: { input: ReviewInput }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { name, email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        
        // Check if product exists
        const product = await ProductModel.findById(input.productId);
        if (!product) {
          return { 
            success: false, 
            message: 'Product not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Check if user already reviewed this product
        const existingReview = await ReviewModel.findOne({ 
          productId: input.productId, 
          userId: userId 
        });
        
        if (existingReview) {
          return { 
            success: false, 
            message: 'You have already reviewed this product', 
            data: null, 
            statusCode: 409 
          };
        }
        
        // Create new review
        const review = await ReviewModel.create({
          ...input,
          userId: userId,
          userName: name,
          userAvatar: user.profileImage || 'avatar.png',
        });
        
        // Add review to product's reviews array with proper type casting
        await ProductModel.findByIdAndUpdate(
          input.productId,
          { $push: { reviews: review._id } }
        );
        
        // Add review to user's reviews array
        await UserModel.findByIdAndUpdate(
          userId,
          { $push: { reviews: review._id } }
        );
        
        // Update product's average rating
        await product.calculateAverageRating();
        
        // Format response data with proper counts
        const formattedReview = {
          ...review.toObject(),
          likesCount: 0,
          dislikesCount: 0,
          repliesCount: 0,
        };
        
        return { 
          success: true, 
          message: 'Review created successfully', 
          data: formattedReview, 
          statusCode: 201 
        };
      } catch (error: unknown) {
        console.error('Error creating review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error creating review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    updateReview: async (_: any, { 
      reviewId, 
      input 
    }: { 
      reviewId: string; 
      input: UpdateReviewInput 
    }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        const isAdmin = user.isAdmin as boolean;
        
        // Find the review
        const review = await ReviewModel.findById(reviewId).lean();
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // If attempting to update status, only allow admin
        if (input.status !== undefined && !isAdmin) {
          return { 
            success: false, 
            message: 'Only administrators can change review status', 
            data: null, 
            statusCode: 403 
          };
        }
        
        // If not admin, check if user is author
        if (!isAdmin && review.userId.toString() !== userId.toString()) {
          return { 
            success: false, 
            message: 'You can only edit your own reviews', 
            data: null, 
            statusCode: 403 
          };
        }
        
        // Update the review
        const updatedReview = await ReviewModel.findByIdAndUpdate(
          reviewId,
          { 
            ...input, 
            // Only mark as edited if content changed (not just status)
            isEdited: (input.rating !== undefined || input.title !== undefined || input.text !== undefined)
              ? true
              : review.isEdited,
            updatedAt: new Date() 
          },
          { new: true }
        );
        
        if (!updatedReview) {
          return { 
            success: false, 
            message: 'Review not updated', 
            data: null, 
            statusCode: 500 
          };
        }
        
        // If rating was updated, recalculate product's average rating
        if (input.rating && input.rating !== review.rating) {
          const product = await ProductModel.findById(review.productId);
          if (product) {
            await product.calculateAverageRating();
          }
        }
        
        // Format response data
        const formattedReview = {
          ...updatedReview.toObject(),
          likesCount: updatedReview.likes.length,
          dislikesCount: updatedReview.dislikes.length,
          repliesCount: updatedReview.replies.length,
        };
        
        return { 
          success: true, 
          message: 'Review updated successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error updating review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error updating review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    deleteReview: async (_: any, { reviewId }: { reviewId: string }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        const isAdmin = user.isAdmin as boolean;
        
        // Find the review
        const review = await ReviewModel.findById(reviewId).lean();
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Check if the user is the author of the review or admin
        if (review.userId.toString() !== userId.toString() && !isAdmin) {
          return { 
            success: false, 
            message: 'You can only delete your own reviews', 
            data: null, 
            statusCode: 403 
          };
        }
        
        // Store productId before deletion
        const productId = review.productId;
        const reviewUserId = review.userId;
        
        // Delete the review
        await ReviewModel.findByIdAndDelete(reviewId);
        
        // Remove review from product's reviews array
        await ProductModel.findByIdAndUpdate(
          productId,
          { $pull: { reviews: reviewId } }
        );
        
        // Remove review from user's reviews array
        await UserModel.findByIdAndUpdate(
          reviewUserId,
          { $pull: { reviews: reviewId } }
        );
        
        // Recalculate product's average rating
        const product = await ProductModel.findById(productId);
        if (product) {
          await product.calculateAverageRating();
        }
        
        return { 
          success: true, 
          message: 'Review deleted successfully', 
          data: null, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error deleting review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error deleting review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    likeReview: async (_: any, { reviewId }: { reviewId: string }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        const userIdStr = userId.toString();
        
        // Find the review
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Check if user already liked the review
        const alreadyLiked = review.likes.some(id => id.toString() === userIdStr);
        
        // Check if user already disliked the review
        const alreadyDisliked = review.dislikes.some(id => id.toString() === userIdStr);
        
        let updatedReview;
        
        if (alreadyLiked) {
          // User already liked, so unlike
          updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $pull: { likes: userId } },
            { new: true }
          );
        } else {
          // User hasn't liked yet, add like and remove dislike if exists
          if (alreadyDisliked) {
            await ReviewModel.findByIdAndUpdate(
              reviewId,
              { $pull: { dislikes: userId } }
            );
          }
          
          updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $addToSet: { likes: userId } },
            { new: true }
          );
        }
        
        if (!updatedReview) {
          return { 
            success: false, 
            message: 'Failed to update review', 
            data: null, 
            statusCode: 500 
          };
        }
        
        // Format response data
        const formattedReview = {
          ...updatedReview.toObject(),
          likesCount: updatedReview.likes.length,
          dislikesCount: updatedReview.dislikes.length,
          repliesCount: updatedReview.replies.length,
          isLiked: updatedReview.likes.some(id => id.toString() === userIdStr),
          isDisliked: updatedReview.dislikes.some(id => id.toString() === userIdStr),
        };
        
        return { 
          success: true, 
          message: alreadyLiked ? 'Review unliked successfully' : 'Review liked successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error liking review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error liking review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    dislikeReview: async (_: any, { reviewId }: { reviewId: string }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        const userIdStr = userId.toString();
        
        // Find the review
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Check if user already disliked the review
        const alreadyDisliked = review.dislikes.some(id => id.toString() === userIdStr);
        
        // Check if user already liked the review
        const alreadyLiked = review.likes.some(id => id.toString() === userIdStr);
        
        let updatedReview;
        
        if (alreadyDisliked) {
          // User already disliked, so remove dislike
          updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $pull: { dislikes: userId } },
            { new: true }
          );
        } else {
          // User hasn't disliked yet, add dislike and remove like if exists
          if (alreadyLiked) {
            await ReviewModel.findByIdAndUpdate(
              reviewId,
              { $pull: { likes: userId } }
            );
          }
          
          updatedReview = await ReviewModel.findByIdAndUpdate(
            reviewId,
            { $addToSet: { dislikes: userId } },
            { new: true }
          );
        }
        
        if (!updatedReview) {
          return { 
            success: false, 
            message: 'Failed to update review', 
            data: null, 
            statusCode: 500 
          };
        }
        
        // Format response data
        const formattedReview = {
          ...updatedReview.toObject(),
          likesCount: updatedReview.likes.length,
          dislikesCount: updatedReview.dislikes.length,
          repliesCount: updatedReview.replies.length,
          isLiked: updatedReview.likes.some(id => id.toString() === userIdStr),
          isDisliked: updatedReview.dislikes.some(id => id.toString() === userIdStr),
        };
        
        return { 
          success: true, 
          message: alreadyDisliked ? 'Dislike removed successfully' : 'Review disliked successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error disliking review:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error disliking review', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    replyToReview: async (_: any, { 
      reviewId, 
      input 
    }: { 
      reviewId: string; 
      input: ReplyInput 
    }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email, name } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID
        const userId = user._id as Types.ObjectId;
        
        // Find the review
        const review = await ReviewModel.findById(reviewId);
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Create new reply
        const reply = {
          _id: new Types.ObjectId(),
          userId: userId,
          userName: name,
          text: input.text,
          createdAt: new Date(),
        };
        
        // Add reply to review
        const updatedReview = await ReviewModel.findByIdAndUpdate(
          reviewId,
          { $push: { replies: reply } },
          { new: true }
        );
        
        if (!updatedReview) {
          return { 
            success: false, 
            message: 'Failed to add reply', 
            data: null, 
            statusCode: 500 
          };
        }
        
        // Format response data
        const formattedReview = {
          ...updatedReview.toObject(),
          likesCount: updatedReview.likes.length,
          dislikesCount: updatedReview.dislikes.length,
          repliesCount: updatedReview.replies.length,
        };
        
        return { 
          success: true, 
          message: 'Reply added successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error adding reply:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error adding reply', 
          data: null, 
          statusCode: 500 
        };
      }
    },
    
    deleteReply: async (_: any, { 
      reviewId, 
      replyId 
    }: { 
      reviewId: string; 
      replyId: string 
    }, context: Context) => {
      try {
        // Check if user is authorized
        if (!context.authorize.success || !context.authorize.data) {
          return { 
            success: false, 
            message: 'Unauthorized', 
            data: null, 
            statusCode: 401 
          };
        }
        
        const { email } = context.authorize.data;
        
        // Get userId from email with explicit typing
        const user = await UserModel.findOne({ email }).lean();
        if (!user) {
          return { 
            success: false, 
            message: 'User not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Use strongly typed user ID and isAdmin
        const userId = user._id as Types.ObjectId;
        const isAdmin = user.isAdmin as boolean;
        
        // Find the review
        const review = await ReviewModel.findById(reviewId).lean();
        if (!review) {
          return { 
            success: false, 
            message: 'Review not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Find the reply and make sure it exists
        const reply = review.replies.find(r => r._id && r._id.toString() === replyId);
        if (!reply) {
          return { 
            success: false, 
            message: 'Reply not found', 
            data: null, 
            statusCode: 404 
          };
        }
        
        // Check if the user is the author of the reply or admin
        if (reply.userId.toString() !== userId.toString() && !isAdmin) {
          return { 
            success: false, 
            message: 'You can only delete your own replies', 
            data: null, 
            statusCode: 403 
          };
        }
        
        // Delete the reply
        const updatedReview = await ReviewModel.findByIdAndUpdate(
          reviewId,
          { $pull: { replies: { _id: new Types.ObjectId(replyId) } } },
          { new: true }
        );
        
        if (!updatedReview) {
          return { 
            success: false, 
            message: 'Failed to delete reply', 
            data: null, 
            statusCode: 500 
          };
        }
        
        // Format response data
        const formattedReview = {
          ...updatedReview.toObject(),
          likesCount: updatedReview.likes.length,
          dislikesCount: updatedReview.dislikes.length,
          repliesCount: updatedReview.replies.length,
        };
        
        return { 
          success: true, 
          message: 'Reply deleted successfully', 
          data: formattedReview, 
          statusCode: 200 
        };
      } catch (error: unknown) {
        console.error('Error deleting reply:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Error deleting reply', 
          data: null, 
          statusCode: 500 
        };
      }
    },
  },
}; 