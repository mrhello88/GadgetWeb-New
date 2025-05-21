import { Schema, model, Document, Types } from 'mongoose';

// Interface for Category (main document)
export interface ICategory extends Document {
  category: string;
  description: string;
  image: string;
  products: Types.ObjectId[]; // Array of Product IDs
}

// Mongoose Schema for Category
const categorySchema = new Schema<ICategory>(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Reference to Product model
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = model<ICategory>('CategoryProduct', categorySchema);