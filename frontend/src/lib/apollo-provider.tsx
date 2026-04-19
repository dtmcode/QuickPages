'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
// @ts-expect-error — apollo-upload-client hat keine eigenen Types für den Subpfad

import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { ReactNode, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();

  const client = useMemo(() => {
    const uploadLink = createUploadLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
      credentials: 'same-origin',
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

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
          console.error(`[GraphQL error]: ${message}`);
          if (extensions?.code === 'UNAUTHENTICATED' || message.includes('Unauthorized')) {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('user');
            Cookies.remove('tenant');
            router.push('/login');
          }
        });
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
      }
    });

    return new ApolloClient({
      link: from([errorLink, authLink, uploadLink as any]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'cache-and-network' },
      },
    });
  }, [router]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}