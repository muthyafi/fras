import { useState } from 'react'
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Settings,
  Users,
} from 'lucide-react'
import { useRole, type CustomRole, type Permissions } from '../contexts/RoleContext'

interface RoleFormData {
  name: string
  description: string
  color: string
  permissions: Permissions
}

const defaultPermissions: Permissions = {
  canViewAllBranches: false,
  canManageBranches: false,
  canManageUsers: false,
  canEditAnyAgreement: false,
  canDeleteAnyAgreement: false,
  canExportData: false,
  canViewReports: false,
  canManageOwnBranch: false,
}

const permissionLabels: Record<keyof Permissions, { label: string; description: string }> = {
  canViewAllBranches: {
    label: 'View All Branches',
    description: 'Can view data from all branches in the system',
  },
  canManageBranches: {
    label: 'Manage Branches',
    description: 'Can create, edit, and delete branches',
  },
  canManageUsers: {
    label: 'Manage Users',
    description: 'Can create, edit, and delete user accounts',
  },
  canEditAnyAgreement: {
    label: 'Edit All Agreements',
    description: 'Can edit agreements from any branch',
  },
  canDeleteAnyAgreement: {
    label: 'Delete All Agreements',
    description: 'Can delete agreements from any branch',
  },
  canExportData: {
    label: 'Export Data',
    description: 'Can export reports and data files',
  },
  canViewReports: {
    label: 'View Reports',
    description: 'Can access reporting and analytics features',
  },
  canManageOwnBranch: {
    label: 'Manage Own Branch',
    description: 'Can manage agreements within assigned branch',
  },
}

const colorOptions = [
  { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-700' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-700' },
  { value: 'green', label: 'Green', class: 'bg-green-100 text-green-700' },
  { value: 'red', label: 'Red', class: 'bg-red-100 text-red-700' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100 text-yellow-700' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-700' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-700' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-100 text-gray-700' },
]

export default function RoleManagement() {
  const { customRoles, addCustomRole, updateCustomRole, deleteCustomRole } =
    useRole()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null)

  // Get all roles (system + custom)
  const systemRoles: CustomRole[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
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
      description: 'Manage own branch agreements and reports',
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
      description: 'View only access to own branch data',
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

  const openDetailModal = (role: CustomRole) => {
    setSelectedRole(role)
    setShowDetailModal(true)
  }

  const openEditModal = (role: CustomRole) => {
    setSelectedRole(role)
    setShowEditModal(true)
  }

  const openDeleteModal = (role: CustomRole) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const handleDeleteRole = () => {
    if (roleToDelete) {
      deleteCustomRole(roleToDelete.id)
      setShowDeleteModal(false)
      setRoleToDelete(null)
    }
  }

  // Count how many permissions are granted
  const countPermissions = (permissions: Permissions): number => {
    return Object.values(permissions).filter((value) => value === true).length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-1">
              Manage user roles and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Custom Role
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{allRoles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">System Roles</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900">{customRoles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      colorOptions.find((c) => c.value === role.color)?.class ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    {role.isSystem && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        System
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {role.description}
              </p>

              {/* Permission Count */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Permissions</span>
                  <span className="font-medium text-gray-900">
                    {countPermissions(role.permissions)}/8
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-linear-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(countPermissions(role.permissions) / 8) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openDetailModal(role)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                {!role.isSystem && (
                  <>
                    <button
                      onClick={() => openEditModal(role)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(role)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <RoleFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={(roleData) => {
            addCustomRole({ ...roleData, isSystem: false })
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <RoleFormModal
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRole(null)
          }}
          onSave={(roleData) => {
            updateCustomRole(selectedRole.id, { ...roleData, isSystem: false })
            setShowEditModal(false)
            setSelectedRole(null)
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedRole(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <DeleteConfirmModal
          role={roleToDelete}
          onClose={() => {
            setShowDeleteModal(false)
            setRoleToDelete(null)
          }}
          onConfirm={handleDeleteRole}
        />
      )}
    </div>
  )
}

// Role Detail Modal Component
function RoleDetailModal({
  role,
  onClose,
}: {
  role: CustomRole
  onClose: () => void
}) {
  const permissionEntries = Object.entries(role.permissions) as [
    keyof Permissions,
    boolean
  ][]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`p-6 bg-linear-to-r ${
            role.color === 'purple'
              ? 'from-purple-600 to-purple-700'
              : role.color === 'blue'
                ? 'from-blue-600 to-blue-700'
                : role.color === 'green'
                  ? 'from-green-600 to-green-700'
                  : role.color === 'red'
                    ? 'from-red-600 to-red-700'
                    : role.color === 'yellow'
                      ? 'from-yellow-600 to-yellow-700'
                      : role.color === 'pink'
                        ? 'from-pink-600 to-pink-700'
                        : role.color === 'indigo'
                          ? 'from-indigo-600 to-indigo-700'
                          : 'from-gray-600 to-gray-700'
          } text-white`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{role.name}</h2>
                <p className="text-white text-opacity-90 mt-1">{role.description}</p>
                {role.isSystem && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-white bg-opacity-20 rounded">
                    System Role
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Role Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Role Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Role ID</p>
                <p className="text-sm font-medium text-gray-900">{role.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {role.isSystem ? 'System Role' : 'Custom Role'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-medium text-gray-900">{role.createdAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{role.updatedAt}</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions ({permissionEntries.filter(([_, value]) => value).length}/8)
            </h3>
            <div className="space-y-3">
              {permissionEntries.map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    value ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {value ? (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        value ? 'text-green-900' : 'text-gray-500'
                      }`}
                    >
                      {permissionLabels[key].label}
                    </p>
                    <p
                      className={`text-xs ${
                        value ? 'text-green-700' : 'text-gray-500'
                      }`}
                    >
                      {permissionLabels[key].description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Role Form Modal Component
function RoleFormModal({
  role,
  onClose,
  onSave,
}: {
  role?: CustomRole
  onClose: () => void
  onSave: (role: Omit<CustomRole, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>) => void
}) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || 'blue',
    permissions: role?.permissions || defaultPermissions,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    onSave(formData)
  }

  const togglePermission = (key: keyof Permissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key],
      },
    })
  }

  const permissionEntries = Object.entries(formData.permissions) as [
    keyof Permissions,
    boolean
  ][]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {role ? 'Edit Role' : 'Create Custom Role'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Regional Manager"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Describe what this role can do..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${color.class} ${
                        formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : ''
                      } transition-all`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions (
              {permissionEntries.filter(([_, value]) => value).length}/8 selected)
            </h3>
            <div className="space-y-2">
              {permissionEntries.map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => togglePermission(key)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {permissionLabels[key].label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {permissionLabels[key].description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  role,
  onClose,
  onConfirm,
}: {
  role: CustomRole
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Are you sure you want to delete the role "{role.name}"?
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              ⚠️ Users assigned to this role may lose access to the system.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Role
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
