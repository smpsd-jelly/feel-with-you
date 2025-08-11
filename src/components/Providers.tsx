"use client";
import { SessionProvider } from "next-auth/react";
import ApolloWrapper from "../../lib/ApolloWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApolloWrapper>{children}</ApolloWrapper>
    </SessionProvider>
  );
}