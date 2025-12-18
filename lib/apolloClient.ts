import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.NEXT_PUBLIC_GRAPHQL_TOKEN}`,
      "apollo-require-preflight": "true",
    },
  }));
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, uploadLink as unknown as ApolloLink]),
  cache: new InMemoryCache(),
});

export default client;
