import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Upload, Download, X, Clock, Send } from 'lucide-react'
import type { FidusiaCSVData } from '../../../types'

interface UploadTabProps {
  file: File | null
  preview: FidusiaCSVData[]
  jsonData: any[]
  uploading: boolean
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onDownloadTemplate: () => void
  onClearFile: () => void
  onUpload: () => void
}

export default function UploadTab({
  file,
  preview,
  jsonData,
  uploading,
  onFileChange,
  onDownloadTemplate,
  onClearFile,
  onUpload,
}: UploadTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      {/* Download Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Download Excel Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download the Excel template with sample data for Indonesian AHU fidusia registration.
              Includes all 57 required fields with examples.
            </p>
            <button
              onClick={onDownloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Download Excel Template
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              file
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={onFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB - Click to change file
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-600">CSV or Excel files (.csv, .xls, .xlsx)</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      {jsonData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to Upload</h3>
              <p className="text-sm text-gray-600">
                {jsonData.length} records ready to be uploaded
              </p>
            </div>
            <button
              onClick={onUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">File Preview</h3>
              <p className="text-sm text-gray-600">
                Showing first 5 of {jsonData.length} rows
              </p>
            </div>
            {file && (
              <button
                onClick={onClearFile}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {preview[0] && Object.keys(preview[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                      >
                        {String(value || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
