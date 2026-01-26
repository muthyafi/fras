import { useState } from 'react'
import { CheckCircle, Clock, FileCheck, FileText, UserPlus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils'

interface Notary {
  id: string
  nama: string
  last_akta_no: number | null
}

interface UploadedRecord {
  id: string
  nomor_kontrak: string
  nama_debitur: string
  merk: string
  type: string
  nilai_penjaminan: number
  tgl_awal_perjanjian: string
  status: {
    id: string
    nama: string
  }
  created_at: string
  notaris_id?: string
  no_akta?: number
}

interface NotaryAssignment {
  notaryId: string
  quantity: number
  startAktaNo: number
}

interface ReviewTabProps {
  uploadedRecords: UploadedRecord[]
  notaries: Notary[]
  loading: boolean
  onRefresh: () => void
  onAssignNotary: (recordId: string, notaryId: string) => void
  onBulkAssign: (assignments: NotaryAssignment[]) => Promise<void>
}

export default function ReviewTab({
  uploadedRecords,
  notaries,
  loading,
  onRefresh,
  onBulkAssign,
}: ReviewTabProps) {
  const [notaryAssignments, setNotaryAssignments] = useState<NotaryAssignment[]>([])
  const [assigning, setAssigning] = useState(false)

  const unassignedRecords = uploadedRecords.filter(r => !r.status.nama || r.status.nama !== "Assigned")
  const totalAssigned = notaryAssignments.reduce((sum, na) => sum + na.quantity, 0)

  const addNotaryAssignment = () => {
    setNotaryAssignments([...notaryAssignments, { notaryId: '', quantity: 0, startAktaNo: 1 }])
  }

  const removeNotaryAssignment = (index: number) => {
    setNotaryAssignments(notaryAssignments.filter((_, i) => i !== index))
  }

  const updateNotaryAssignment = (index: number, field: 'notaryId' | 'quantity' | 'startAktaNo', value: string | number) => {
    const updated = [...notaryAssignments]
    
    if (field === 'notaryId' && value) {
      // When notary is selected, auto-set startAktaNo to last_akta_no + 1
      const selectedNotary = notaries.find(n => n.id === value)
      if (selectedNotary) {
        updated[index] = { 
          ...updated[index], 
          notaryId: value as string,
          startAktaNo: (selectedNotary.last_akta_no || 0) + 1
        }
      } else {
        updated[index] = { ...updated[index], notaryId: value as string }
      }
    } else if (field === 'quantity') {
      updated[index] = { ...updated[index], quantity: value as number }
    } else if (field === 'startAktaNo') {
      updated[index] = { ...updated[index], startAktaNo: value as number }
    }
    
    setNotaryAssignments(updated)
  }

  const handleBulkAssign = async () => {
    // Validate
    if (notaryAssignments.length === 0) {
      alert('Please add at least one notary assignment')
      return
    }

    const hasEmptyNotary = notaryAssignments.some(na => !na.notaryId)
    if (hasEmptyNotary) {
      alert('Please select a notary for all assignments')
      return
    }

    const hasInvalidQuantity = notaryAssignments.some(na => na.quantity <= 0)
    if (hasInvalidQuantity) {
      alert('Please enter valid quantities (greater than 0)')
      return
    }

    if (totalAssigned > unassignedRecords.length) {
      alert(`Total assigned (${totalAssigned}) exceeds unassigned records (${unassignedRecords.length})`)
      return
    }

    if (totalAssigned < unassignedRecords.length) {
      alert(`Total assigned (${totalAssigned}) is less than unassigned records (${unassignedRecords.length})`)
      return
    }

    setAssigning(true)
    try {
      await onBulkAssign(notaryAssignments)
      setNotaryAssignments([]) // Clear assignments after success
    } catch (error) {
      console.error('Bulk assignment error:', error)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Batch Assignment Panel */}
      {unassignedRecords.length > 0 && (
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-blue-900 text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Batch Notary Assignment
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Assign notaries to unassigned records ({unassignedRecords.length} available)
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {notaryAssignments.map((assignment, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notary
                  </label>
                  <select
                    value={assignment.notaryId}
                    onChange={(e) => updateNotaryAssignment(index, 'notaryId', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select Notary</option>
                    {notaries.map((notary) => (
                      <option key={notary.id} value={notary.id}>
                        {notary.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Akta No
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={assignment.startAktaNo}
                    onChange={(e) => updateNotaryAssignment(index, 'startAktaNo', parseInt(e.target.value) || 1)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={!assignment.notaryId}
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={unassignedRecords.length}
                    value={assignment.quantity}
                    onChange={(e) => updateNotaryAssignment(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => removeNotaryAssignment(index)}
                  className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={addNotaryAssignment}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Notary
            </button>

            {notaryAssignments.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Total to assign: </span>
                  <span className={`font-semibold ${totalAssigned > unassignedRecords.length ? 'text-red-600' : 'text-blue-900'}`}>
                    {totalAssigned} / {unassignedRecords.length}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className="text-gray-600">Remaining: </span>
                  <span className="font-semibold text-blue-900">
                    {unassignedRecords.length - totalAssigned}
                  </span>
                </div>
                <button
                  onClick={handleBulkAssign}
                  disabled={assigning || totalAssigned === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {assigning ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Assign to Notaries
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">Uploaded Records</h3>
            <p className="text-sm text-gray-600">Review and assign notaries to uploaded fidusia data</p>
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
                <FileCheck className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading records...</p>
          </div>
        ) : uploadedRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">No uploaded records yet</p>
            <p className="text-sm text-gray-500">Upload a file to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Kontrak
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Debitur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tgl Perjanjian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploadedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {record.nomor_kontrak}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {record.nama_debitur}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {record.merk} {record.type}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {formatCurrency(record.nilai_penjaminan)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {record.tgl_awal_perjanjian}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.status.nama === "Assigned" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}
