declare module "apollo-upload-client/createUploadLink.mjs" {
  import type { ApolloLink } from "@apollo/client";

  type RequestCredentials = "omit" | "same-origin" | "include";

  export interface UploadLinkOptions {
    uri?: string;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
  }

  const createUploadLink: (options?: UploadLinkOptions) => ApolloLink;
  export default createUploadLink;
}

declare module "apollo-upload-client" {
  export { default as createUploadLink } from "apollo-upload-client/createUploadLink.mjs";
}
