import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/graphql',
  credentials: 'include',
})

const client = new ApolloClient({
  link: uploadLink as unknown as ApolloLink,
  cache: new InMemoryCache(),
})

export default client
