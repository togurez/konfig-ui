"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  try {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
      return cachedToken.value;
    }
    const res = await fetch("/auth/access-token");
    if (!res.ok) return null;
    const { token } = await res.json();
    const exp = JSON.parse(atob(token.split(".")[1])).exp * 1000;
    cachedToken = { value: token, expiresAt: exp };
    return token;
  } catch {
    return null;
  }
}

const httpLink = createHttpLink({
  uri: "/api/facade/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
    query: { fetchPolicy: "network-only" },
  },
});
