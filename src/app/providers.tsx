"use client";
import { SessionProvider } from "next-auth/react";
import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "@/lib/apollo-client";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const client = getApolloClient();
  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
