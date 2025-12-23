import { type HasuraFilter, type HasuraOrderBy } from '../components/DataTable'

/**
 * Build Hasura WHERE clause from filter object
 * @param filters - Filter object
 * @returns Hasura-compatible where clause
 */
export function buildHasuraWhere(filters: HasuraFilter): any {
  if (!filters || Object.keys(filters).length === 0) {
    return undefined
  }
  return filters
}

/**
 * Build Hasura ORDER BY clause from sort config
 * @param orderBy - Array of order by objects
 * @returns Hasura-compatible order_by clause
 */
export function buildHasuraOrderBy(orderBy: HasuraOrderBy[]): any {
  if (!orderBy || orderBy.length === 0) {
    return undefined
  }
  return orderBy
}

/**
 * Create a text search filter for multiple columns
 * @param searchTerm - Search term
 * @param columns - Array of column names to search
 * @returns Hasura OR filter
 */
export function createTextSearchFilter(searchTerm: string, columns: string[]): HasuraFilter {
  if (!searchTerm.trim()) {
    return {}
  }

  return {
    _or: columns.map(col => ({
      [col]: { _ilike: `%${searchTerm}%` }
    }))
  }
}

/**
 * Combine multiple filters with AND
 * @param filters - Array of filter objects
 * @returns Combined filter
 */
export function combineFiltersAnd(...filters: HasuraFilter[]): HasuraFilter {
  const validFilters = filters.filter(f => f && Object.keys(f).length > 0)
  
  if (validFilters.length === 0) {
    return {}
  }
  
  if (validFilters.length === 1) {
    return validFilters[0]
  }
  
  return {
    _and: validFilters
  }
}

/**
 * Combine multiple filters with OR
 * @param filters - Array of filter objects
 * @returns Combined filter
 */
export function combineFiltersOr(...filters: HasuraFilter[]): HasuraFilter {
  const validFilters = filters.filter(f => f && Object.keys(f).length > 0)
  
  if (validFilters.length === 0) {
    return {}
  }
  
  if (validFilters.length === 1) {
    return validFilters[0]
  }
  
  return {
    _or: validFilters
  }
}

/**
 * Create a date range filter
 * @param column - Column name
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @returns Hasura filter for date range
 */
export function createDateRangeFilter(
  column: string,
  startDate?: string | Date,
  endDate?: string | Date
): HasuraFilter {
  const filter: HasuraFilter = {}
  
  if (startDate) {
    filter[column] = { _gte: startDate }
  }
  
  if (endDate) {
    if (filter[column]) {
      filter[column]._lte = endDate
    } else {
      filter[column] = { _lte: endDate }
    }
  }
  
  return Object.keys(filter).length > 0 ? filter : {}
}

/**
 * Create a numeric range filter
 * @param column - Column name
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @returns Hasura filter for numeric range
 */
export function createNumericRangeFilter(
  column: string,
  min?: number,
  max?: number
): HasuraFilter {
  const filter: HasuraFilter = {}
  
  if (min !== undefined) {
    filter[column] = { _gte: min }
  }
  
  if (max !== undefined) {
    if (filter[column]) {
      filter[column]._lte = max
    } else {
      filter[column] = { _lte: max }
    }
  }
  
  return Object.keys(filter).length > 0 ? filter : {}
}

/**
 * Create an IN filter
 * @param column - Column name
 * @param values - Array of values
 * @returns Hasura IN filter
 */
export function createInFilter(column: string, values: any[]): HasuraFilter {
  if (!values || values.length === 0) {
    return {}
  }
  
  return {
    [column]: { _in: values }
  }
}

/**
 * Create a NOT IN filter
 * @param column - Column name
 * @param values - Array of values
 * @returns Hasura NOT IN filter
 */
export function createNotInFilter(column: string, values: any[]): HasuraFilter {
  if (!values || values.length === 0) {
    return {}
  }
  
  return {
    [column]: { _nin: values }
  }
}

/**
 * Create an IS NULL filter
 * @param column - Column name
 * @param isNull - True for IS NULL, false for IS NOT NULL
 * @returns Hasura NULL filter
 */
export function createNullFilter(column: string, isNull: boolean = true): HasuraFilter {
  return {
    [column]: { _is_null: isNull }
  }
}
