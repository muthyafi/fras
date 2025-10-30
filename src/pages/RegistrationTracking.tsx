import { useState, useEffect } from 'react'
import { Activity, CheckCircle, Clock, XCircle, RefreshCw, Download, Eye, AlertTriangle, CreditCard, Copy, Layers } from 'lucide-react'
import type { RegistrationTracking } from '../types'
import { downloadVAList } from '../lib/api'

// Mock data - in production, this would come from Supabase with real-time subscriptions
const mockTrackingData: RegistrationTracking[] = [
  {
    id: '1',
    agreementId: 'agr-1',
    agreementNumber: 'FID-2025-001',
    clientName: 'AHMAD WIJAYA',
    institutionName: 'PT Mandiri Multifinance',
    branchName: 'Jakarta Thamrin',
    branchCode: 'JKT-02',
    assetDescription: 'TOYOTA AVANZA G (2024) - MHKM1BA3JLK123456/NR123456',
    loanAmount: 200000000,
    registrationNumber: 'W7.00123456',
    status: 'completed',
    isBulkSubmission: false,
    submittedAt: '2025-10-28T08:00:00Z',
    completedAt: '2025-10-28T10:30:00Z',
    ahuReferenceNumber: 'AHU-2025-12345',
    certificateNumber: 'W7.00123456',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808123456789012345',
    pnbpPaymentStatus: 'paid',
    pnbpPaymentDate: '2025-10-28T09:30:00Z',
    retryCount: 0,
    lastUpdated: '2025-10-28T10:30:00Z',
    logs: [
      { timestamp: '2025-10-28T08:00:00Z', status: 'queued', message: 'Registration queued for submission' },
      { timestamp: '2025-10-28T08:00:30Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-28T08:01:00Z', status: 'submitted', message: 'Successfully submitted to AHU', details: 'Reference: AHU-2025-12345 | KTP: 3174012005850001' },
      { timestamp: '2025-10-28T08:02:00Z', status: 'waiting_payment', message: 'PNBP payment required', details: 'Amount: Rp 50,000' },
      { timestamp: '2025-10-28T09:30:00Z', status: 'payment_verified', message: 'PNBP payment verified' },
      { timestamp: '2025-10-28T09:35:00Z', status: 'processing', message: 'AHU is processing the registration' },
      { timestamp: '2025-10-28T10:30:00Z', status: 'completed', message: 'Certificate issued', details: 'Certificate: W7.00123456' },
    ],
  },
  {
    id: '2',
    agreementId: 'agr-2',
    agreementNumber: 'FID-2025-002',
    clientName: 'SITI AMINAH',
    institutionName: 'PT BCA Finance',
    branchName: 'Surabaya Tunjungan',
    branchCode: 'SBY-01',
    assetDescription: 'HONDA CIVIC RS (2023) - MHKM2BA4KLJ789012/NR789012',
    loanAmount: 180000000,
    status: 'waiting_payment',
    submittedAt: '2025-10-28T09:15:00Z',
    ahuReferenceNumber: 'AHU-2025-12346',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808987654321098765',
    pnbpPaymentStatus: 'unpaid',
    pnbpExpiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    retryCount: 0,
    lastUpdated: '2025-10-28T09:20:00Z',
    logs: [
      { timestamp: '2025-10-28T09:15:00Z', status: 'queued', message: 'Registration queued for submission' },
      { timestamp: '2025-10-28T09:15:30Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-28T09:16:00Z', status: 'submitted', message: 'Successfully submitted to AHU', details: 'Reference: AHU-2025-12346 | KTP: 3174015508870001' },
      { timestamp: '2025-10-28T09:20:00Z', status: 'waiting_payment', message: 'PNBP payment required', details: 'VA Number: 8808987654321098765 | Rp 50,000' },
    ],
  },
  {
    id: '3',
    agreementId: 'agr-3',
    agreementNumber: 'FID-2025-003',
    clientName: 'Robert Johnson',
    institutionName: 'PT Adira Finance',
    assetDescription: 'Motor Yamaha NMAX 2023',
    loanAmount: 20000000,
    status: 'failed',
    submittedAt: '2025-10-28T10:00:00Z',
    errorMessage: 'Invalid debtor ID number format',
    retryCount: 2,
    lastUpdated: '2025-10-28T10:05:00Z',
    logs: [
      { timestamp: '2025-10-28T10:00:00Z', status: 'queued', message: 'Registration queued for submission' },
      { timestamp: '2025-10-28T10:00:30Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-28T10:01:00Z', status: 'failed', message: 'Submission failed', details: 'Invalid debtor ID number format' },
      { timestamp: '2025-10-28T10:03:00Z', status: 'submitting', message: 'Retry attempt 1' },
      { timestamp: '2025-10-28T10:03:30Z', status: 'failed', message: 'Submission failed', details: 'Invalid debtor ID number format' },
      { timestamp: '2025-10-28T10:05:00Z', status: 'submitting', message: 'Retry attempt 2' },
      { timestamp: '2025-10-28T10:05:30Z', status: 'failed', message: 'Submission failed', details: 'Invalid debtor ID number format' },
    ],
  },
  {
    id: '4',
    agreementId: 'agr-4',
    agreementNumber: 'FID-2025-004',
    clientName: 'Sarah Williams',
    institutionName: 'PT Maybank Finance',
    assetDescription: 'Motor Honda PCX 2023',
    loanAmount: 30000000,
    status: 'processing',
    submittedAt: '2025-10-28T10:45:00Z',
    ahuReferenceNumber: 'AHU-2025-12347',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808555666777888999',
    pnbpPaymentStatus: 'paid',
    pnbpPaymentDate: '2025-10-28T11:00:00Z',
    retryCount: 0,
    lastUpdated: '2025-10-28T11:15:00Z',
    logs: [
      { timestamp: '2025-10-28T10:45:00Z', status: 'queued', message: 'Registration queued for submission' },
      { timestamp: '2025-10-28T10:45:30Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-28T10:46:00Z', status: 'submitted', message: 'Successfully submitted to AHU' },
      { timestamp: '2025-10-28T10:46:30Z', status: 'waiting_payment', message: 'PNBP payment required' },
      { timestamp: '2025-10-28T11:00:00Z', status: 'payment_verified', message: 'PNBP payment verified' },
      { timestamp: '2025-10-28T11:15:00Z', status: 'processing', message: 'AHU is processing the registration' },
    ],
  },
  // Bulk submission batch 1
  {
    id: '5',
    agreementId: 'agr-5',
    agreementNumber: 'FID-2025-005',
    clientName: 'Michael Chen',
    institutionName: 'PT BCA Finance',
    assetDescription: 'Motor Yamaha Aerox 2023',
    loanAmount: 18000000,
    status: 'completed',
    isBulkSubmission: true,
    batchId: 'BATCH-2025-001',
    batchName: 'October Batch #1',
    submittedAt: '2025-10-29T08:00:00Z',
    completedAt: '2025-10-29T10:30:00Z',
    ahuReferenceNumber: 'AHU-2025-12350',
    certificateNumber: 'W7.00123460',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808111222333444555',
    pnbpPaymentStatus: 'paid',
    pnbpPaymentDate: '2025-10-29T09:00:00Z',
    retryCount: 0,
    lastUpdated: '2025-10-29T10:30:00Z',
    logs: [
      { timestamp: '2025-10-29T08:00:00Z', status: 'queued', message: 'Bulk submission queued' },
      { timestamp: '2025-10-29T08:01:00Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-29T08:02:00Z', status: 'submitted', message: 'Successfully submitted to AHU' },
      { timestamp: '2025-10-29T08:03:00Z', status: 'waiting_payment', message: 'PNBP payment required' },
      { timestamp: '2025-10-29T09:00:00Z', status: 'payment_verified', message: 'PNBP payment verified' },
      { timestamp: '2025-10-29T09:05:00Z', status: 'processing', message: 'AHU is processing' },
      { timestamp: '2025-10-29T10:30:00Z', status: 'completed', message: 'Certificate issued' },
    ],
  },
  {
    id: '6',
    agreementId: 'agr-6',
    agreementNumber: 'FID-2025-006',
    clientName: 'Lisa Anderson',
    institutionName: 'PT BCA Finance',
    assetDescription: 'Mobil Honda HR-V 2022',
    loanAmount: 200000000,
    status: 'waiting_payment',
    isBulkSubmission: true,
    batchId: 'BATCH-2025-001',
    batchName: 'October Batch #1',
    submittedAt: '2025-10-29T08:00:00Z',
    ahuReferenceNumber: 'AHU-2025-12351',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808222333444555666',
    pnbpPaymentStatus: 'unpaid',
    pnbpExpiredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    retryCount: 0,
    lastUpdated: '2025-10-29T08:03:00Z',
    logs: [
      { timestamp: '2025-10-29T08:00:00Z', status: 'queued', message: 'Bulk submission queued' },
      { timestamp: '2025-10-29T08:01:00Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-29T08:02:00Z', status: 'submitted', message: 'Successfully submitted to AHU' },
      { timestamp: '2025-10-29T08:03:00Z', status: 'waiting_payment', message: 'PNBP payment required' },
    ],
  },
  {
    id: '7',
    agreementId: 'agr-7',
    agreementNumber: 'FID-2025-007',
    clientName: 'David Martinez',
    institutionName: 'PT BCA Finance',
    assetDescription: 'Motor Suzuki GSX-R150 2023',
    loanAmount: 25000000,
    status: 'processing',
    isBulkSubmission: true,
    batchId: 'BATCH-2025-001',
    batchName: 'October Batch #1',
    submittedAt: '2025-10-29T08:00:00Z',
    ahuReferenceNumber: 'AHU-2025-12352',
    pnbpAmount: 50000,
    pnbpVaNumber: '8808333444555666777',
    pnbpPaymentStatus: 'paid',
    pnbpPaymentDate: '2025-10-29T09:15:00Z',
    retryCount: 0,
    lastUpdated: '2025-10-29T09:30:00Z',
    logs: [
      { timestamp: '2025-10-29T08:00:00Z', status: 'queued', message: 'Bulk submission queued' },
      { timestamp: '2025-10-29T08:01:00Z', status: 'submitting', message: 'Submitting to AHU portal' },
      { timestamp: '2025-10-29T08:02:00Z', status: 'submitted', message: 'Successfully submitted to AHU' },
      { timestamp: '2025-10-29T08:03:00Z', status: 'waiting_payment', message: 'PNBP payment required' },
      { timestamp: '2025-10-29T09:15:00Z', status: 'payment_verified', message: 'PNBP payment verified' },
      { timestamp: '2025-10-29T09:30:00Z', status: 'processing', message: 'AHU is processing' },
    ],
  },
]

