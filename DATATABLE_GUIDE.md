# DataTable Component - Hasura Integration Guide

A powerful, reusable table component with search, filter, and sort capabilities that seamlessly integrates with Hasura GraphQL.

## Features

✅ **Global Search** - Search across all searchable columns  
✅ **Column-Specific Filters** - Filter individual columns  
✅ **Sorting** - Sort by any column (ascending/descending)  
✅ **Hasura Integration** - Direct compatibility with Hasura's filter and sort syntax  
✅ **Pagination** - Built-in pagination support  
✅ **Custom Rendering** - Custom cell renderers  
✅ **TypeScript** - Full type safety  
✅ **Loading States** - Built-in loading indicators  

## Installation

The component is already created in `/src/components/DataTable.tsx`

## Basic Usage

```tsx
import { useState } from 'react'
import { useQuery, gql } from 'urql'
import DataTable, { TableColumn, HasuraFilter, HasuraOrderBy } from '../components/DataTable'

const MY_QUERY = gql`
  query GetData($where: my_table_bool_exp, $order_by: [my_table_order_by!]) {
    my_table(where: $where, order_by: $order_by) {
      id
      name
      email
    }
  }
`

function MyComponent() {
  const [filters, setFilters] = useState<HasuraFilter>({})
  const [orderBy, setOrderBy] = useState<HasuraOrderBy[]>([])

  const [result] = useQuery({
    query: MY_QUERY,
    variables: { where: filters, order_by: orderBy }
  })

  const columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
  ]

  return (
    <DataTable
      columns={columns}
      data={result.data?.my_table || []}
      loading={result.fetching}
      onFilterChange={setFilters}
      onSortChange={setOrderBy}
    />
  )
}
```

## Column Configuration

```tsx
interface TableColumn {
  key: string                    // Column key (matches data property)
  label: string                  // Display label
  sortable?: boolean            // Enable sorting (default: true)
  searchable?: boolean          // Enable search (default: true)
  render?: (value, row) => JSX  // Custom cell renderer
  width?: string                // Column width (e.g., '200px')
  align?: 'left' | 'center' | 'right'  // Text alignment
  filterType?: 'text' | 'number' | 'select' | 'date'
}
```

### Example with Custom Rendering

```tsx
const columns: TableColumn[] = [
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span className={`badge ${value === 'active' ? 'badge-success' : 'badge-danger'}`}>
        {value}
      </span>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    filterType: 'number',
    render: (value) => `$${value.toFixed(2)}`
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    searchable: false,
    render: (value) => new Date(value).toLocaleDateString()
  }
]
```

## Hasura Integration

### Filter Examples

The component automatically converts filters to Hasura's `bool_exp` format:

```tsx
// Text search (case-insensitive)
{ name: { _ilike: '%john%' } }

// Exact match
{ status: { _eq: 'active' } }

// Numeric comparison
{ age: { _gte: 18 } }

// OR condition (global search)
{
  _or: [
    { name: { _ilike: '%search%' } },
    { email: { _ilike: '%search%' } }
  ]
}

// AND condition (multiple column filters)
{
  name: { _ilike: '%john%' },
  status: { _eq: 'active' }
}
```

### Sort Examples

```tsx
// Sort by name ascending
[{ name: 'asc' }]

// Sort by name descending
[{ name: 'desc' }]

// Multiple sorts (name asc, then created_at desc)
[{ name: 'asc' }, { created_at: 'desc' }]
```

## Hasura Helper Functions

Use the helper functions in `/src/lib/hasura-helpers.ts`:

```tsx
import {
  buildHasuraWhere,
  buildHasuraOrderBy,
  createTextSearchFilter,
  combineFiltersAnd,
  createDateRangeFilter,
  createInFilter,
} from '../lib/hasura-helpers'

// Combine multiple filters
const combinedFilter = combineFiltersAnd(
  { status: { _eq: 'active' } },
  createTextSearchFilter('john', ['name', 'email']),
  createDateRangeFilter('created_at', '2024-01-01', '2024-12-31')
)

// Use in query
const [result] = useQuery({
  query: MY_QUERY,
  variables: {
    where: buildHasuraWhere(combinedFilter),
    order_by: buildHasuraOrderBy(orderBy)
  }
})
```

## Complete Example with Pagination

