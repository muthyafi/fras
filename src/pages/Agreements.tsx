import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock,
  Download, Building2, TrendingUp, AlertCircle, ExternalLink, X
} from 'lucide-react'
import type { FidusiaAgreement } from '../types'
import { useRole, usePermissions, useAllowedBranches } from '../contexts/RoleContext'

// Mock data - in production, this would come from Supabase
const mockAgreements: FidusiaAgreement[] = [
  {
    id: '1',
    agreementNumber: 'FID-2025-001',
    clientId: '1',
    clientName: 'PT Maju Jaya',
    institutionId: '1',
    institutionName: 'BCA Finance',
    branchId: 'br-1',
    branchName: 'Jakarta Sudirman',
    branchCode: 'JKT-01',
    assetDescription: 'Toyota Avanza 2024',
    assetType: 'vehicle',
    assetValue: 250000000,
    loanAmount: 200000000,
    registrationNumber: 'AHU-001234',
    registrationDate: '2025-01-15',
    expiryDate: '2027-01-15',
    status: 'active',
    pnbpPaymentStatus: 'paid',
    certificateNumber: 'W7.00123456',
    // Indonesian AHU fields
    debtorName: 'AHMAD WIJAYA',
    debtorKtp: '3174012005850001',
    debtorPhone: '081234567890',
    debtorCity: 'Jakarta Selatan',
    vehicleBrand: 'TOYOTA',
    vehicleType: 'AVANZA',
    vehicleModel: 'G',
    vehicleYear: '2024',
    chassisNumber: 'MHKM1BA3JLK123456',
    engineNumber: 'NR123456',
    contractNumber: 'FID-2025-001234',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    agreementNumber: 'FID-2025-002',
    clientId: '2',
    clientName: 'CV Berkah Mandiri',
    institutionId: '2',
    institutionName: 'Adira Finance',
    branchId: 'br-5',
    branchName: 'Bandung Dago',
    branchCode: 'BDG-01',
    assetDescription: 'Excavator Komatsu PC200',
    assetType: 'machinery',
    assetValue: 850000000,
    loanAmount: 680000000,
    status: 'pending',
    debtorName: 'BUDI SANTOSO',
    debtorKtp: '3273021012900001',
    debtorPhone: '081298765432',
    debtorCity: 'Bandung',
    createdAt: '2025-01-20T14:30:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: '3',
    agreementNumber: 'FID-2025-003',
    clientId: '3',
    clientName: 'Toko Sejahtera',
    institutionId: '1',
    institutionName: 'BCA Finance',
    branchId: 'br-2',
    branchName: 'Bandung Pasteur',
    branchCode: 'BDG-02',
    assetDescription: 'Honda Vario 160 2024',
    assetType: 'vehicle',
    assetValue: 25000000,
    loanAmount: 20000000,
    status: 'submitted',
    submissionStatus: 'submitted',
    pnbpPaymentStatus: 'unpaid',
    createdAt: '2025-10-25T08:00:00Z',
    updatedAt: '2025-10-27T10:00:00Z',
  },
  {
    id: '4',
    agreementNumber: 'FID-2025-004',
    clientId: '4',
    clientName: 'UD Sentosa',
    institutionId: '2',
    institutionName: 'Adira Finance',
    branchId: 'br-5',
    branchName: 'Bandung Dago',
    branchCode: 'BDG-01',
    assetDescription: 'Mesin Produksi Tekstil',
    assetType: 'machinery',
    assetValue: 500000000,
    loanAmount: 400000000,
    status: 'draft',
    createdAt: '2025-10-28T09:00:00Z',
    updatedAt: '2025-10-28T09:00:00Z',
  },
  {
    id: '5',
    agreementNumber: 'FID-2024-158',
    clientId: '5',
    clientName: 'PT Sejahtera Abadi',
    institutionId: '1',
    institutionName: 'BCA Finance',
    branchId: 'br-3',
    branchName: 'Surabaya Tunjungan',
    branchCode: 'SBY-01',
    assetDescription: 'Mitsubishi L300 2023',
    assetType: 'vehicle',
    assetValue: 180000000,
    loanAmount: 150000000,
    registrationNumber: 'AHU-024158',
    registrationDate: '2024-06-15',
    expiryDate: '2026-06-15',
    status: 'active',
    pnbpPaymentStatus: 'paid',
    certificateNumber: 'W7.00024158',
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-06-15T14:00:00Z',
  },
  {
    id: '6',
    agreementNumber: 'FID-2024-089',
    clientId: '6',
    clientName: 'CV Mitra Usaha',
    institutionId: '3',
    institutionName: 'Mandiri Finance',
    branchId: 'br-8',
    branchName: 'Jakarta Gatot Subroto',
    branchCode: 'JKT-03',
    assetDescription: 'Piutang Usaha',
    assetType: 'receivables',
    assetValue: 1200000000,
    loanAmount: 1000000000,
    registrationNumber: 'AHU-024089',
    registrationDate: '2024-03-10',
    expiryDate: '2024-09-10',
    status: 'expired',
    pnbpPaymentStatus: 'paid',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-09-10T00:00:00Z',
  },
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  registered: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  rejected: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-700',
}

