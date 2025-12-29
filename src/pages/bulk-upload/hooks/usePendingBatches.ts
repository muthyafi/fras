import { useState, useCallback } from 'react'
import { urqlClient } from '../../../lib/urql'
import { GetPendingBatches, GetBatchStats } from '../gql'

interface Batch {
  batch_id: string
  file_name: string
  created_date: string
  total_records: number
  unassigned_records: number
  assigned_records: number
}

export function usePendingBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBatches = useCallback(async (refetch = false) => {
    setLoading(true)
    try {
      // First, get all unique batch_ids
      const batchesResult = await urqlClient.query(GetPendingBatches, {}, {
        requestPolicy: refetch ? 'network-only' : 'cache-and-network',
      }).toPromise()
      
      if (batchesResult.data?.dmaas?.legalisasi) {
        const batchList = batchesResult.data.dmaas.legalisasi

        // For each batch, get statistics
        const batchesWithStats = await Promise.all(
          batchList.map(async (batch: any) => {
            const statsResult = await urqlClient.query(GetBatchStats, {
              batch_id: batch.batch_id,
            }).toPromise()

            const total = statsResult.data?.dmaas?.total?.aggregate?.count || 0
            const assigned = statsResult.data?.dmaas?.assigned?.aggregate?.count || 0

            return {
              batch_id: batch.batch_id,
              file_name: batch.file_name,
              created_date: batch.created_date,
              total_records: total,
              assigned_records: assigned,
              unassigned_records: total - assigned,
            }
          })
        )

        // Filter to only show batches with unassigned records and sort by date
        const pendingBatches = batchesWithStats
          .filter(batch => batch.unassigned_records > 0)
          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())

        setBatches(pendingBatches)
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    batches,
    loading,
    fetchBatches,
  }
}
