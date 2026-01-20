import { FileText, Activity, Clock, CheckCircle, AlertCircle, CreditCard, Layers, ArrowUpRight, ArrowDownRight, Loader, XCircle, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePollingTracking } from './registration-tracking/hooks/usePollingTracking'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/id'

dayjs.extend(relativeTime)
dayjs.locale('id')

const institutionActivity = [
  { name: 'Jakarta Sudirman (JKT-01)', agreements: 45, trend: 'up', change: '+8' },
  { name: 'Bandung Dago (BDG-01)', agreements: 38, trend: 'up', change: '+5' },
  { name: 'Surabaya Tunjungan (SBY-01)', agreements: 32, trend: 'down', change: '-2' },
  { name: 'Jakarta Thamrin (JKT-02)', agreements: 28, trend: 'up', change: '+3' },
  { name: 'Other Branches (21)', agreements: 13, trend: 'neutral', change: '0' },
]

export default function Dashboard() {
  // Get real-time status counts and recent records from registration tracking
  const { statusCounts, loading, records, totalCount } = usePollingTracking({
    page: 1,
    pageSize: 5,
    pollingInterval: 5000,
    enablePolling: true,
  })

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Unassigned':
        return 'bg-orange-100 text-orange-800'
      case 'Assigned Notaris':
        return 'bg-gray-100 text-gray-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Waiting Payment':
        return 'bg-yellow-100 text-yellow-800'
      case 'Submitting':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate success rate
  const totalProcessed = (statusCounts.completed || 0) + (statusCounts.failed || 0)
  const successRate = totalProcessed > 0 
    ? Math.round(((statusCounts.completed || 0) / totalProcessed) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Multi Finance - DMaaS</h1>
            <p className="text-blue-100">Document Management as a Service</p>
            <p className="text-blue-200 text-sm mt-1">
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Real-time monitoring - Auto-updates every 5 seconds
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Total Registrations</p>
            <p className="text-white font-semibold text-3xl">{loading ? '...' : totalCount}</p>
            <p className="text-blue-200 text-xs mt-1">25 active branches</p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-green-900">{successRate}%</p>
              <p className="text-xs text-green-600 mt-1">
                {statusCounts.completed || 0} completed of {totalProcessed} processed
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-linear-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium mb-1">Needs Attention</p>
              <p className="text-3xl font-bold text-yellow-900">
                {(statusCounts.unassigned || 0) + (statusCounts.waiting_payment || 0)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Unassigned + Waiting Payment
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-900">
                {(statusCounts.queued || 0) + (statusCounts.submitting || 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Assigned + Submitting
              </p>
            </div>
            <Loader className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/tracking?status=Unassigned" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-orange-600">{loading ? '...' : statusCounts.unassigned || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </Link>

        <Link to="/tracking?status=Assigned" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : statusCounts.queued || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </Link>

        <Link to="/tracking?status=Submitting" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitting</p>
              <p className="text-2xl font-bold text-indigo-600">{loading ? '...' : statusCounts.submitting || 0}</p>
            </div>
            <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        </Link>

        <Link to="/tracking?status=Waiting%20Payment" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-yellow-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waiting Payment</p>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : statusCounts.waiting_payment || 0}</p>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-400" />
          </div>
        </Link>

        <Link to="/tracking?status=Completed" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : statusCounts.completed || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </Link>

        <Link to="/tracking?status=Failed" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all hover:border-red-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : statusCounts.failed || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </Link>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              {loading && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <Link to="/tracking" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p>Loading recent activity...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{record.no_perjanjian}</p>
                      </div>
                      <p className="text-sm text-gray-600">{record.debitur?.nama || 'Unknown'}</p>
                      {record.notaris?.nama && (
                        <p className="text-xs text-gray-500 mt-1">Notaris: {record.notaris.nama}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status?.nama || 'Unknown')}`}>
                        {record.status?.nama || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {record.modified_date ? dayjs(record.modified_date).fromNow() : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Branches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Branches</h2>
            <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {institutionActivity.map((branch, index) => (
              <div key={branch.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                  <p className="text-xs text-gray-500">{branch.agreements} agreements</p>
                </div>
                <div className="flex items-center gap-1">
                  {branch.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {branch.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${
                    branch.trend === 'up' ? 'text-green-600' : 
                    branch.trend === 'down' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {branch.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/agreements"
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              New Agreement
            </Link>
            <Link
              to="/bulk-upload"
              className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Bulk Upload
            </Link>
            <Link
              to="/tracking"
              className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Track Submissions
            </Link>
          </div>

          <div className="mt-6 p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">💡 PNBP Payment Reminder</h3>
                <p className="text-xs text-gray-600">
                  {loading ? '...' : (statusCounts.waiting_payment || 0)} submissions are waiting for PNBP payment. 
                  Visit the Tracking page to download VA numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
