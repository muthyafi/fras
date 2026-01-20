import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Building2,
  Upload,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'Bulk Upload', path: '/bulk-upload' },
  // { icon: FileText, label: 'Agreements', path: '/agreements' },
  { icon: Activity, label: 'Registration Tracking', path: '/tracking' },
  { icon: Building2, label: 'Branch Management', path: '/branches' },
  { icon: Shield, label: 'User Management', path: '/users' },
  { icon: ShieldCheck, label: 'Role Management', path: '/roles' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={`bg-linear-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      } flex flex-col h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        {!collapsed && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <span className="font-bold text-lg block">Multi Finance</span>
                <span className="text-xs text-gray-400">DMaaS System</span>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {/* <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="bg-linear-to-r from-blue-500/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
            <p className="text-sm font-medium mb-1">Need Help?</p>
            <p className="text-xs text-gray-400 mb-3">Check our documentation</p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition-colors">
              Get Support
            </button>
          </div>
        )}
      </div> */}
    </aside>
  )
}
