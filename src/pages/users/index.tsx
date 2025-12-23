import { useState } from 'react'
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useRole, type RoleUser, type UserRole, type CustomRole } from '../../contexts/RoleContext'
import { useQuery } from 'urql'
import { GetUsersQuery } from './gql'
import UsersTable from './components/UsersTable'

// Extended user interface with password
interface UserWithPassword extends RoleUser {
  password?: string
  phone?: string
  lastLogin?: string
}

// Mock users data
const mockUsersData: UserWithPassword[] = [
  {
    id: '1',
    email: 'admin@adira.co.id',
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01',
    phone: '021-5290-5555',
    lastLogin: '2025-10-29T10:00:00Z',
  },
  {
    id: '2',
    email: 'admin.jakarta@adira.co.id',
    name: 'Jakarta Admin',
    role: 'branch_admin',
    branchCode: 'JKT-01',
    branchName: 'Jakarta Sudirman',
    isActive: true,
    createdAt: '2024-01-15',
    phone: '021-5290-5556',
    lastLogin: '2025-10-29T09:30:00Z',
  },
  {
    id: '3',
    email: 'user.bandung@adira.co.id',
    name: 'Bandung User',
    role: 'branch_user',
    branchCode: 'BDG-01',
    branchName: 'Bandung Dago',
    isActive: true,
    createdAt: '2024-02-01',
    phone: '022-7654321',
    lastLogin: '2025-10-28T14:00:00Z',
  },
  {
    id: '4',
    email: 'admin.surabaya@adira.co.id',
    name: 'Surabaya Admin',
    role: 'branch_admin',
    branchCode: 'SBY-01',
    branchName: 'Surabaya Tunjungan',
    isActive: true,
    createdAt: '2024-02-15',
    phone: '031-1234567',
    lastLogin: '2025-10-29T08:00:00Z',
  },
  {
    id: '5',
    email: 'user.medan@adira.co.id',
    name: 'Medan User',
    role: 'branch_user',
    branchCode: 'MDN-01',
    branchName: 'Medan Gatot Subroto',
    isActive: false,
    createdAt: '2024-03-01',
    phone: '061-9876543',
    lastLogin: '2025-10-15T10:00:00Z',
  },
  {
    id: '6',
    email: 'admin.bandung@adira.co.id',
    name: 'Bandung Admin',
    role: 'branch_admin',
    branchCode: 'BDG-01',
    branchName: 'Bandung Dago',
    isActive: true,
    createdAt: '2024-03-15',
    phone: '022-8765432',
    lastLogin: '2025-10-29T07:00:00Z',
  },
]

// Available branches for assignment
const availableBranches = [
  { code: 'JKT-01', name: 'Jakarta Sudirman' },
  { code: 'JKT-02', name: 'Jakarta Thamrin' },
  { code: 'BDG-01', name: 'Bandung Dago' },
  { code: 'SBY-01', name: 'Surabaya Tunjungan' },
  { code: 'MDN-01', name: 'Medan Gatot Subroto' },
  { code: 'YGY-01', name: 'Yogyakarta Malioboro' },
]

