import { useState, useCallback, useEffect, useRef } from 'react'
import { urqlClient } from '../../../lib/urql'
import { GetPendingBatches, GetBatchStats } from '../gql'

interface Batch {
  batch_id: string
  file_name: string
  created_date: string
  total_records: number
  unassigned_records: number
  assigned_records: number
  failed_records: number
  processing_check: number
  completed_check: number
  failed_check: number
}

export function usePendingBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [processingBatchIds, setProcessingBatchIds] = useState<Set<string>>(new Set())
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchBatches = useCallback(async (refetch = false, silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    try {
      // First, get all unique batch_ids
      const batchesResult = await urqlClient.query(GetPendingBatches, {}, {
        requestPolicy: refetch ? 'network-only' : 'cache-first',
      }).toPromise()
      
      if (batchesResult.data?.dmaas?.legalisasi) {
        const batchList = batchesResult.data.dmaas.legalisasi

        // For each batch, get statistics
        const batchesWithStats = await Promise.all(
          batchList.map(async (batch: any) => {
            const statsResult = await urqlClient.query(GetBatchStats, {
              batch_id: batch.batch_id,
            }, {
              requestPolicy: refetch ? 'network-only' : 'cache-first',
            }).toPromise()

            const total = statsResult.data?.dmaas?.total?.aggregate?.count || 0
            const assigned = statsResult.data?.dmaas?.assigned?.aggregate?.count || 0
            const failed = statsResult.data?.dmaas?.failed?.aggregate?.count || 0
            const processing_check = statsResult.data?.dmaas?.processing_check?.aggregate?.count || 0
            const completed_check = statsResult.data?.dmaas?.completed_check?.aggregate?.count || 0
            const failed_check = statsResult.data?.dmaas?.failed_check?.aggregate?.count || 0

            return {
              batch_id: batch.batch_id,
              file_name: batch.file_name,
              created_date: batch.created_date,
              total_records: total,
              assigned_records: assigned,
              failed_records: failed,
              unassigned_records: total - assigned - failed,
              processing_check,
              completed_check,
              failed_check,
            }
          })
        )

        // Filter to show batches with unassigned or failed records and sort by date
        const pendingBatches = batchesWithStats
          .filter(batch => batch.unassigned_records > 0 || batch.failed_records > 0)
          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())

        setBatches(pendingBatches)
        
        // Track which batches have processing checks
        const batchesWithProcessing = new Set(
          pendingBatches
            .filter(batch => batch.processing_check > 0)
            .map(batch => batch.batch_id)
        )
        setProcessingBatchIds(batchesWithProcessing)
        setIsPolling(batchesWithProcessing.size > 0)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
      setBatches([])
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  // Update only batches that have processing checks
  const updateProcessingBatches = useCallback(async () => {
    if (processingBatchIds.size === 0) return

    try {
      // Only fetch stats for batches that have processing checks
      const updatedBatches = await Promise.all(
        Array.from(processingBatchIds).map(async (batchId) => {
          const statsResult = await urqlClient.query(GetBatchStats, {
            batch_id: batchId,
          }, {
            requestPolicy: 'network-only',
          }).toPromise()

          const total = statsResult.data?.dmaas?.total?.aggregate?.count || 0
          const assigned = statsResult.data?.dmaas?.assigned?.aggregate?.count || 0
          const failed = statsResult.data?.dmaas?.failed?.aggregate?.count || 0
          const processing_check = statsResult.data?.dmaas?.processing_check?.aggregate?.count || 0
          const completed_check = statsResult.data?.dmaas?.completed_check?.aggregate?.count || 0
          const failed_check = statsResult.data?.dmaas?.failed_check?.aggregate?.count || 0

          return {
            batch_id: batchId,
            stats: {
              total_records: total,
              assigned_records: assigned,
              failed_records: failed,
              unassigned_records: total - assigned - failed,
              processing_check,
              completed_check,
              failed_check,
            }
          }
        })
      )

      // Update only the affected batches
      setBatches(prevBatches => {
        const updatedMap = new Map(updatedBatches.map(b => [b.batch_id, b.stats]))
        
        return prevBatches.map(batch => {
          const updatedStats = updatedMap.get(batch.batch_id)
          return updatedStats ? { ...batch, ...updatedStats } : batch
        })
      })

      // Update processing batch IDs
      const stillProcessing = new Set(
        updatedBatches
          .filter(b => b.stats.processing_check > 0)
          .map(b => b.batch_id)
      )
      setProcessingBatchIds(stillProcessing)
      setIsPolling(stillProcessing.size > 0)
    } catch (error) {
      console.error('Error updating processing batches:', error)
    }
  }, [processingBatchIds])

  // Auto-polling effect when there are processing checks
  useEffect(() => {
    if (isPolling) {
      // Poll every 5 seconds, but only update batches with processing checks
      pollingIntervalRef.current = setInterval(() => {
        updateProcessingBatches()
      }, 5000)
    } else {
      // Clear interval when no processing checks
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [isPolling, updateProcessingBatches])

  return {
    batches,
    loading,
    isPolling,
    fetchBatches,
  }
}
