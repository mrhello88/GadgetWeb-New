import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../typeDefs/index.graphql';
import { resolvers } from '../resolvers/index.graphql';
export const schemaGrapql = makeExecutableSchema({
  typeDefs,
  resolvers,
});