export default function UserManagement() {
  const { customRoles } = useRole()
  const [users, setUsers] = useState<UserWithPassword[]>(mockUsersData)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserWithPassword | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserWithPassword | null>(null)

  // Get all available roles (system + custom)
  const systemRoles: CustomRole[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access',
      color: 'purple',
      isSystem: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      permissions: {
        canViewAllBranches: true,
        canManageBranches: true,
        canManageUsers: true,
        canEditAnyAgreement: true,
        canDeleteAnyAgreement: true,
        canExportData: true,
        canViewReports: true,
        canManageOwnBranch: true,
      },
    },
    {
      id: 'branch_admin',
      name: 'Branch Admin',
      description: 'Manage own branch',
      color: 'blue',
      isSystem: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      permissions: {
        canViewAllBranches: false,
        canManageBranches: false,
        canManageUsers: false,
        canEditAnyAgreement: false,
        canDeleteAnyAgreement: false,
        canExportData: true,
        canViewReports: true,
        canManageOwnBranch: true,
      },
    },
    {
      id: 'branch_user',
      name: 'Branch User',
      description: 'View only access',
      color: 'gray',
      isSystem: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      permissions: {
        canViewAllBranches: false,
        canManageBranches: false,
        canManageUsers: false,
        canEditAnyAgreement: false,
        canDeleteAnyAgreement: false,
        canExportData: false,
        canViewReports: false,
        canManageOwnBranch: false,
      },
    },
  ]

  const allRoles = [...systemRoles, ...customRoles]

  // Helper to get role display info
  const getRoleInfo = (roleId: string) => {
    const role = allRoles.find((r) => r.id === roleId)
    return role || { name: roleId, color: 'gray' }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.branchName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const superAdmins = users.filter((u) => u.role === 'super_admin').length
  const branchAdmins = users.filter((u) => u.role === 'branch_admin').length
  const branchUsers = users.filter((u) => u.role === 'branch_user').length

  // CRUD Handlers
  const handleCreateUser = (newUser: Omit<UserWithPassword, 'id'>) => {
    const user: UserWithPassword = {
      ...newUser,
      id: String(users.length + 1),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setShowCreateModal(false)
  }

  const handleEditUser = (updatedUser: UserWithPassword) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setShowEditModal(false)
    setUserToEdit(null)
  }

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const [{ data, fetching, error }] = useQuery({
    query: GetUsersQuery,
  });
  console.log('GraphQL Users Data:', data, fetching, error);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-green-50 to-green-100 text-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-700">{activeUsers}</p>
          <p className="text-sm text-gray-600 mt-1">Active Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-purple-50 to-purple-100 text-purple-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-700">{superAdmins}</p>
          <p className="text-sm text-gray-600 mt-1">Super Admins</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-700">{branchAdmins}</p>
          <p className="text-sm text-gray-600 mt-1">Branch Admins</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-linear-to-br from-gray-50 to-gray-100 text-gray-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-700">{branchUsers}</p>
          <p className="text-sm text-gray-600 mt-1">Branch Users</p>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable />
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role)
                const colorClass = `bg-${roleInfo.color}-100 text-${roleInfo.color}-700`
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {roleInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.branchCode ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.branchName}</p>
                            <p className="text-xs text-gray-500">{user.branchCode}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">All Branches</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="Edit User"
                          onClick={() => {
                            setUserToEdit(user)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-1 ${
                            user.role === 'super_admin' && users.filter((u) => u.role === 'super_admin').length === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                          title={
                            user.role === 'super_admin' && users.filter((u) => u.role === 'super_admin').length === 1
                              ? 'Cannot delete the last super admin'
                              : 'Delete User'
                          }
                          disabled={
                            user.role === 'super_admin' && users.filter((u) => u.role === 'super_admin').length === 1
                          }
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div> */}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          getRoleInfo={getRoleInfo}
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
          existingUsers={users}
          allRoles={allRoles}
          getRoleInfo={getRoleInfo}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <UserFormModal
          mode="edit"
          user={userToEdit}
          onClose={() => {
            setShowEditModal(false)
            setUserToEdit(null)
          }}
          onSave={handleEditUser}
          existingUsers={users}
          allRoles={allRoles}
          getRoleInfo={getRoleInfo}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmModal
          userName={userToDelete.name}
          userEmail={userToDelete.email}
          onClose={() => {
            setShowDeleteModal(false)
            setUserToDelete(null)
          }}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  )
}

// User Detail Modal Component
interface UserDetailModalProps {
  user: UserWithPassword
  getRoleInfo: (roleId: string) => CustomRole | { name: string; color: string }
  onClose: () => void
}

function UserDetailModal({ user, getRoleInfo, onClose }: UserDetailModalProps) {
  const roleInfo = getRoleInfo(user.role)
  const colorClass = `bg-${roleInfo.color}-100 text-${roleInfo.color}-700`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Profile */}
          <div className="flex items-center gap-4 p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xl">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {roleInfo.name}
                </span>
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Branch Assignment */}
          {user.branchCode && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Branch Assignment</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.branchName}</p>
                    <p className="text-xs text-gray-500">{user.branchCode}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Permissions</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {user.role === 'super_admin' ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      View All Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Manage Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Manage Users
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Edit All Agreements
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Delete All Agreements
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Export Data
                    </div>
                  </>
                ) : user.role === 'branch_admin' ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      View All Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Manage Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Manage Own Branch
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Edit Own Agreements
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Export Data
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      View Reports
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      View All Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Manage Branches
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Edit Agreements
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Delete Agreements
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      View Own Branch
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Export Data
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// User Form Modal Component (Create/Edit)
interface UserFormModalProps {
  mode: 'create' | 'edit'
  user?: UserWithPassword
  onClose: () => void
  onSave: (user: any) => void
  existingUsers: UserWithPassword[]
  allRoles: CustomRole[]
  getRoleInfo: (roleId: string) => CustomRole | { name: string; color: string }
}

