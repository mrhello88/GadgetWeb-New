import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Document interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  isAdmin: boolean;
  profileImage?: string;
  createdAt: Date;
  reviews: Types.ObjectId[]; // Array of Review IDs
  status: string; // User status (active or inactive)
  comparePassword(candidatePassword: string): Promise<boolean>;
  jwtAuthentication(name: string, email: string, isAdmin: boolean): string,
}

// Static interface
interface IUserModel extends Model<IUser> {
  hashPassword(password: string): Promise<string>,
}

// interface IToken extends Model<IUser> {
//   jwtAuthentication(name: string, email: string, isAdmin: boolean): string;
// }

// interface IComparePassword extends Model<IUser> {
//   comparePassword(password: string): Promise<boolean>;
// }



// Define the schema
const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  profileImage: {
    type: String,
    default: 'avatar.png',
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add static method
userSchema.statics.hashPassword = async function (password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
};

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.jwtAuthentication = function (name: string, email: string, isAdmin: boolean): string {
  return jwt.sign({name, email, isAdmin}, process.env.JWT_SECRET as string, {
    expiresIn: '3d',
  })
}

// Export model
export const UserModel = mongoose.model<IUser, IUserModel>('User', userSchema);
