import { useState } from 'react'
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText,
  TrendingUp,
  Edit,
  MoreVertical,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { usePermissions } from '../contexts/RoleContext'

dayjs.extend(utc)
dayjs.extend(timezone)

interface Branch {
  id: string
  branchCode: string
  branchName: string
  city: string
  province: string
  region: string
  address: string
  phone: string
  email: string
  managerName: string
  managerEmail: string
  totalAgreements: number
  activeAgreements: number
  monthlyGrowth: number
  isActive: boolean
  isHeadOffice: boolean
  establishedDate: string
}

const mockBranches: Branch[] = [
  {
    id: '1',
    branchCode: 'JKT-01',
    branchName: 'Jakarta Sudirman',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    region: 'Jakarta & Banten',
    address: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
    phone: '021-5290-5555',
    email: 'jakarta.sudirman@multifinance.co.id',
    managerName: 'Budi Santoso',
    managerEmail: 'budi.santoso@multifinance.co.id',
    totalAgreements: 145,
    activeAgreements: 89,
    monthlyGrowth: 12,
    isActive: true,
    isHeadOffice: true,
    establishedDate: '2015-01-15',
  },
  {
    id: '2',
    branchCode: 'BDG-01',
    branchName: 'Bandung Dago',
    city: 'Bandung',
    province: 'Jawa Barat',
    region: 'Jawa Barat',
    address: 'Jl. Ir. H. Juanda No. 123, Bandung',
    phone: '022-250-4321',
    email: 'bandung.dago@multifinance.co.id',
    managerName: 'Siti Nurhaliza',
    managerEmail: 'siti.nurhaliza@multifinance.co.id',
    totalAgreements: 128,
    activeAgreements: 76,
    monthlyGrowth: 8,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2016-03-20',
  },
  {
    id: '3',
    branchCode: 'SBY-01',
    branchName: 'Surabaya Tunjungan',
    city: 'Surabaya',
    province: 'Jawa Timur',
    region: 'Jawa Timur',
    address: 'Jl. Tunjungan No. 88, Surabaya',
    phone: '031-532-8888',
    email: 'surabaya.tunjungan@multifinance.co.id',
    managerName: 'Andi Wijaya',
    managerEmail: 'andi.wijaya@multifinance.co.id',
    totalAgreements: 112,
    activeAgreements: 68,
    monthlyGrowth: -2,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2016-06-10',
  },
  {
    id: '4',
    branchCode: 'JKT-02',
    branchName: 'Jakarta Thamrin',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    region: 'Jakarta & Banten',
    address: 'Jl. M.H. Thamrin No. 11, Jakarta Pusat',
    phone: '021-3192-4567',
    email: 'jakarta.thamrin@multifinance.co.id',
    managerName: 'Dewi Lestari',
    managerEmail: 'dewi.lestari@multifinance.co.id',
    totalAgreements: 98,
    activeAgreements: 54,
    monthlyGrowth: 5,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2017-09-01',
  },
  {
    id: '5',
    branchCode: 'MDN-01',
    branchName: 'Medan Gatot Subroto',
    city: 'Medan',
    province: 'Sumatera Utara',
    region: 'Sumatera',
    address: 'Jl. Gatot Subroto No. 234, Medan',
    phone: '061-456-7890',
    email: 'medan.gatot@multifinance.co.id',
    managerName: 'Rahman Hakim',
    managerEmail: 'rahman.hakim@multifinance.co.id',
    totalAgreements: 87,
    activeAgreements: 45,
    monthlyGrowth: 15,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2018-02-14',
  },
  {
    id: '6',
    branchCode: 'DPS-01',
    branchName: 'Denpasar Sunset Road',
    city: 'Denpasar',
    province: 'Bali',
    region: 'Bali & Nusa Tenggara',
    address: 'Jl. Sunset Road No. 777, Denpasar',
    phone: '0361-234-567',
    email: 'denpasar.sunset@multifinance.co.id',
    managerName: 'Made Suryawan',
    managerEmail: 'made.suryawan@multifinance.co.id',
    totalAgreements: 64,
    activeAgreements: 38,
    monthlyGrowth: 10,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2019-05-20',
  },
  {
    id: '7',
    branchCode: 'YGY-01',
    branchName: 'Yogyakarta Malioboro',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    region: 'Jawa Tengah & DIY',
    address: 'Jl. Malioboro No. 56, Yogyakarta',
    phone: '0274-567-890',
    email: 'yogyakarta.malioboro@multifinance.co.id',
    managerName: 'Sri Wahyuni',
    managerEmail: 'sri.wahyuni@multifinance.co.id',
    totalAgreements: 52,
    activeAgreements: 31,
    monthlyGrowth: 3,
    isActive: true,
    isHeadOffice: false,
    establishedDate: '2019-11-08',
  },
  {
    id: '8',
    branchCode: 'PLG-01',
    branchName: 'Palembang Sudirman',
    city: 'Palembang',
    province: 'Sumatera Selatan',
    region: 'Sumatera',
    address: 'Jl. Jend. Sudirman No. 123, Palembang',
    phone: '0711-345-678',
    email: 'palembang.sudirman@multifinance.co.id',
    managerName: 'Ahmad Fauzi',
    managerEmail: 'ahmad.fauzi@multifinance.co.id',
    totalAgreements: 45,
    activeAgreements: 28,
    monthlyGrowth: 7,
    isActive: false,
    isHeadOffice: false,
    establishedDate: '2020-03-15',
  },
]