function UserFormModal({ mode, user, onClose, onSave, existingUsers, allRoles, getRoleInfo }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || ('branch_user' as UserRole),
    branchCode: user?.branchCode || '',
    branchName: user?.branchName || '',
    isActive: user?.isActive ?? true,
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    // Check duplicate email
    if (mode === 'create' || (mode === 'edit' && user?.email !== formData.email)) {
      if (existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        newErrors.email = 'Email already exists'
      }
    }

    if (mode === 'create' && !formData.password) newErrors.password = 'Password is required'
    if (mode === 'create' && formData.password && formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'

    // Check if role needs branch assignment (roles without canViewAllBranches permission)
    const roleData = allRoles.find((r) => r.id === formData.role)
    const needsBranchAssignment = roleData ? !roleData.permissions.canViewAllBranches : true
    
    if (needsBranchAssignment && !formData.branchCode)
      newErrors.branchCode = 'Branch assignment is required for this role'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (mode === 'edit' && user) {
      onSave({ ...user, ...formData })
    } else {
      onSave(formData)
    }
  }

  const handleRoleChange = (newRole: UserRole) => {
    // Check if the new role can view all branches (doesn't need branch assignment)
    const roleData = allRoles.find((r) => r.id === newRole)
    const needsBranchAssignment = roleData ? !roleData.permissions.canViewAllBranches : true
    
    setFormData({
      ...formData,
      role: newRole,
      branchCode: needsBranchAssignment ? formData.branchCode : '',
      branchName: needsBranchAssignment ? formData.branchName : '',
    })
  }

  const handleBranchChange = (branchCode: string) => {
    const branch = availableBranches.find((b) => b.code === branchCode)
    setFormData({
      ...formData,
      branchCode,
      branchName: branch?.name || '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  placeholder="e.g., John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                  placeholder="user@adira.co.id"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., 021-5290-5555"
                />
              </div>

              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Role & Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Permissions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {allRoles.map((role) => {
                    const roleInfo = getRoleInfo(role.id)
                    const isSelected = formData.role === role.id
                    const colorClasses = {
                      purple: { border: 'border-purple-500', bg: 'bg-purple-50', icon: 'text-purple-600' },
                      blue: { border: 'border-blue-500', bg: 'bg-blue-50', icon: 'text-blue-600' },
                      green: { border: 'border-green-500', bg: 'bg-green-50', icon: 'text-green-600' },
                      red: { border: 'border-red-500', bg: 'bg-red-50', icon: 'text-red-600' },
                      yellow: { border: 'border-yellow-500', bg: 'bg-yellow-50', icon: 'text-yellow-600' },
                      pink: { border: 'border-pink-500', bg: 'bg-pink-50', icon: 'text-pink-600' },
                      indigo: { border: 'border-indigo-500', bg: 'bg-indigo-50', icon: 'text-indigo-600' },
                      gray: { border: 'border-gray-500', bg: 'bg-gray-50', icon: 'text-gray-600' },
                    }
                    const colors = colorClasses[role.color as keyof typeof colorClasses] || colorClasses.gray

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleChange(role.id)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          isSelected
                            ? `${colors.border} ${colors.bg}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Shield className={`w-6 h-6 mx-auto mb-2 ${isSelected ? colors.icon : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-gray-900">{roleInfo.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{role.description}</p>
                        {role.isSystem && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            System
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {(() => {
                const roleData = allRoles.find((r) => r.id === formData.role)
                const needsBranchAssignment = roleData ? !roleData.permissions.canViewAllBranches : true
                
                return needsBranchAssignment ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Assignment <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.branchCode}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className={`w-full px-3 py-2 border ${
                        errors.branchCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
                    >
                      <option value="">Select Branch</option>
                      {availableBranches.map((branch) => (
                        <option key={branch.code} value={branch.code}>
                          {branch.code} - {branch.name}
                        </option>
                      ))}
                    </select>
                    {errors.branchCode && <p className="mt-1 text-sm text-red-600">{errors.branchCode}</p>}
                  </div>
                ) : null
              })()}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Account is Active</span>
            </label>
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
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  userName: string
  userEmail: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({ userName, userEmail, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <span className="font-semibold">{userName}</span> ({userEmail})? This action
            cannot be undone.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Warning:</strong> This user will immediately lose access to the system.
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
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
