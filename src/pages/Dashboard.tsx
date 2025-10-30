import { FileText, Activity, Clock, CheckCircle, AlertCircle, CreditCard, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  {
    name: 'Total Agreements',
    value: '156',
    change: '+12',
    changeType: 'positive',
    period: 'this month',
    icon: FileText,
    color: 'blue',
  },
  {
    name: 'Active Registrations',
    value: '89',
    change: '+8',
    changeType: 'positive',
    period: 'this week',
    icon: CheckCircle,
    color: 'green',
  },
  {
    name: 'Pending Submissions',
    value: '23',
    change: '-5',
    changeType: 'negative',
    period: 'vs last week',
    icon: Clock,
    color: 'yellow',
  },
  {
    name: 'Awaiting Payment',
    value: '12',
    change: '+3',
    changeType: 'positive',
    period: 'today',
    icon: CreditCard,
    color: 'orange',
  },
]

const agreementStats = [
  { status: 'Active', count: 89, color: 'bg-green-500', percentage: 57 },
  { status: 'Processing', count: 23, color: 'bg-yellow-500', percentage: 15 },
  { status: 'Pending', count: 18, color: 'bg-blue-500', percentage: 12 },
  { status: 'Draft', count: 14, color: 'bg-gray-500', percentage: 9 },
  { status: 'Expired', count: 12, color: 'bg-red-500', percentage: 7 },
]

const recentSubmissions = [
  { 
    id: '1', 
    agreementNumber: 'FID-2025-007',
    clientName: 'David Martinez', 
    status: 'processing',
    statusLabel: 'Processing',
    statusColor: 'bg-yellow-100 text-yellow-700',
    time: '5 minutes ago',
    isBulk: true,
    batchName: 'October Batch #1',
  },
  { 
    id: '2', 
    agreementNumber: 'FID-2025-006',
    clientName: 'Lisa Anderson', 
    status: 'waiting_payment',
    statusLabel: 'Awaiting Payment',
    statusColor: 'bg-orange-100 text-orange-700',
    time: '10 minutes ago',
    isBulk: true,
    batchName: 'October Batch #1',
  },
  { 
    id: '3', 
    agreementNumber: 'FID-2025-005',
    clientName: 'Michael Chen', 
    status: 'completed',
    statusLabel: 'Completed',
    statusColor: 'bg-green-100 text-green-700',
    time: '2 hours ago',
    isBulk: true,
    batchName: 'October Batch #1',
  },
  { 
    id: '4', 
    agreementNumber: 'FID-2025-004',
    clientName: 'Sarah Williams', 
    status: 'processing',
    statusLabel: 'Processing',
    statusColor: 'bg-yellow-100 text-yellow-700',
    time: '3 hours ago',
    isBulk: false,
  },
  { 
    id: '5', 
    agreementNumber: 'FID-2025-002',
    clientName: 'Jane Smith', 
    status: 'waiting_payment',
    statusLabel: 'Awaiting Payment',
    statusColor: 'bg-orange-100 text-orange-700',
    time: '4 hours ago',
    isBulk: false,
  },
]

const institutionActivity = [
  { name: 'Jakarta Sudirman (JKT-01)', agreements: 45, trend: 'up', change: '+8' },
  { name: 'Bandung Dago (BDG-01)', agreements: 38, trend: 'up', change: '+5' },
  { name: 'Surabaya Tunjungan (SBY-01)', agreements: 32, trend: 'down', change: '-2' },
  { name: 'Jakarta Thamrin (JKT-02)', agreements: 28, trend: 'up', change: '+3' },
  { name: 'Other Branches (21)', agreements: 13, trend: 'neutral', change: '0' },
]

export default function Dashboard() {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-50 to-blue-100 text-blue-600',
      green: 'from-green-50 to-green-100 text-green-600',
      yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
      orange: 'from-orange-50 to-orange-100 text-orange-600',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">PT Adira Finance - FRAS</h1>
            <p className="text-blue-100">Fidusia Registration Automation System</p>
            <p className="text-blue-200 text-sm mt-1">Monitoring all branches - Real-time data across Indonesia</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Viewing</p>
            <p className="text-white font-semibold text-lg">All Branches</p>
            <p className="text-blue-200 text-xs mt-1">25 active branches</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-linear-to-br ${getColorClasses(stat.color)} rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.period}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agreement Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement Status</h2>
          <div className="space-y-3">
            {agreementStats.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.status}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <Link 
            to="/agreements"
            className="mt-4 w-full block text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            View All Agreements
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link to="/tracking" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{submission.agreementNumber}</p>
                      {submission.isBulk && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          <Layers className="w-3 h-3" />
                          {submission.batchName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{submission.clientName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${submission.statusColor}`}>
                      {submission.statusLabel}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{submission.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  {stats.find(s => s.name === 'Awaiting Payment')?.value} submissions are waiting for PNBP payment. 
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
