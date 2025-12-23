import { useState, useEffect, useCallback, useRef } from 'react'
import { urqlClient } from '../../../lib/urql'
import { 
  GetRegistrationTrackingData, 
  SubscribeRegistrationTracking,
  SubscribeStatusChanges,
  GetStatusCounts 
} from '../gql'
import { pipe, subscribe } from 'wonka'

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

interface UseRegistrationTrackingOptions {
  // Only subscribe to currently visible page
  page: number
  pageSize: number
  statusFilter?: string
  searchQuery?: string
  // Enable/disable real-time updates
  enableRealtime?: boolean
}

export function useRegistrationTracking({
  page,
  pageSize,
  statusFilter,
  searchQuery,
  enableRealtime = true,
}: UseRegistrationTrackingOptions) {
  const [records, setRecords] = useState<TrackingRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const subscriptionRef = useRef<any>(null)
  const notificationSubRef = useRef<any>(null)

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

  // Initial data load with query (faster than subscription)
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const where = buildWhereClause()
      const offset = (page - 1) * pageSize

      const result = await urqlClient.query(GetRegistrationTrackingData, {
        where,
        order_by: { modified_date: 'desc' },
        limit: pageSize,
        offset,
      }).toPromise()

      if (result.data?.dmaas?.pendaftaran) {
        setRecords(result.data.dmaas.pendaftaran)
        setTotalCount(result.data.dmaas.pendaftaran_aggregate?.aggregate?.count || 0)
      }
    } catch (error) {
      console.error('Error fetching registration tracking data:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, buildWhereClause])

  // Fetch status counts for dashboard
  const fetchStatusCounts = useCallback(async () => {
    try {
      const result = await urqlClient.query(GetStatusCounts, {}).toPromise()
      
      if (result.data?.dmaas) {
        setStatusCounts({
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

  // Subscribe to ONLY the current page's data
  useEffect(() => {
    if (!enableRealtime) {
      fetchData()
      return
    }

    const where = buildWhereClause()
    const offset = (page - 1) * pageSize

    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Subscribe to current page only
    const subscription = pipe(
      urqlClient.subscription(SubscribeRegistrationTracking, {
        where,
        order_by: { modified_date: 'desc' },
        limit: pageSize,
        offset,
      }),
      subscribe((result) => {
        if (result.data?.dmaas?.pendaftaran) {
          setRecords(result.data.dmaas.pendaftaran)
          setLoading(false)
        }
      })
    )

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [page, pageSize, enableRealtime, buildWhereClause])

  // Lightweight notification subscription for ANY status changes
  // This is used to show toast notifications and refetch data
  useEffect(() => {
    if (!enableRealtime) return

    const where = buildWhereClause()

    if (notificationSubRef.current) {
      notificationSubRef.current.unsubscribe()
    }

    // Subscribe to latest status change only (very lightweight)
    const subscription = pipe(
      urqlClient.subscription(SubscribeStatusChanges, { where }),
      subscribe((result) => {
        if (result.data?.dmaas?.pendaftaran?.[0]) {
          const changed = result.data.dmaas.pendaftaran[0]
          
          // Show notification or toast
          console.log('Status changed:', changed.no_perjanjian, '→', changed.status.nama)
          
          // Refetch current page to get updated data
          fetchData()
          fetchStatusCounts()
        }
      })
    )

    notificationSubRef.current = subscription

    return () => {
      if (notificationSubRef.current) {
        notificationSubRef.current.unsubscribe()
      }
    }
  }, [enableRealtime, buildWhereClause, fetchData, fetchStatusCounts])

  // Initial load
  useEffect(() => {
    if (!enableRealtime) {
      fetchData()
    }
    fetchStatusCounts()
  }, [enableRealtime, fetchData, fetchStatusCounts])

  return {
    records,
    totalCount,
    loading,
    statusCounts,
    refetch: fetchData,
  }
}
