import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

// Predefined system roles
export type SystemRole = 'super_admin' | 'branch_admin' | 'branch_user'

// Custom role interface
export interface CustomRole {
  id: string
  name: string
  description: string
  color: string // For badge display
  permissions: Permissions
  isSystem: boolean // true for predefined roles, false for custom
  createdAt: string
  updatedAt: string
}

// User roles can be system or custom
export type UserRole = SystemRole | string // string for custom role IDs

// User interface
export interface RoleUser {
  id: string
  email: string
  name: string
  role: UserRole
  customRoleId?: string // If using custom role
  branchCode?: string // Required for branch_admin and branch_user
  branchName?: string
  isActive: boolean
  createdAt: string
}

// Permission types
export interface Permissions {
  canViewAllBranches: boolean
  canManageBranches: boolean
  canManageUsers: boolean
  canEditAnyAgreement: boolean
  canDeleteAnyAgreement: boolean
  canExportData: boolean
  canViewReports: boolean
  canManageOwnBranch: boolean
}

// Role context type
interface RoleContextType {
  user: RoleUser | null
  setUser: (user: RoleUser | null) => void
  switchUser: (userRole: UserRole, branchCode?: string) => void
  permissions: Permissions
  customRoles: CustomRole[]
  addCustomRole: (role: Omit<CustomRole, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCustomRole: (id: string, role: Partial<CustomRole>) => void
  deleteCustomRole: (id: string) => void
  getCustomRole: (id: string) => CustomRole | undefined
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

// Predefined system roles as CustomRole objects
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

// Mock users for testing
const mockUsers: Record<string, RoleUser> = {
  super_admin: {
    id: '1',
    email: 'admin@adira.co.id',
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    createdAt: '2024-01-01',
  },
  branch_admin_jkt: {
    id: '2',
    email: 'admin.jakarta@adira.co.id',
    name: 'Jakarta Admin',
    role: 'branch_admin',
    branchCode: 'JKT-01',
    branchName: 'Jakarta Sudirman',
    isActive: true,
    createdAt: '2024-01-01',
  },
  branch_user_bdg: {
    id: '3',
    email: 'user.bandung@adira.co.id',
    name: 'Bandung User',
    role: 'branch_user',
    branchCode: 'BDG-01',
    branchName: 'Bandung Dago',
    isActive: true,
    createdAt: '2024-01-01',
  },
  branch_admin_sby: {
    id: '4',
    email: 'admin.surabaya@adira.co.id',
    name: 'Surabaya Admin',
    role: 'branch_admin',
    branchCode: 'SBY-01',
    branchName: 'Surabaya Tunjungan',
    isActive: true,
    createdAt: '2024-01-01',
  },
}

// Calculate permissions based on user role
function getPermissions(user: RoleUser | null, customRoles: CustomRole[]): Permissions {
  if (!user) {
    return {
      canViewAllBranches: false,
      canManageBranches: false,
      canManageUsers: false,
      canEditAnyAgreement: false,
      canDeleteAnyAgreement: false,
      canExportData: false,
      canViewReports: false,
      canManageOwnBranch: false,
    }
  }

  // Check if it's a custom role
  if (user.customRoleId) {
    const customRole = customRoles.find((r) => r.id === user.customRoleId)
    if (customRole) {
      return customRole.permissions
    }
  }

  // Fallback to system roles
  const allRoles = [...systemRoles, ...customRoles]
  const roleData = allRoles.find((r) => r.id === user.role)
  
  if (roleData) {
    return roleData.permissions
  }

  // Default: no permissions
  return {
    canViewAllBranches: false,
    canManageBranches: false,
    canManageUsers: false,
    canEditAnyAgreement: false,
    canDeleteAnyAgreement: false,
    canExportData: false,
    canViewReports: false,
    canManageOwnBranch: false,
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  // Default to super admin for development
  const [user, setUser] = useState<RoleUser | null>(mockUsers.super_admin)
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])

  // Helper function to switch between mock users for testing
  const switchUser = (userRole: UserRole, branchCode?: string) => {
    let selectedUser: RoleUser | null = null

    switch (userRole) {
      case 'super_admin':
        selectedUser = mockUsers.super_admin
        break
      case 'branch_admin':
        if (branchCode === 'JKT-01') {
          selectedUser = mockUsers.branch_admin_jkt
        } else if (branchCode === 'SBY-01') {
          selectedUser = mockUsers.branch_admin_sby
        } else {
          selectedUser = mockUsers.branch_admin_jkt // default
        }
        break
      case 'branch_user':
        selectedUser = mockUsers.branch_user_bdg
        break
    }

    setUser(selectedUser)
  }

  // Custom role management functions
  const addCustomRole = (role: Omit<CustomRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRole: CustomRole = {
      ...role,
      id: `custom_${Date.now()}`,
      isSystem: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setCustomRoles((prev) => [...prev, newRole])
  }

  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles((prev) =>
      prev.map((role) =>
        role.id === id
          ? { ...role, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : role
      )
    )
  }

  const deleteCustomRole = (id: string) => {
    setCustomRoles((prev) => prev.filter((role) => role.id !== id))
  }

  const getCustomRole = (id: string) => {
    return [...systemRoles, ...customRoles].find((role) => role.id === id)
  }

  const permissions = getPermissions(user, customRoles)

  return (
    <RoleContext.Provider
      value={{
        user,
        setUser,
        switchUser,
        permissions,
        customRoles,
        addCustomRole,
        updateCustomRole,
        deleteCustomRole,
        getCustomRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

// Hook to use role context
export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

// Hook for easy permission checks
export function usePermissions() {
  const { permissions } = useRole()
  return permissions
}

// Hook to check if user has access to a branch
export function useHasBranchAccess(branchCode: string) {
  const { user, permissions } = useRole()
  
  if (!user) return false
  if (permissions.canViewAllBranches) return true
  
  return user.branchCode === branchCode
}

// Hook to get filtered branch codes based on user permissions
export function useAllowedBranches() {
  const { user, permissions } = useRole()
  
  if (!user) return []
  if (permissions.canViewAllBranches) return null // null means all branches
  
  return user.branchCode ? [user.branchCode] : []
}
