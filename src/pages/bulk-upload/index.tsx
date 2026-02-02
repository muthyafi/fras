import { useState, useEffect } from 'react'
import { urqlClient } from '../../lib/urql'
import { UploadFidusiaData } from './gql'
import { useFileParser } from './hooks/useFileParser'
import { useUploadedRecords } from './hooks/useUploadedRecords'
import { usePendingBatches } from './hooks/usePendingBatches'
import { downloadTemplate, CREATED_BY_ID } from './utils'
import TabNavigation from './components/TabNavigation'
import UploadTab from './components/UploadTab'
import PendingBatchesTab from './components/PendingBatchesTab'
import ReviewTab from './components/ReviewTab'

type Tab = 'upload' | 'pending' | 'review'

export default function BulkUpload() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [uploading, setUploading] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)

  // File parsing hook
  const { file, preview, jsonData, handleFileChange, clearFile } = useFileParser()

  // Pending batches hook
  const {
    batches,
    loading: batchesLoading,
    isPolling,
    fetchBatches,
  } = usePendingBatches()

  // Uploaded records hook
  const {
    uploadedRecords,
    notaries,
    loading,
    fetchRecords,
    fetchNotaries,
    assignNotary,
    bulkAssignNotaries,
  } = useUploadedRecords()

  // Fetch data when switching tabs
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchBatches()
    } else if (activeTab === 'review' && batchId) {
      fetchRecords(batchId)
      fetchNotaries()
    }
  }, [activeTab, batchId, fetchRecords, fetchNotaries, fetchBatches])

  const handleSelectBatch = (selectedBatchId: string) => {
    setBatchId(selectedBatchId)
    setActiveTab('review')
  }

  const handleUpload = async () => {
    if (jsonData.length === 0) {
      alert('Please upload a file first')
      return
    }

    setUploading(true)
    try {
      const result = await urqlClient.query(UploadFidusiaData, {
        args: {
          _created_by: CREATED_BY_ID,
          _json_text: jsonData,
          _file_name: file?.name || 'uploaded_file',
        },
      }).toPromise()

      if (result.error) {
        throw new Error(result.error.message)
      }
      console.log('Upload result:', result.data)
      const newBatchId = result.data?.dmaas.import_data_fidusia[0]?.results?.batch_id || null
      setBatchId(newBatchId)
      alert('Upload successful! Switching to Review tab to assign notaries.')

      // Refresh pending batches and switch to review tab
      await fetchBatches()
      setActiveTab('pending')
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Fidusia Registration</h1>
        <p className="text-gray-600 mt-1">Upload CSV or Excel to validate and register multiple Fidusia agreements</p>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        pendingBatchesCount={batches.length}
        uploadedRecordsCount={uploadedRecords.length}
        onTabChange={setActiveTab}
      />

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <UploadTab
          file={file}
          preview={preview}
          jsonData={jsonData}
          uploading={uploading}
          onFileChange={handleFileChange}
          onDownloadTemplate={downloadTemplate}
          onClearFile={clearFile}
          onUpload={handleUpload}
        />
      )}

      {/* Pending Batches Tab */}
      {activeTab === 'pending' && (
        <PendingBatchesTab
          batches={batches}
          loading={batchesLoading}
          isPolling={isPolling}
          onRefresh={() => fetchBatches(true)}
          onSelectBatch={handleSelectBatch}
        />
      )}

      {/* Review Tab */}
      {activeTab === 'review' && batchId && (
        <ReviewTab
          uploadedRecords={uploadedRecords}
          notaries={notaries}
          loading={loading}
          onRefresh={() => fetchRecords(batchId)}
          onAssignNotary={assignNotary}
          onBulkAssign={async (assignments) => {
            await bulkAssignNotaries(assignments, batchId)
            // Refresh pending batches after assignment
            fetchBatches()
          }}
        />
      )}

      {/* Review Tab - No batch selected */}
      {activeTab === 'review' && !batchId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-600 mb-4">No batch selected</p>
          <button
            onClick={() => setActiveTab('pending')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Pending Batches
          </button>
        </div>
      )}
    </div>
  )
}
