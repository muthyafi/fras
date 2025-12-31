import { cacheExchange, fetchExchange, Client } from 'urql'

const GRAPHQL_ENDPOINT = `${import.meta.env.VITE_GRAPHQL_API_URL}`

export const urqlClient = new Client({
  url: GRAPHQL_ENDPOINT,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    return {
      headers: {
        "x-hasura-admin-secret": import.meta.env.VITE_HASURA_SECRET,
      },
    };
  },
  // Disable automatic persisted queries (Hasura doesn't support them by default)
  preferGetMethod: false,
  // requestPolicy: 'cache-and-network',
})
