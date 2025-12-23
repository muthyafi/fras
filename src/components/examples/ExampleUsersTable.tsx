import { useState } from 'react'
import { useQuery, gql } from 'urql'
import DataTable, { TableColumn, HasuraFilter, HasuraOrderBy } from '../components/DataTable'
import { buildHasuraWhere, buildHasuraOrderBy } from '../lib/hasura-helpers'

// Example: User table
interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  is_active: boolean
}

// GraphQL query for users with filters and sorting
const USERS_QUERY = gql`
  query GetUsers(
    $where: users_bool_exp
    $order_by: [users_order_by!]
    $limit: Int
    $offset: Int
  ) {
    users(
      where: $where
      order_by: $order_by
      limit: $limit
      offset: $offset
    ) {
      id
      email
      full_name
      role
      created_at
      is_active
    }
    users_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export default function ExampleUsersTable() {
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
  const columns: TableColumn<User>[] = [
    {
      key: 'full_name',
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
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      searchable: true,
      width: '150px',
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      searchable: false,
      width: '100px',
      align: 'center',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      searchable: false,
      width: '150px',
      render: (value) => new Date(value).toLocaleDateString(),
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

  const users = data?.users || []
  const totalUsers = data?.users_aggregate?.aggregate?.count || 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-1">
          Search, filter, and sort users with real-time Hasura integration
        </p>
      </div>

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
