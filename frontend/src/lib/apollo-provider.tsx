'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ReactNode } from 'react';
import Cookies from 'js-cookie';

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
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
    link: authLink.concat(httpLink),
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