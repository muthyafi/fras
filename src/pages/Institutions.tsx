import { useState } from 'react'
import { Building2, Plus, Search, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/id'
import type { Institution } from '../types'

dayjs.extend(utc)
dayjs.extend(timezone)

// Mock data
const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'BCA Finance',
    registrationNumber: '1234567890123',
    email: 'info@bcafinance.co.id',
    phone: '02112345678',
    address: 'Jl. Jend. Sudirman Kav. 52-53',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    director: 'Ahmad Wijaya',
    isActive: true,
    createdAt: '2024-06-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Multi Finance',
    registrationNumber: '9876543210987',
    email: 'contact@multifinance.co.id',
    phone: '02198765432',
    address: 'Multi Finance Tower, Jl. Menteng Raya No. 21',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    director: 'Budi Santoso',
    isActive: true,
    createdAt: '2024-08-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Mandiri Tunas Finance',
    registrationNumber: '5555666677778',
    email: 'info@mtf.co.id',
    phone: '0215551234',
    address: 'Plaza Mandiri, Jl. Gatot Subroto',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    director: 'Siti Nurhaliza',
    isActive: false,
    createdAt: '2024-09-10T09:00:00Z',
  },
]

export default function Institutions() {
  const [institutions] = useState<Institution[]>(mockInstitutions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch =
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.registrationNumber.includes(searchTerm)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && institution.isActive) ||
      (statusFilter === 'inactive' && !institution.isActive)
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return dayjs.utc(dateString).tz(dayjs.tz.guess()).locale('id').format('DD MMMM YYYY')
  }

  const activeCount = institutions.filter((i) => i.isActive).length
  const inactiveCount = institutions.filter((i) => !i.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multifinance Institutions</h1>
          <p className="text-gray-600 mt-1">Manage registered multifinance institutions</p>
        </div>
        <button className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Register Institution
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Institutions</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{institutions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Registered institutions</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Active</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active institutions</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Inactive</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
          <p className="text-xs text-gray-500 mt-1">Inactive institutions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white min-w-37.5"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutions.map((institution) => (
          <div
            key={institution.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{institution.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        institution.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {institution.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Registration Number</p>
                  <p className="text-sm font-medium text-gray-900">{institution.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Director</p>
                  <p className="text-sm font-medium text-gray-900">{institution.director}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="text-sm text-gray-900">{institution.email}</p>
                  <p className="text-sm text-gray-900">{institution.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">
                    {institution.city}, {institution.province}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registered</p>
                  <p className="text-sm text-gray-900">{formatDate(institution.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <div className="flex items-center justify-end gap-2">
                <button
                  className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInstitutions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No institutions found</p>
        </div>
      )}
    </div>
  )
}
