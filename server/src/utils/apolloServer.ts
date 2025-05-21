import { ApolloServer } from "@apollo/server";
import { schemaGrapql } from '../graphQL/schemas/schemas.graphql';

export const apolloServer = async () => {
  const server = new ApolloServer({
    schema: schemaGrapql,
  });

  await server.start();
  return server;
}