import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, Filter } from 'lucide-react'

// Hasura filter types
export type HasuraFilterOperator = '_eq' | '_neq' | '_gt' | '_gte' | '_lt' | '_lte' | '_like' | '_ilike' | '_in' | '_nin' | '_is_null'

export interface HasuraFilter {
  [key: string]: any
}

export interface HasuraOrderBy {
  [key: string]: 'asc' | 'desc' | 'asc_nulls_first' | 'asc_nulls_last' | 'desc_nulls_first' | 'desc_nulls_last'
}

// Column definition
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  filterType?: 'text' | 'number' | 'select' | 'date'
  filterOptions?: { label: string; value: any }[]
}

// Table props
export interface DataTableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  onFilterChange?: (filters: HasuraFilter) => void
  onSortChange?: (orderBy: HasuraOrderBy[]) => void
  globalSearch?: boolean
  pagination?: {
    total: number
    pageSize: number
    currentPage: number
    onPageChange: (page: number) => void
  }
  emptyMessage?: string
  className?: string
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  onFilterChange,
  onSortChange,
  globalSearch = true,
  pagination,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<HasuraOrderBy[]>([])
  const [showColumnFilters, setShowColumnFilters] = useState(false)

  // Handle global search
  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term)
    
    if (!onFilterChange || !term.trim()) {
      onFilterChange?.({})
      return
    }

    // Create OR filter for all searchable columns
    const searchableColumns = columns.filter(col => col.searchable !== false)
    const orFilters = searchableColumns.map(col => ({
      [col.key]: { _ilike: `%${term}%` }
    }))

    if (orFilters.length > 0) {
      onFilterChange({ _or: orFilters })
    }
  }

  // Handle column-specific filter
  const handleColumnFilter = (columnKey: string, value: string) => {
    const newFilters = { ...columnFilters }
    
    if (value.trim() === '') {
      delete newFilters[columnKey]
    } else {
      newFilters[columnKey] = value
    }
    
    setColumnFilters(newFilters)

    // Convert to Hasura filter format
    if (onFilterChange) {
      const hasuraFilter: HasuraFilter = {}
      Object.entries(newFilters).forEach(([key, val]) => {
        const column = columns.find(col => col.key === key)
        if (column?.filterType === 'number') {
          hasuraFilter[key] = { _eq: Number(val) }
        } else {
          hasuraFilter[key] = { _ilike: `%${val}%` }
        }
      })
      
      onFilterChange(hasuraFilter)
    }
  }

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    let newSortConfig: HasuraOrderBy[]
    const existingSort = sortConfig.find(s => s[columnKey])

    if (!existingSort) {
      // Add new sort (ascending)
      newSortConfig = [{ [columnKey]: 'asc' }]
    } else if (existingSort[columnKey] === 'asc') {
      // Change to descending
      newSortConfig = [{ [columnKey]: 'desc' }]
    } else {
      // Remove sort
      newSortConfig = []
    }

    setSortConfig(newSortConfig)
    onSortChange?.(newSortConfig)
  }

  // Get sort direction for a column
  const getSortDirection = (columnKey: string): 'asc' | 'desc' | null => {
    const sort = sortConfig.find(s => s[columnKey])
    if (!sort) return null
    const direction = sort[columnKey]
    return direction === 'asc' || direction === 'desc' ? direction : null
  }

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalSearchTerm('')
    setColumnFilters({})
    onFilterChange?.({})
  }

  // Check if any filters are active
  const hasActiveFilters = globalSearchTerm.trim() !== '' || Object.keys(columnFilters).length > 0

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header with global search */}
      {globalSearch && (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={globalSearchTerm}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm hover:border-gray-300 transition-all placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              className={`flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow font-medium ${
                showColumnFilters
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showColumnFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-5 py-3 text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded-xl transition-all shadow-sm hover:shadow font-medium"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`px-6 py-4 text-${column.align || 'left'} text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{column.label}</span>
                    {column.sortable !== false && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-1.5 hover:bg-white/80 rounded-lg transition-all hover:shadow-sm active:scale-95"
                      >
                        {getSortDirection(column.key) === 'asc' ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : getSortDirection(column.key) === 'desc' ? (
                          <ChevronDown className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {/* Column filters row */}
            {showColumnFilters && (
              <tr className="bg-white border-b border-gray-200">
                {columns.map((column) => (
                  <th key={`filter-${column.key}`} className="px-6 py-3">
                    {column.searchable !== false && (
                      <input
                        type={column.filterType === 'number' ? 'number' : 'text'}
                        placeholder={`Filter...`}
                        value={columnFilters[column.key] || ''}
                        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 hover:bg-white transition-colors placeholder:text-gray-400"
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading data...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-lg">{emptyMessage}</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-blue-50/50 transition-all duration-150 group"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-${column.align || 'left'} text-sm text-gray-900`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-bold text-gray-900">
              {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.total)}
            </span>{' '}
            to{' '}
            <span className="font-bold text-gray-900">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-gray-900">{pagination.total.toLocaleString()}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 disabled:hover:bg-transparent disabled:hover:shadow-none active:scale-95"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  const totalPages = Math.ceil(pagination.total / pagination.pageSize)
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1
                  )
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsisBefore && <span className="px-2 text-gray-400 font-medium">...</span>}
                      <button
                        onClick={() => pagination.onPageChange(page)}
                        className={`min-w-[40px] px-4 py-2 border rounded-xl transition-all font-medium active:scale-95 ${
                          pagination.currentPage === page
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                            : 'border-gray-200 hover:bg-white hover:shadow-md text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })}
            </div>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 disabled:hover:bg-transparent disabled:hover:shadow-none active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