const regions = ['All Regions', 'Jakarta & Banten', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah & DIY', 'Sumatera', 'Bali & Nusa Tenggara']
const provinces = ['All Provinces', 'DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'DI Yogyakarta', 'Sumatera Utara', 'Sumatera Selatan', 'Bali']

export default function BranchManagement() {
  // Role-based access control
  const permissions = usePermissions()
  
  // State for branches (using mock data as initial state)
  const [branches, setBranches] = useState<Branch[]>(mockBranches)
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All Regions')
  const [selectedProvince, setSelectedProvince] = useState('All Provinces')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  
  // CRUD modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null)
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null)

  // CRUD Handlers
  const handleCreateBranch = (newBranch: Omit<Branch, 'id'>) => {
    const branch: Branch = {
      ...newBranch,
      id: String(branches.length + 1),
    }
    setBranches([...branches, branch])
    setShowCreateModal(false)
  }

  const handleEditBranch = (updatedBranch: Branch) => {
    setBranches(branches.map(b => b.id === updatedBranch.id ? updatedBranch : b))
    setShowEditModal(false)
    setBranchToEdit(null)
  }

  const handleDeleteBranch = () => {
    if (branchToDelete) {
      setBranches(branches.filter(b => b.id !== branchToDelete.id))
      setShowDeleteModal(false)
      setBranchToDelete(null)
    }
  }

  const handleToggleStatus = (branchId: string) => {
    setBranches(branches.map(b => 
      b.id === branchId ? { ...b, isActive: !b.isActive } : b
    ))
  }

  // Filter branches
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = 
      branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.branchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.managerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRegion = selectedRegion === 'All Regions' || branch.region === selectedRegion
    const matchesProvince = selectedProvince === 'All Provinces' || branch.province === selectedProvince
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && branch.isActive) ||
      (statusFilter === 'inactive' && !branch.isActive)

    return matchesSearch && matchesRegion && matchesProvince && matchesStatus
  })

  // Calculate stats
  const totalBranches = branches.length
  const activeBranches = branches.filter(b => b.isActive).length
  const totalAgreements = branches.reduce((sum, b) => sum + b.totalAgreements, 0)
  const avgGrowth = branches.length > 0 
    ? (branches.reduce((sum, b) => sum + b.monthlyGrowth, 0) / branches.length).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600 mt-1">Manage all Multi Finance branch offices</p>
        </div>
        {permissions.canManageBranches && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New Branch
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalBranches}</h3>
          <p className="text-sm text-gray-600">Total Branches</p>
          <p className="text-xs text-green-600 mt-1">{activeBranches} active</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-green-50 to-green-100 text-green-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalAgreements}</h3>
          <p className="text-sm text-gray-600">Total Agreements</p>
          <p className="text-xs text-gray-400 mt-1">Across all branches</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-purple-50 to-purple-100 text-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgGrowth}%</h3>
          <p className="text-sm text-gray-600">Avg. Monthly Growth</p>
          <p className="text-xs text-gray-400 mt-1">Across all branches</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-orange-50 to-orange-100 text-orange-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{regions.length - 1}</h3>
          <p className="text-sm text-gray-600">Regions Covered</p>
          <p className="text-xs text-gray-400 mt-1">{provinces.length - 1} provinces</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search branches, cities, managers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters 
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredBranches.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalBranches}</span> branches
        </p>
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBranches.map(branch => (
          <div
            key={branch.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{branch.branchName}</h3>
                    {branch.isHeadOffice && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                        HEAD OFFICE
                      </span>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm mt-1">
                    {branch.branchCode} • {branch.city}, {branch.province}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {branch.isActive ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                  <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{branch.totalAgreements}</p>
                  <p className="text-xs text-gray-600 mt-1">Total</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{branch.activeAgreements}</p>
                  <p className="text-xs text-gray-600 mt-1">Active</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className={`text-2xl font-bold ${branch.monthlyGrowth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {branch.monthlyGrowth > 0 ? '+' : ''}{branch.monthlyGrowth}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Growth</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{branch.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-700">{branch.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-700">{branch.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{branch.managerName}</p>
                    <p className="text-xs text-gray-500">{branch.managerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedBranch(branch)}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  {permissions.canManageBranches && (
                    <button 
                      onClick={() => {
                        setBranchToEdit(branch)
                        setShowEditModal(true)
                      }}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
                {permissions.canManageBranches && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(branch.id)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                        branch.isActive 
                          ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {branch.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        setBranchToDelete(branch)
                        setShowDeleteModal(true)
                      }}
                      disabled={branch.isHeadOffice}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                        branch.isHeadOffice
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                      title={branch.isHeadOffice ? 'Cannot delete head office' : 'Delete branch'}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBranches.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No branches found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedRegion('All Regions')
              setSelectedProvince('All Provinces')
              setStatusFilter('all')
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedBranch.branchName}</h2>
                <p className="text-blue-100 text-sm">{selectedBranch.branchCode}</p>
              </div>
              <button
                onClick={() => setSelectedBranch(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status & Type */}
              <div className="flex items-center gap-3">
                {selectedBranch.isActive ? (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    Active Branch
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg">
                    <XCircle className="w-4 h-4" />
                    Inactive Branch
                  </span>
                )}
                {selectedBranch.isHeadOffice && (
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-lg">
                    HEAD OFFICE
                  </span>
                )}
              </div>

              {/* Performance Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-gray-900">{selectedBranch.totalAgreements}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Agreements</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-3xl font-bold text-green-700">{selectedBranch.activeAgreements}</p>
                    <p className="text-sm text-gray-600 mt-1">Active Agreements</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className={`text-3xl font-bold ${selectedBranch.monthlyGrowth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedBranch.monthlyGrowth > 0 ? '+' : ''}{selectedBranch.monthlyGrowth}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Monthly Growth</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-gray-900">{selectedBranch.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Province</p>
                      <p className="font-medium text-gray-900">{selectedBranch.province}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-medium text-gray-900">{selectedBranch.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Established</p>
                      <p className="font-medium text-gray-900">
                        {dayjs.utc(selectedBranch.establishedDate).tz(dayjs.tz.guess()).format('MMMM DD, YYYY')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Full Address</p>
                    <p className="font-medium text-gray-900">{selectedBranch.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedBranch.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedBranch.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Manager */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Branch Manager</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{selectedBranch.managerName}</p>
                      <p className="text-sm text-gray-600">{selectedBranch.managerEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">Branch Manager</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Branch
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  View Agreements
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Branch Modal */}
      {showCreateModal && (
        <BranchFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateBranch}
        />
      )}

      {/* Edit Branch Modal */}
      {showEditModal && branchToEdit && (
        <BranchFormModal
          mode="edit"
          branch={branchToEdit}
          onClose={() => {
            setShowEditModal(false)
            setBranchToEdit(null)
          }}
          onSave={handleEditBranch}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && branchToDelete && (
        <DeleteConfirmModal
          branchName={branchToDelete.branchName}
          branchCode={branchToDelete.branchCode}
          onClose={() => {
            setShowDeleteModal(false)
            setBranchToDelete(null)
          }}
          onConfirm={handleDeleteBranch}
        />
      )}
    </div>
  )
}

// Branch Form Modal Component (Create/Edit)
interface BranchFormModalProps {
  mode: 'create' | 'edit'
  branch?: Branch
  onClose: () => void
  onSave: (branch: any) => void
}

function BranchFormModal({ mode, branch, onClose, onSave }: BranchFormModalProps) {
  const [formData, setFormData] = useState({
    branchCode: branch?.branchCode || '',
    branchName: branch?.branchName || '',
    city: branch?.city || '',
    province: branch?.province || '',
    region: branch?.region || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    managerName: branch?.managerName || '',
    managerEmail: branch?.managerEmail || '',
    totalAgreements: branch?.totalAgreements || 0,
    activeAgreements: branch?.activeAgreements || 0,
    monthlyGrowth: branch?.monthlyGrowth || 0,
    isActive: branch?.isActive ?? true,
    isHeadOffice: branch?.isHeadOffice || false,
    establishedDate: branch?.establishedDate || new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'edit' && branch) {
      onSave({ ...branch, ...formData })
    } else {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Branch' : 'Edit Branch'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.branchCode}
                  onChange={(e) => setFormData({ ...formData, branchCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., JKT-03"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="e.g., Jakarta Kuningan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Jakarta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Province</option>
                  {provinces.filter(p => p !== 'All Provinces').map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Region</option>
                  {regions.filter(r => r !== 'All Regions').map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter complete address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 021-5290-5555"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="branch@multifinance.co.id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Branch Manager */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.managerEmail}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                  placeholder="manager@adira.co.id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Branch is Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isHeadOffice}
                  onChange={(e) => setFormData({ ...formData, isHeadOffice: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Head Office</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
            >
              {mode === 'create' ? 'Create Branch' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  branchName: string
  branchCode: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({ branchName, branchCode, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Branch</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <span className="font-semibold">{branchName}</span> ({branchCode})?
            This action cannot be undone.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Warning:</strong> All agreements and data associated with this branch will remain in the system but will need to be reassigned.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Branch
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
