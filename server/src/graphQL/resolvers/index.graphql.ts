import { mergeResolvers } from '@graphql-tools/merge';
import { authResolvers } from './auth/authResolver.graphql';
import { adminResolvers } from './auth/adminResolver.graphql';
import { productResolver } from './product/productResolver.graphql';
import { categoryResolver } from './product/categoryResolver.graphql';
import { reviewResolvers } from './review/reviewResolver.graphql';

export const resolvers = mergeResolvers([
  authResolvers,
  adminResolvers,
  productResolver,
  categoryResolver,
  reviewResolvers,
]);
