import { Clock, FileText, Users, Calendar, ChevronRight, Download, XCircle, AlertCircle, Search, ChevronLeft } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { urqlClient } from '../../../lib/urql'
import { GetFailedRecords } from '../gql'
import { exportFailedRecordsToExcel } from '../utils'
import { useState, useMemo } from 'react'

dayjs.extend(utc)
dayjs.extend(timezone)

interface Batch {
  batch_id: string
  file_name: string
  created_date: string
  total_records: number
  unassigned_records: number
  assigned_records: number
  failed_records: number
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
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const formatDate = (dateStr: string) => {
    return dayjs.utc(dateStr).tz(dayjs.tz.guess()).locale('id').format('DD MMM YYYY, HH:mm')
  }

  // Filter batches based on search query
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches

    const query = searchQuery.toLowerCase()
    return batches.filter(batch => {
      const batchDate = dayjs.utc(batch.created_date).tz(dayjs.tz.guess()).locale('id').format('DD MMM YYYY').toLowerCase()
      const formattedDate = formatDate(batch.created_date).toLowerCase()
      const batchId = batch.batch_id.toLowerCase()
      
      return batchDate.includes(query) || 
             formattedDate.includes(query) || 
             batchId.includes(query)
    })
  }, [batches, searchQuery])

  // Paginate filtered batches
  const paginatedBatches = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBatches.slice(startIndex, endIndex)
  }, [filteredBatches, currentPage])

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage)

  // Reset to page 1 when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const downloadFailedRecords = async (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloadingBatchId(batchId)
    
    try {
      const result = await urqlClient.query(GetFailedRecords, { batch_id: batchId }).toPromise()
      
      if (result.data?.dmaas?.legalisasi) {
        const failedRecords = result.data.dmaas.legalisasi
        if (failedRecords.length > 0) {
          exportFailedRecordsToExcel(failedRecords, batchId)
        } else {
          alert('No failed records found for this batch')
        }
      }
    } catch (error) {
      console.error('Error downloading failed records:', error)
      alert('Failed to download records. Please try again.')
    } finally {
      setDownloadingBatchId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Pending Batches</h3>
          <p className="text-sm text-gray-600">
            View and manage batches with unassigned or failed records
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

      {/* Search Bar */}
      {!loading && batches.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by batch date or ID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredBatches.length} batch{filteredBatches.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      )}

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
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No batches found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedBatches.map((batch) => {
            const completionPercent = Math.round(
              (batch.assigned_records / batch.total_records) * 100
            )
            const hasUnassigned = batch.unassigned_records > 0
            const isClickable = hasUnassigned

            return (
              <div
                key={batch.batch_id}
                className={`border border-gray-200 rounded-lg p-4 transition-all ${
                  isClickable 
                    ? 'hover:border-blue-300 hover:shadow-md cursor-pointer' 
                    : 'opacity-75 cursor-default'
                }`}
                onClick={() => isClickable && onSelectBatch(batch.batch_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">
                        Batch {dayjs.utc(batch.created_date).tz(dayjs.tz.guess()).locale('id').format('DD MMM YYYY')}
                      </h4>
                      <div className="flex items-center gap-2">
                        {batch.unassigned_records > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            Needs Assignment
                          </span>
                        )}
                        {batch.failed_records > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-md">
                            <XCircle className="w-3 h-3" />
                            Has Failures
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
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
                      <div className="flex items-center gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600">
                          Failed: {batch.failed_records}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-3">
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

                    {/* Download Failed Records Button */}
                    {batch.failed_records > 0 && (
                      <button
                        onClick={(e) => downloadFailedRecords(batch.batch_id, e)}
                        disabled={downloadingBatchId === batch.batch_id}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {downloadingBatchId === batch.batch_id ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download {batch.failed_records} Failed Record{batch.failed_records > 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isClickable && <ChevronRight className="w-5 h-5 text-gray-400 ml-4 shrink-0" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBatches.length)} of {filteredBatches.length} batches
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = page === 1 || 
                                   page === totalPages || 
                                   (page >= currentPage - 1 && page <= currentPage + 1)
                  
                  const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                      (page === currentPage + 2 && currentPage < totalPages - 2)
                  
                  if (showEllipsis) {
                    return <span key={page} className="px-2 text-gray-400">...</span>
                  }
                  
                  if (!showPage) return null
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-10 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-600 text-white font-medium'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </>
      )}
    </div>
  )
}
