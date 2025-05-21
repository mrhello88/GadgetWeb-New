import { mergeTypeDefs } from '@graphql-tools/merge';
import { authTypeDefs } from './auth/authTypeDefs.graphql';
import { adminTypeDefs } from './auth/adminTypeDefs.graphql';
import { productTypeDefs } from './product/productTypeDefs.graphql';
import { categoryTypeDefs } from './product/categoryTypeDefs.graphql';
import { reviewTypeDefs } from './review/reviewTypeDefs.graphql';

export const typeDefs = mergeTypeDefs([
  authTypeDefs,
  adminTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  reviewTypeDefs,
]);
