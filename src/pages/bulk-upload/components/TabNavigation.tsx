import { Upload, UserCheck, ClipboardList } from 'lucide-react'

type Tab = 'upload' | 'pending' | 'review'

interface TabNavigationProps {
  activeTab: Tab
  pendingBatchesCount: number
  uploadedRecordsCount: number
  onTabChange: (tab: Tab) => void
}

export default function TabNavigation({ 
  activeTab, 
  pendingBatchesCount,
  uploadedRecordsCount, 
  onTabChange 
}: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-8">
        <button
          onClick={() => onTabChange('upload')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload File
          </div>
        </button>
        <button
          onClick={() => onTabChange('pending')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Pending Batches
            {pendingBatchesCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {pendingBatchesCount}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => onTabChange('review')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'review'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Review & Assign
            {uploadedRecordsCount > 0 && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {uploadedRecordsCount}
              </span>
            )}
          </div>
        </button>
      </nav>
    </div>
  )
}
