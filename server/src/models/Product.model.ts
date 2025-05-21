import { Schema, model, Document, Types } from 'mongoose';

// Interface for Specification
interface ISpecification {
  name: string;
  value: string;
}

// // Interface for Review
// interface IReview {
//   id: Types.ObjectId;
// }

// Interface for Related Product
interface IRelatedProduct {
  id: Types.ObjectId;
}

// Interface for Product
interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  specifications: ISpecification[];
  features: string[];
  images: string[];
  reviews: Types.ObjectId[];
  relatedProducts: IRelatedProduct[];
  calculateAverageRating: () => Promise<void>;
}

// Mongoose Schema for Product
const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  category: {
    type: String,
    required: true,
   
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  specifications: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      value: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  features: [
    {
      type: String,
      required: true,
      trim: true,
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  relatedProducts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
});

// Method to calculate and update the average rating
productSchema.methods.calculateAverageRating = async function() {
  // Use the full model import to avoid registration issues
  const ReviewModel = model('Review');
  
  const result = await ReviewModel.aggregate([
    { $match: { productId: this._id } },
    { 
      $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      } 
    }
  ]);
  
  if (result.length > 0) {
    this.rating = parseFloat(result[0].averageRating.toFixed(1));
    this.reviewCount = result[0].count;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }
  
  await this.save();
};

// Pre-save hook to round rating to 1 decimal place
productSchema.pre('save', function(next) {
  if (this.isModified('rating')) {
    this.rating = parseFloat(this.rating.toFixed(1));
  }
  next();
});

export const ProductModel = model<IProduct>('Product', productSchema);
