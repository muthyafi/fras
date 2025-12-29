import { Clock, FileText, Users, Calendar, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

interface Batch {
  batch_id: string
  file_name: string
  created_date: string
  total_records: number
  unassigned_records: number
  assigned_records: number
}

interface PendingBatchesTabProps {
  batches: Batch[]
  loading: boolean
  onRefresh: () => void
  onSelectBatch: (batchId: string) => void
}

export default function PendingBatchesTab({
  batches,
  loading,
  onRefresh,
  onSelectBatch,
}: PendingBatchesTabProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Pending Batches</h3>
          <p className="text-sm text-gray-600">
            View and manage batches with unassigned records
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Refresh
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No pending batches</p>
          <p className="text-sm text-gray-500">
            All uploaded batches have been fully assigned to notaries
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => {
            const completionPercent = Math.round(
              (batch.assigned_records / batch.total_records) * 100
            )

            return (
              <div
                key={batch.batch_id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onSelectBatch(batch.batch_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">
                        Batch {dayjs(batch.created_date).locale('id').format('DD MMM YYYY')}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(batch.created_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Total: {batch.total_records} records
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
                          Assigned: {batch.assigned_records}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600">
                          Unassigned: {batch.unassigned_records}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-12 text-right">
                        {completionPercent}%
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
