import { useAuth } from '../contexts/AuthContext'
import { useRole } from '../contexts/RoleContext'
import { LogOut, Bell, Search, User, Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { signOut } = useAuth()
  const { user, switchUser } = useRole()
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  // Display user role and branch
  const roleDisplay = user?.role === 'super_admin' ? 'Super Admin' : 
                      user?.role === 'branch_admin' ? 'Branch Admin' : 
                      'Branch User'
  const branchDisplay = user?.role === 'super_admin' ? 'All Branches (25 active)' : 
                        user?.branchName ? `${user.branchName} (${user.branchCode})` : 
                        'No Branch'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PT Adira Finance
          </h2>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{branchDisplay}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agreements..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64 transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'User'}</p>
              <p className="text-xs text-gray-500">{roleDisplay}</p>
            </div>
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            
            {/* Role Switcher Dropdown (DEV ONLY) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Switch Role (Dev)"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              
              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Switch Role (Dev)</p>
                  </div>
                  <button
                    onClick={() => {
                      switchUser('super_admin')
                      setShowRoleSwitcher(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Super Admin</div>
                    <div className="text-xs text-gray-500">All Branches Access</div>
                  </button>
                  <button
                    onClick={() => {
                      switchUser('branch_admin', 'JKT-01')
                      setShowRoleSwitcher(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Branch Admin - Jakarta</div>
                    <div className="text-xs text-gray-500">JKT-01 Only</div>
                  </button>
                  <button
                    onClick={() => {
                      switchUser('branch_admin', 'SBY-01')
                      setShowRoleSwitcher(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Branch Admin - Surabaya</div>
                    <div className="text-xs text-gray-500">SBY-01 Only</div>
                  </button>
                  <button
                    onClick={() => {
                      switchUser('branch_user', 'BDG-01')
                      setShowRoleSwitcher(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Branch User - Bandung</div>
                    <div className="text-xs text-gray-500">BDG-01 (Read Only)</div>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
