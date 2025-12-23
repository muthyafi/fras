export const GetUsersQuery = `
  query GetUsers {
    dmaas {
      users {
      id
      email
      role
      created_at
    }
  }
}
`