const statusIcons = {
  draft: Clock,
  pending: Clock,
  submitted: FileText,
  processing: Clock,
  registered: CheckCircle,
  active: CheckCircle,
  expired: XCircle,
  rejected: XCircle,
  cancelled: XCircle,
}

export default function Agreements() {
  // Role-based access control
  const { user } = useRole()
  const permissions = usePermissions()
  const allowedBranches = useAllowedBranches()
  
  const [agreements, setAgreements] = useState<FidusiaAgreement[]>(mockAgreements)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all')
  const [institutionFilter, setInstitutionFilter] = useState<string>('all')
  const [branchFilter, setBranchFilter] = useState<string>('all')
  const [selectedAgreement, setSelectedAgreement] = useState<FidusiaAgreement | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingAgreement, setEditingAgreement] = useState<FidusiaAgreement | null>(null)
  const [deletingAgreement, setDeletingAgreement] = useState<FidusiaAgreement | null>(null)

  // Auto-apply branch filter for branch users
  useEffect(() => {
    if (allowedBranches && allowedBranches.length === 1) {
      setBranchFilter(allowedBranches[0])
    }
  }, [allowedBranches])

  const filteredAgreements = agreements.filter((agreement) => {
    // First apply branch-level access control
    if (allowedBranches !== null && allowedBranches.length > 0) {
      if (!agreement.branchCode || !allowedBranches.includes(agreement.branchCode)) {
        return false
      }
    }
    
    // Then apply user filters
    const matchesSearch =
      agreement.agreementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.assetDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = branchFilter === 'all' || agreement.branchCode === branchFilter
    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter
    const matchesAssetType = assetTypeFilter === 'all' || agreement.assetType === assetTypeFilter
    const matchesInstitution = institutionFilter === 'all' || agreement.institutionName === institutionFilter
    return matchesSearch && matchesBranch && matchesStatus && matchesAssetType && matchesInstitution
  })

  // Get unique institutions and branches for filter
  const institutions = Array.from(new Set(agreements.map(a => a.institutionName).filter(Boolean)))
  const branches = Array.from(new Set(agreements.map(a => a.branchCode).filter(Boolean))).sort()

  // Calculate stats
  const stats = {
    total: agreements.length,
    active: agreements.filter(a => a.status === 'active').length,
    pending: agreements.filter(a => a.status === 'pending' || a.status === 'draft' || a.status === 'submitted').length,
    expired: agreements.filter(a => a.status === 'expired').length,
    totalValue: agreements.reduce((sum, a) => sum + a.loanAmount, 0),
    totalAssetValue: agreements.reduce((sum, a) => sum + a.assetValue, 0),
  }

  const downloadCSV = () => {
    const headers = [
      'Agreement Number',
      'Client',
      'Institution',
      'Asset Description',
      'Asset Type',
      'Asset Value',
      'Loan Amount',
      'Status',
      'Registration Number',
      'Certificate Number',
      'Registration Date',
      'Expiry Date',
      'Created Date'
    ]

    const rows = filteredAgreements.map(a => [
      a.agreementNumber,
      a.clientName || '',
      a.institutionName || '',
      a.assetDescription,
      a.assetType,
      a.assetValue,
      a.loanAmount,
      a.status,
      a.registrationNumber || '',
      a.certificateNumber || '',
      a.registrationDate || '',
      a.expiryDate || '',
      a.createdAt
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fidusia_agreements_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // CRUD Operations
  const handleCreateAgreement = (formData: Partial<FidusiaAgreement>) => {
    const newAgreement: FidusiaAgreement = {
      id: `${agreements.length + 1}`,
      agreementNumber: `FID-${formData.branchCode}-2025-${String(agreements.length + 1).padStart(3, '0')}`,
      clientId: formData.clientId || '',
      clientName: formData.clientName || '',
      institutionId: formData.institutionId || '',
      institutionName: formData.institutionName || '',
      branchId: formData.branchId || '',
      branchName: formData.branchName || '',
      branchCode: formData.branchCode || '',
      assetDescription: formData.assetDescription || '',
      assetType: formData.assetType || 'vehicle',
      assetValue: formData.assetValue || 0,
      loanAmount: formData.loanAmount || 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAgreements([...agreements, newAgreement])
    setShowCreateModal(false)
  }

  const handleEditAgreement = (formData: Partial<FidusiaAgreement>) => {
    if (!editingAgreement) return
    const updatedAgreements = agreements.map(a =>
      a.id === editingAgreement.id
        ? { ...a, ...formData, updatedAt: new Date().toISOString() }
        : a
    )
    setAgreements(updatedAgreements)
    setShowEditModal(false)
    setEditingAgreement(null)
  }

  const handleDeleteAgreement = () => {
    if (!deletingAgreement) return
    setAgreements(agreements.filter(a => a.id !== deletingAgreement.id))
    setShowDeleteModal(false)
    setDeletingAgreement(null)
  }

  const openEditModal = (agreement: FidusiaAgreement) => {
    // Check permissions
    if (!permissions.canEditAnyAgreement) {
      // Branch users can only edit their own branch
      if (user?.branchCode && agreement.branchCode !== user.branchCode) {
        alert('You do not have permission to edit this agreement')
        return
      }
    }
    setEditingAgreement(agreement)
    setShowEditModal(true)
  }

  const openDeleteModal = (agreement: FidusiaAgreement) => {
    // Check permissions
    if (!permissions.canDeleteAnyAgreement) {
      // Branch users can only delete their own branch
      if (user?.branchCode && agreement.branchCode !== user.branchCode) {
        alert('You do not have permission to delete this agreement')
        return
      }
    }
    setDeletingAgreement(agreement)
    setShowDeleteModal(true)
  }

  // Helper function to check if user can edit/delete an agreement
  const canModifyAgreement = (agreement: FidusiaAgreement) => {
    if (permissions.canEditAnyAgreement) return true
    if (user?.branchCode && agreement.branchCode === user.branchCode) return true
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fidusia Agreements</h1>
          <p className="text-gray-600 mt-1">Manage and track all fidusia registrations across your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Agreement
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">Agreement Status Explained</h3>
            <p className="text-sm text-blue-800 mt-1">
              This page shows the <strong>lifecycle status</strong> of each agreement. 
              When status is <strong>"submitted"</strong>, it appears in Tracking page with status <strong>"queued"</strong>. 
              When <strong>"processing"</strong>, check Tracking for real-time progress (payment → processing → completed).
            </p>
          </div>
        </div>
      </div>

      {/* Branch Filter Indicator */}
      {branchFilter !== 'all' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-semibold text-purple-900">Branch Filter Active</h3>
                <p className="text-sm text-purple-800 mt-1">
                  Showing agreements for: <strong>{branchFilter}</strong>
                  {(() => {
                    const branchNames: Record<string, string> = {
                      'JKT-01': 'Jakarta Sudirman',
                      'BDG-01': 'Bandung Dago',
                      'SBY-01': 'Surabaya Tunjungan',
                      'JKT-02': 'Jakarta Thamrin',
                      'MDN-01': 'Medan Gatot Subroto',
                    }
                    return branchNames[branchFilter] ? ` - ${branchNames[branchFilter]}` : ''
                  })()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setBranchFilter('all')}
              className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Agreements</span>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-1">Currently enforced</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting registration</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Portfolio Value</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.totalValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total loan amount</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-3">
            <Building2 className="w-10 h-10 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Asset Value</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalAssetValue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">LTV Ratio</p>
              <p className="text-xl font-bold text-gray-900">
                {((stats.totalValue / stats.totalAssetValue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Expired / Rejected</p>
              <p className="text-xl font-bold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Search & Filter</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by agreement #, client name, asset description, or registration #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${permissions.canViewAllBranches ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 pt-4 border-t border-gray-200`}>
              {/* Branch Filter - Only for Super Admin */}
              {permissions.canViewAllBranches && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Branches</option>
                    {branches.map(branch => {
                      const branchNames: Record<string, string> = {
                        'JKT-01': 'Jakarta Sudirman',
                        'BDG-01': 'Bandung Dago',
                        'SBY-01': 'Surabaya Tunjungan',
                        'JKT-02': 'Jakarta Thamrin',
                        'MDN-01': 'Medan Gatot Subroto',
                      }
                      const branchName = branch ? branchNames[branch] || branch : branch
                      return (
                        <option key={branch} value={branch}>
                          {branch} - {branchName}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="registered">Registered</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Asset Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="machinery">Machinery</option>
                  <option value="inventory">Inventory</option>
                  <option value="receivables">Receivables</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Institution Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing <span className="font-medium text-gray-900">{filteredAgreements.length}</span> of{' '}
              <span className="font-medium text-gray-900">{agreements.length}</span> agreements
            </span>
            {(searchTerm || statusFilter !== 'all' || assetTypeFilter !== 'all' || institutionFilter !== 'all' || branchFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setAssetTypeFilter('all')
                  setInstitutionFilter('all')
                  if (permissions.canViewAllBranches) {
                    setBranchFilter('all')
                  }
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agreements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agreement No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agreement Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgreements.map((agreement) => {
                const StatusIcon = statusIcons[agreement.status]
                return (
                  <tr key={agreement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{agreement.agreementNumber}</div>
                      {agreement.registrationNumber && (
                        <div className="text-xs text-gray-500">{agreement.registrationNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agreement.clientName}</div>
                      {/* Show debtor KTP if available */}
                      {agreement.debtorKtp && (
                        <div className="text-xs text-gray-500 font-mono">KTP: {agreement.debtorKtp}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {agreement.institutionName}
                        {agreement.branchName && (
                          <span className="ml-1">• {agreement.branchName}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{agreement.assetDescription}</div>
                      <div className="text-xs text-gray-500 capitalize">{agreement.assetType}</div>
                      {/* Show vehicle details for vehicle type */}
                      {agreement.assetType === 'vehicle' && (agreement.chassisNumber || agreement.engineNumber) && (
                        <div className="mt-1 space-y-0.5">
                          {agreement.chassisNumber && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Chassis:</span> {agreement.chassisNumber}
                            </div>
                          )}
                          {agreement.engineNumber && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Engine:</span> {agreement.engineNumber}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(agreement.loanAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        of {formatCurrency(agreement.assetValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agreement.certificateNumber ? (
                        <div className="text-sm text-gray-900 font-mono">{agreement.certificateNumber}</div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not registered</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[agreement.status]
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(agreement.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {agreement.registrationNumber && (
                          <Link
                            to="/tracking"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                            title="Track registration status"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Track
                          </Link>
                        )}
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1" 
                          title="View Details"
                          onClick={() => setSelectedAgreement(agreement)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {agreement.status === 'draft' && canModifyAgreement(agreement) && (
                          <>
                            <button 
                              className="text-gray-600 hover:text-gray-800 p-1" 
                              title="Edit"
                              onClick={() => openEditModal(agreement)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 p-1" 
                              title="Delete"
                              onClick={() => openDeleteModal(agreement)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredAgreements.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agreements found</p>
          </div>
        )}
      </div>

      {/* Agreement Detail Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Agreement Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedAgreement.agreementNumber}</p>
              </div>
              <button
                onClick={() => setSelectedAgreement(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    statusColors[selectedAgreement.status]
                  }`}
                >
                  {(() => {
                    const StatusIcon = statusIcons[selectedAgreement.status]
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  {selectedAgreement.status.charAt(0).toUpperCase() + selectedAgreement.status.slice(1)}
                </span>
                {selectedAgreement.registrationNumber && (
                  <Link
                    to="/tracking"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Track Registration
                  </Link>
                )}
              </div>

              {/* Client & Institution Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client & Institution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client Name</p>
                    <p className="text-base font-medium text-gray-900">{selectedAgreement.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Institution</p>
                    <p className="text-base font-medium text-gray-900">{selectedAgreement.institutionName}</p>
                  </div>
                  {selectedAgreement.branchName && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Branch</p>
                        <p className="text-base font-medium text-gray-900">{selectedAgreement.branchName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Branch Code</p>
                        <p className="text-base font-mono text-gray-900">{selectedAgreement.branchCode}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Asset Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Asset Type</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{selectedAgreement.assetType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Asset Value</p>
                    <p className="text-base font-medium text-gray-900">{formatCurrency(selectedAgreement.assetValue)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-base font-medium text-gray-900">{selectedAgreement.assetDescription}</p>
                  </div>
                </div>
              </div>

              {/* Loan Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="text-base font-medium text-gray-900">{formatCurrency(selectedAgreement.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LTV Ratio</p>
                    <p className="text-base font-medium text-gray-900">
                      {((selectedAgreement.loanAmount / selectedAgreement.assetValue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(selectedAgreement.registrationDate)}</p>
                  </div>
                  {selectedAgreement.registrationNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="text-base font-medium text-gray-900 font-mono">{selectedAgreement.registrationNumber}</p>
                    </div>
                  )}
                  {selectedAgreement.certificateNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Certificate Number</p>
                      <p className="text-base font-medium text-gray-900 font-mono">{selectedAgreement.certificateNumber}</p>
                    </div>
                  )}
                  {selectedAgreement.certificateDate && (
                    <div>
                      <p className="text-sm text-gray-500">Certificate Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(selectedAgreement.certificateDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PNBP Payment Information */}
              {selectedAgreement.pnbpVaNumber && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">PNBP Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">VA Number</p>
                      <p className="text-base font-medium text-gray-900 font-mono">{selectedAgreement.pnbpVaNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-base font-medium text-gray-900">{formatCurrency(selectedAgreement.pnbpAmount || 0)}</p>
                    </div>
                    {selectedAgreement.pnbpExpiredDate && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Deadline</p>
                        <p className="text-base font-medium text-gray-900">{formatDate(selectedAgreement.pnbpExpiredDate)}</p>
                      </div>
                    )}
                    {selectedAgreement.pnbpPaidDate && (
                      <div>
                        <p className="text-sm text-gray-500">Paid Date</p>
                        <p className="text-base font-medium text-green-700">{formatDate(selectedAgreement.pnbpPaidDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                {selectedAgreement.status === 'draft' && (
                  <>
                    <button 
                      className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                      onClick={() => {
                        openEditModal(selectedAgreement)
                        setSelectedAgreement(null)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                      onClick={() => {
                        openDeleteModal(selectedAgreement)
                        setSelectedAgreement(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <AgreementFormModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false)
            setShowEditModal(false)
            setEditingAgreement(null)
          }}
          onSubmit={showCreateModal ? handleCreateAgreement : handleEditAgreement}
          initialData={editingAgreement || undefined}
          mode={showCreateModal ? 'create' : 'edit'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingAgreement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Agreement</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-900 mb-2">
                Are you sure you want to delete this agreement?
              </p>
              <div className="text-sm space-y-1">
                <p className="font-medium text-gray-900">{deletingAgreement.agreementNumber}</p>
                <p className="text-gray-700">{deletingAgreement.clientName}</p>
                <p className="text-gray-600">{deletingAgreement.assetDescription}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingAgreement(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgreement}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Agreement Form Modal Component
function AgreementFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<FidusiaAgreement>) => void
  initialData?: FidusiaAgreement
  mode: 'create' | 'edit'
}) {
  const [formData, setFormData] = useState<Partial<FidusiaAgreement>>(initialData || {
    clientName: '',
    institutionName: 'PT Adira Finance',
    branchName: 'Jakarta Sudirman',
    branchCode: 'JKT-01',
    assetDescription: '',
    assetType: 'vehicle',
    assetValue: 0,
    loanAmount: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Create New Agreement' : 'Edit Agreement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Branch Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <select
                  value={formData.branchCode}
                  onChange={(e) => {
                    const branchMap: Record<string, string> = {
                      'JKT-01': 'Jakarta Sudirman',
                      'BDG-01': 'Bandung Dago',
                      'SBY-01': 'Surabaya Tunjungan',
                      'JKT-02': 'Jakarta Thamrin',
                      'MDN-01': 'Medan Gatot Subroto',
                    }
                    setFormData({ 
                      ...formData, 
                      branchCode: e.target.value,
                      branchName: branchMap[e.target.value]
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="JKT-01">Jakarta Sudirman</option>
                  <option value="BDG-01">Bandung Dago</option>
                  <option value="SBY-01">Surabaya Tunjungan</option>
                  <option value="JKT-02">Jakarta Thamrin</option>
                  <option value="MDN-01">Medan Gatot Subroto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Code
                </label>
                <input
                  type="text"
                  value={formData.branchCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Asset Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.assetDescription}
                  onChange={(e) => setFormData({ ...formData, assetDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Toyota Avanza 2024"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value as FidusiaAgreement['assetType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="vehicle">Vehicle</option>
                    <option value="machinery">Machinery</option>
                    <option value="equipment">Equipment</option>
                    <option value="inventory">Inventory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Value (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.assetValue}
                    onChange={(e) => setFormData({ ...formData, assetValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="250000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="200000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {mode === 'create' ? (
                <>
                  <Plus className="w-4 h-4" />
                  Create Agreement
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
