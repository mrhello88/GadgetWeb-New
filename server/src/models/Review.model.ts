import { Schema, model, Document, Types } from 'mongoose';

// Interface for Reply
interface IReply extends Document {
  userId: Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
}

// Interface for Review
export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  text: string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  replies: IReply[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  
  // Virtual fields for frontend
  likesCount?: number;
  dislikesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

// Reply Schema
const replySchema = new Schema<IReply>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Review Schema
const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    // Add toJSON and toObject transformation to include virtual fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual fields for client-side
reviewSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

reviewSchema.virtual('dislikesCount').get(function() {
  return this.dislikes?.length || 0;
});

reviewSchema.virtual('repliesCount').get(function() {
  return this.replies?.length || 0;
});

// Indexes for faster queries
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });

// Ensure we don't recreate the model if it exists
export const ReviewModel = model<IReview>('Review', reviewSchema); 