const statusConfig: Record<RegistrationTracking['status'], { color: string; icon: any; label: string }> = {
  queued: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Queued' },
  submitting: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw, label: 'Submitting' },
  submitted: { color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle, label: 'Submitted' },
  waiting_payment: { color: 'bg-orange-100 text-orange-700', icon: CreditCard, label: 'Waiting Payment' },
  payment_verified: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle, label: 'Payment Verified' },
  processing: { color: 'bg-yellow-100 text-yellow-700', icon: Activity, label: 'Processing' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
}

export default function RegistrationTracking() {
  const [tracking, setTracking] = useState<RegistrationTracking[]>(mockTrackingData)
  const [selectedTracking, setSelectedTracking] = useState<RegistrationTracking | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [, setCopiedVA] = useState<string | null>(null)
  const [batchFilter, setBatchFilter] = useState<string>('all')

  // Get unique batches
  const batches = Array.from(
    new Set(
      tracking
        .filter(t => t.batchId)
        .map(t => JSON.stringify({ id: t.batchId, name: t.batchName }))
    )
  ).map(b => JSON.parse(b))

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // In production, this would use Supabase real-time subscriptions
      setTracking((prev) =>
        prev.map((item) => {
          if (item.status === 'processing' && Math.random() > 0.7) {
            return {
              ...item,
              status: 'completed',
              completedAt: new Date().toISOString(),
              certificateNumber: `W7.00${Math.floor(Math.random() * 1000000)}`,
              lastUpdated: new Date().toISOString(),
            }
          }
          return item
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Apply batch filter
  const filteredTracking = batchFilter === 'all' 
    ? tracking 
    : batchFilter === 'individual'
    ? tracking.filter(t => !t.isBulkSubmission)
    : tracking.filter(t => t.batchId === batchFilter)

  const stats = {
    total: filteredTracking.length,
    completed: filteredTracking.filter((t) => t.status === 'completed').length,
    processing: filteredTracking.filter((t) => t.status === 'processing' || t.status === 'submitting' || t.status === 'submitted').length,
    failed: filteredTracking.filter((t) => t.status === 'failed').length,
    bulkSubmissions: tracking.filter((t) => t.isBulkSubmission).length,
    individualSubmissions: tracking.filter((t) => !t.isBulkSubmission).length,
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (start?: string, end?: string) => {
    if (!start) return '-'
    if (!end) {
      const duration = Date.now() - new Date(start).getTime()
      const minutes = Math.floor(duration / 60000)
      return `${minutes} min (in progress)`
    }
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(duration / 60000)
    return `${minutes} min`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor real-time AHU submission process and status</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => window.location.reload()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-900">Submission Status Tracking</h3>
            <p className="text-sm text-purple-800 mt-1">
              This page shows the <strong>real-time submission process</strong>. 
              Agreements appear here when submitted (status: <strong>queued</strong>), then progress through: 
              submitting → submitted → waiting_payment → payment_verified → processing → <strong>completed</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Submissions</span>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Completed</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Processing</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Failed</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
        </div>
      </div>

      {/* Batch Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Batch:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Submissions ({tracking.length})</option>
              <option value="individual">Individual Submissions ({stats.individualSubmissions})</option>
              {batches.map((batch) => {
                const count = tracking.filter(t => t.batchId === batch.id).length
                return (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({count} items)
                  </option>
                )
              })}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredTracking.length}</span> {filteredTracking.length === 1 ? 'submission' : 'submissions'}
          </div>
        </div>
      </div>

      {/* Tracking Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Registration Tracking</h2>
          {tracking.some(t => t.pnbpVaNumber) && (
            <button
              onClick={() => {
                const vaList = tracking
                  .filter(t => t.pnbpVaNumber)
                  .map(t => ({
                    agreementNumber: t.agreementNumber,
                    clientName: t.clientName,
                    pnbpAmount: t.pnbpAmount || 0,
                    pnbpVaNumber: t.pnbpVaNumber!,
                    pnbpExpiredDate: t.pnbpExpiredDate || new Date().toISOString(),
                  }))
                downloadVAList(vaList, 'All_Registrations_VA_List')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download All VA Numbers
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agreement No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PNBP VA Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTracking.map((item) => {
                const StatusIcon = statusConfig[item.status].icon
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.agreementNumber}</div>
                      <div className="text-xs text-gray-500">
                        {item.clientName}
                        {item.branchName && (
                          <span className="ml-1">• {item.branchCode}</span>
                        )}
                      </div>
                      {/* Show asset description for context */}
                      {item.assetDescription && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                          {item.assetDescription}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isBulkSubmission ? (
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                            {item.batchName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Individual</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          statusConfig[item.status].color
                        }`}
                      >
                        <StatusIcon className={`w-3 h-3 ${item.status === 'submitting' ? 'animate-spin' : ''}`} />
                        {statusConfig[item.status].label}
                      </span>
                      {item.retryCount > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Retry: {item.retryCount})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.pnbpVaNumber ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {item.pnbpVaNumber}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.pnbpVaNumber!)
                              setCopiedVA(item.id)
                              setTimeout(() => setCopiedVA(null), 2000)
                            }}
                            className="text-gray-600 hover:text-gray-800"
                            title="Copy VA Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {item.pnbpPaymentStatus === 'unpaid' && (
                            <span className="text-xs text-orange-600 font-medium">
                              Rp {item.pnbpAmount?.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.certificateNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{item.certificateNumber}</span>
                          <button className="text-blue-600 hover:text-blue-800" title="Download Certificate">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateDuration(item.submittedAt, item.completedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedTracking(item)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredTracking.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions found for this filter</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registration Details - {selectedTracking.agreementNumber}
                </h3>
                <button
                  onClick={() => setSelectedTracking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Batch Info */}
              {selectedTracking.isBulkSubmission && (
                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-semibold text-purple-900">Bulk Submission</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-purple-700">Batch Name</p>
                      <p className="text-sm font-medium text-purple-900">{selectedTracking.batchName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700">Batch ID</p>
                      <p className="text-sm font-mono text-purple-900">{selectedTracking.batchId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Status</h4>
                <div className="flex items-center gap-3">
                  {(() => {
                    const StatusIcon = statusConfig[selectedTracking.status].icon
                    return (
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                          statusConfig[selectedTracking.status].color
                        }`}
                      >
                        <StatusIcon className={`w-4 h-4 ${selectedTracking.status === 'submitting' ? 'animate-spin' : ''}`} />
                        {statusConfig[selectedTracking.status].label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Info */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">AHU Reference</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTracking.ahuReferenceNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Certificate Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTracking.certificateNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedTracking.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed At</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedTracking.completedAt)}</p>
                </div>
              </div>

              {/* Error Message */}
              {selectedTracking.errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Error Message</p>
                      <p className="text-sm text-red-700 mt-1">{selectedTracking.errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Log */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Log</h4>
                <div className="space-y-3">
                  {(selectedTracking.logs || selectedTracking.activityLogs || []).map((log, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'completed' ? 'bg-green-500' :
                          log.status === 'failed' ? 'bg-red-500' :
                          log.status === 'processing' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        {index < (selectedTracking.logs || selectedTracking.activityLogs || []).length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-1 flex-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                        <p className="text-sm font-medium text-gray-900">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                {selectedTracking.status === 'failed' && (
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry Submission
                  </button>
                )}
                {selectedTracking.certificateNumber && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                )}
                <button
                  onClick={() => setSelectedTracking(null)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
