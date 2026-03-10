import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

let apolloClient: ApolloClient<any> | null = null;

function createApolloClient() {
  const httpLink = createHttpLink({ uri: "/api/graphql" });

  const authLink = setContext(async (_, { headers }) => {
    return { headers: { ...headers } };
  });

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Board: { keyFields: ["id"] },
        List: { keyFields: ["id"] },
        Card: { keyFields: ["id"] },
      },
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
    },
  });
}

export function getApolloClient() {
  if (!apolloClient) apolloClient = createApolloClient();
  return apolloClient;
}

export function resetApolloClient() {
  apolloClient = null;
}
