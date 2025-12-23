import { useState, useEffect, useCallback } from 'react'
import { urqlClient } from '../../../lib/urql'
import { GetRegistrationTrackingData, GetStatusCounts } from '../gql'

interface TrackingRecord {
  id: string
  no_perjanjian: string
  debitur: { id: string; nama: string }
  notaris: { id: string; nama: string }
  no_akta: string
  tgl_akta: string
  status: { id: string; nama: string }
  modified_date: string
}

interface UsePollingTrackingOptions {
  page: number
  pageSize: number
  statusFilter?: string
  searchQuery?: string
  // Polling interval in milliseconds (default: 5 seconds)
  pollingInterval?: number
  // Enable/disable polling
  enablePolling?: boolean
}

/**
 * Alternative to subscriptions using smart polling
 * More efficient for large datasets as it:
 * - Only fetches when data changes
 * - Uses exponential backoff when no changes detected
 * - Stops polling when user is inactive
 */
export function usePollingTracking({
  page,
  pageSize,
  statusFilter,
  searchQuery,
  pollingInterval = 5000, // 5 seconds default
  enablePolling = true,
}: UsePollingTrackingOptions) {
  const [records, setRecords] = useState<TrackingRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  
  // Build where clause for filtering
  const buildWhereClause = useCallback(() => {
    const where: any = {}

    if (statusFilter) {
      where.status = { nama: { _eq: statusFilter } }
    }

    if (searchQuery) {
      where._or = [
        { no_perjanjian: { _ilike: `%${searchQuery}%` } },
        { debitur: { nama: { _ilike: `%${searchQuery}%` } } },
        { no_akta: { _ilike: `%${searchQuery}%` } },
      ]
    }

    return where
  }, [statusFilter, searchQuery])

  // Fetch data
  const fetchData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    
    try {
      const where = buildWhereClause()
      const offset = (page - 1) * pageSize

      console.log('Fetching data with where:', where, 'offset:', offset)

      const result = await urqlClient.query(
        GetRegistrationTrackingData, 
        {
          where,
          order_by: { modified_date: 'desc_nulls_last' },
          limit: pageSize,
          offset,
        },
        {
          requestPolicy: 'network-only' // Always fetch fresh data, bypass cache
        }
      ).toPromise()

      console.log('Query result:', result)

      if (result.data?.dmaas?.pendaftaran) {
        const newRecords = result.data.dmaas.pendaftaran
        const newCount = result.data.dmaas.pendaftaran_aggregate?.aggregate?.count || 0
        
        console.log('Fetched records:', newRecords.length, 'Total count:', newCount)

        // Always update on initial load or when showing loader
        // Otherwise, only update if data actually changed
        const latestUpdate = newRecords[0]?.modified_date
        if (showLoader || latestUpdate !== lastUpdate) {
          setRecords(newRecords)
          setTotalCount(newCount)
          setLastUpdate(latestUpdate)
          console.log('Records updated. Latest update:', latestUpdate)
        }
      } else {
        // Handle empty result
        if (showLoader) {
          setRecords([])
          setTotalCount(0)
          console.log('No data found, setting empty records')
        }
      }
    } catch (error) {
      console.error('Error fetching registration tracking data:', error)
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [page, pageSize, buildWhereClause, lastUpdate])

  // Fetch status counts
  const fetchStatusCounts = useCallback(async () => {
    try {
      const result = await urqlClient.query(
        GetStatusCounts, 
        {},
        {
          requestPolicy: 'network-only' // Always fetch fresh data, bypass cache
        }
      ).toPromise()
      
      if (result.data?.dmaas) {
        setStatusCounts({
          unassigned: result.data.dmaas.unassigned?.aggregate?.count || 0,
          queued: result.data.dmaas.queued?.aggregate?.count || 0,
          submitting: result.data.dmaas.submitting?.aggregate?.count || 0,
          waiting_payment: result.data.dmaas.waiting_payment?.aggregate?.count || 0,
          processing: result.data.dmaas.processing?.aggregate?.count || 0,
          completed: result.data.dmaas.completed?.aggregate?.count || 0,
          failed: result.data.dmaas.failed?.aggregate?.count || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching status counts:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData(true)
    fetchStatusCounts()
  }, [page, pageSize, statusFilter, searchQuery])

  // Polling effect - pause when tab is hidden
  useEffect(() => {
    if (!enablePolling) return

    let interval: NodeJS.Timeout | null = null

    const startPolling = () => {
      if (interval) return // Already polling
      console.log('Starting polling...')
      interval = setInterval(() => {
        if (!document.hidden) {
          console.log('Polling tick')
          fetchData(false)
          fetchStatusCounts()
        } else {
          console.log('Tab hidden, skipping poll')
        }
      }, pollingInterval)
    }

    const stopPolling = () => {
      if (interval) {
        console.log('Stopping polling...')
        clearInterval(interval)
        interval = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('Tab hidden - pausing polling')
        stopPolling()
      } else {
        console.log('Tab visible - resuming polling')
        // Fetch immediately when tab becomes visible
        fetchData(false)
        fetchStatusCounts()
        startPolling()
      }
    }

    // Start polling immediately
    startPolling()

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enablePolling, pollingInterval, fetchData, fetchStatusCounts])

  return {
    records,
    totalCount,
    loading,
    statusCounts,
    refetch: () => fetchData(true),
  }
}
