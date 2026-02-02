import { useState, useCallback } from 'react'
import { urqlClient } from '../../../lib/urql'
import { GetUploadedRecords, GetNotaries, AssignNotaryMutation, BulkAssignNotaryMutation } from '../gql'
import { CREATED_BY_ID } from '../utils'

interface NotaryAssignment {
  notaryId: string
  quantity: number
  startAktaNo: number
}

export function useUploadedRecords() {
  const [uploadedRecords, setUploadedRecords] = useState<any[]>([])
  const [notaries, setNotaries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async (batch_id: string) => {
    setLoading(true)
    try {
      const result = await urqlClient.query(GetUploadedRecords, {
        where: { batch_id: { _eq: batch_id } },
        order_by: { created_date: 'desc' },
      }, {
        requestPolicy: 'network-only',
      }).toPromise()
      if (result.data?.dmaas?.pendaftaran) {
        setUploadedRecords(result.data.dmaas.pendaftaran)
      }
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNotaries = useCallback(async () => {
    try {
      const result = await urqlClient.query(GetNotaries, {}).toPromise()
      if (result.data?.dmaas?.notaris) {
        setNotaries(result.data.dmaas.notaris)
      }
    } catch (error) {
      console.error('Error fetching notaries:', error)
    }
  }, [])

  const assignNotary = useCallback(async (recordId: string, notaryId: string) => {
    try {
      const result = await urqlClient.mutation(AssignNotaryMutation, {
        id: recordId,
        notaris_id: notaryId,
      }).toPromise()

      if (result.error) {
        throw new Error(result.error.message)
      }

    //   await fetchRecords()
      alert('Notary assigned successfully!')
    } catch (error) {
      console.error('Error assigning notary:', error)
      alert(`Failed to assign notary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [fetchRecords])

  const bulkAssignNotaries = useCallback(async (assignments: NotaryAssignment[], batch_id: string) => {
    try {
      // Execute bulk update
      const result = await urqlClient.query(BulkAssignNotaryMutation, {
        args: {
          _batch_id: batch_id,
          _created_by: CREATED_BY_ID,
          _assignments: assignments.map(a => ({
            notaris_id: a.notaryId,
            no_akta: a.startAktaNo,
            quantity: a.quantity,
          })),
        },
      }).toPromise()

      if (result.error) {
        throw new Error(result.error.message)
      }
      const assignedCount = assignments.reduce((sum, a) => sum + a.quantity, 0)

      alert(`Successfully assigned ${assignedCount} records to notaries!`)
      
      // Refresh records
      await fetchRecords(batch_id)
    } catch (error) {
      console.error('Error bulk assigning notaries:', error)
      alert(`Failed to assign notaries: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }, [uploadedRecords, fetchRecords])

  return {
    uploadedRecords,
    notaries,
    loading,
    fetchRecords,
    fetchNotaries,
    assignNotary,
    bulkAssignNotaries,
  }
}
