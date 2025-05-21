import { Schema, model, Document } from 'mongoose';

interface ICryptoToken extends Document {
  name: string;
  email: string;
  token: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
}

const cryptoTokenSchema: Schema<ICryptoToken> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export const CryptoTokenModel = model<ICryptoToken>('CryptoToken', cryptoTokenSchema);