```tsx
import { useState } from 'react'
import { useQuery, gql } from 'urql'
import DataTable, { TableColumn, HasuraFilter, HasuraOrderBy } from '../components/DataTable'

const PRODUCTS_QUERY = gql`
  query GetProducts(
    $where: products_bool_exp
    $order_by: [products_order_by!]
    $limit: Int
    $offset: Int
  ) {
    products(where: $where, order_by: $order_by, limit: $limit, offset: $offset) {
      id
      name
      price
      category
      stock
      is_active
    }
    products_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export default function ProductsTable() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState<HasuraFilter>({})
  const [orderBy, setOrderBy] = useState<HasuraOrderBy[]>([{ name: 'asc' }])

  const [result] = useQuery({
    query: PRODUCTS_QUERY,
    variables: {
      where: filters,
      order_by: orderBy,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  })

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      width: '250px',
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '150px',
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      filterType: 'number',
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      filterType: 'number',
      align: 'center',
      render: (value) => (
        <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
          {value}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      searchable: false,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={result.data?.products || []}
      loading={result.fetching}
      onFilterChange={(f) => {
        setFilters(f)
        setPage(1) // Reset to page 1 on filter change
      }}
      onSortChange={setOrderBy}
      globalSearch={true}
      pagination={{
        total: result.data?.products_aggregate?.aggregate?.count || 0,
        pageSize,
        currentPage: page,
        onPageChange: setPage,
      }}
    />
  )
}
```

## Advanced Filtering

### Custom Filter Logic

```tsx
import { combineFiltersAnd, createInFilter, createDateRangeFilter } from '../lib/hasura-helpers'

function handleCustomFilter(
  searchTerm: string,
  categories: string[],
  dateRange: { start: string; end: string }
) {
  const filters = combineFiltersAnd(
    searchTerm ? { name: { _ilike: `%${searchTerm}%` } } : {},
    categories.length > 0 ? createInFilter('category', categories) : {},
    createDateRangeFilter('created_at', dateRange.start, dateRange.end)
  )
  
  setFilters(filters)
}
```

### Relationship Filtering

```tsx
// Filter by related table
const filters = {
  user: {
    email: { _ilike: '%@example.com' }
  }
}

// Filter by nested relationship
const filters = {
  order: {
    customer: {
      country: { _eq: 'Indonesia' }
    }
  }
}
```

## Hasura Query Setup

### Enable GraphQL in Hasura

1. Go to Hasura Console
2. Navigate to "Data" tab
3. Select your table
4. Click "Track" to expose it to GraphQL
5. Set up permissions for your role

### Example Hasura Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## TypeScript Types

```typescript
// Filter operators
type HasuraFilterOperator = 
  | '_eq'       // Equal
  | '_neq'      // Not equal
  | '_gt'       // Greater than
  | '_gte'      // Greater than or equal
  | '_lt'       // Less than
  | '_lte'      // Less than or equal
  | '_like'     // Like (case-sensitive)
  | '_ilike'    // Like (case-insensitive)
  | '_in'       // In array
  | '_nin'      // Not in array
  | '_is_null'  // Is null

// Order by directions
type HasuraOrderByDirection = 
  | 'asc' 
  | 'desc' 
  | 'asc_nulls_first' 
  | 'asc_nulls_last' 
  | 'desc_nulls_first' 
  | 'desc_nulls_last'
```

## Performance Tips

1. **Use Indexes**: Create database indexes on frequently filtered/sorted columns
2. **Limit Results**: Always use pagination to limit result sets
3. **Debounce Search**: Debounce global search input to avoid excessive queries
4. **Cache Results**: urql automatically caches results
5. **Select Only Needed Fields**: Only query fields you actually display

## Styling Customization

The component uses Tailwind CSS. Customize by:

```tsx
<DataTable
  className="shadow-xl rounded-xl"
  // ... other props
/>
```

Or modify the component's internal classes in `/src/components/DataTable.tsx`.

## Complete Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn[]` | required | Column definitions |
| `data` | `T[]` | required | Table data |
| `loading` | `boolean` | `false` | Show loading state |
| `onFilterChange` | `(filters) => void` | - | Filter change callback |
| `onSortChange` | `(orderBy) => void` | - | Sort change callback |
| `globalSearch` | `boolean` | `true` | Enable global search |
| `pagination` | `object` | - | Pagination config |
| `emptyMessage` | `string` | 'No data available' | Empty state message |
| `className` | `string` | `''` | Additional CSS classes |

## Troubleshooting

### Filters not working
- Check Hasura permissions for the table
- Verify column names match between frontend and Hasura schema
- Check browser console for GraphQL errors

### Sorting not working
- Ensure column is marked as `sortable: true`
- Check Hasura allows ordering on the column
- Verify order_by syntax in GraphQL query

### Performance issues
- Add database indexes
- Reduce page size
- Use field selection to limit data
- Enable Hasura query caching

## Files Created

- `/src/components/DataTable.tsx` - Main component
- `/src/lib/hasura-helpers.ts` - Helper functions
- `/src/components/examples/ExampleUsersTable.tsx` - Usage example
