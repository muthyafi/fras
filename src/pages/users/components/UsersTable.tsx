import { useState } from 'react'
import { useQuery, gql } from 'urql'
import DataTable, { type TableColumn, type HasuraFilter, type HasuraOrderBy } from '../../../components/DataTable';
import { buildHasuraWhere, buildHasuraOrderBy } from '../../../lib/hasura-helpers'

// GraphQL query for users with filters and sorting
const USERS_QUERY = gql`
  query GetUsers(
    $where: dmaas_users_bool_exp
    $order_by: [dmaas_users_order_by!]
    $limit: Int
    $offset: Int
  ) {
    dmaas {
      users(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      email
      name
    }
    users_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
}
`

export default function UsersTable() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState<HasuraFilter>({})
  const [orderBy, setOrderBy] = useState<HasuraOrderBy[]>([])

  // Fetch data with urql
  const [result] = useQuery({
    query: USERS_QUERY,
    variables: {
      where: buildHasuraWhere(filters),
      order_by: buildHasuraOrderBy(orderBy),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  })

  const { data, fetching, error } = result

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Full Name',
      sortable: true,
      searchable: true,
      width: '200px',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      searchable: true,
      width: '250px',
    },
  ]

  // Handle filter changes
  const handleFilterChange = (newFilters: HasuraFilter) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  // Handle sort changes
  const handleSortChange = (newOrderBy: HasuraOrderBy[]) => {
    setOrderBy(newOrderBy)
  }

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading users: {error.message}</p>
      </div>
    )
  }

  const users = data?.dmaas?.users || []
  const totalUsers = data?.dmaas?.users_aggregate?.aggregate?.count || 0

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={users}
        loading={fetching}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        globalSearch={true}
        pagination={{
          total: totalUsers,
          pageSize: pageSize,
          currentPage: page,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No users found"
        className="shadow-lg"
      />
    </div>
  )
}
