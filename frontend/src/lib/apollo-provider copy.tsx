'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { createUploadLink } from 'apollo-upload-client';

function makeClient() {
  const uploadLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
    headers: { 'Apollo-Require-Preflight': 'true' },
  });

  const authLink = setContext((_, { headers }) => {
    const token = Cookies.get('accessToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(uploadLink as unknown as ApolloLink),
  });
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = makeClient();
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}