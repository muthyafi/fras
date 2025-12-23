import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider as UrqlProvider } from 'urql'
import { useAuth } from './contexts/AuthContext'
import { urqlClient } from './lib/urql'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agreements from './pages/Agreements'
import BulkUpload from './pages/bulk-upload'
import BranchManagement from './pages/BranchManagement'
import UserManagement from './pages/users'
import RoleManagement from './pages/RoleManagement'
import RegistrationTracking from './pages/registration-tracking'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { user } = useAuth()

  return (
    <UrqlProvider value={urqlClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/agreements"
          element={
            <ProtectedRoute>
              <Layout>
                <Agreements />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Layout>
                <RegistrationTracking />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-upload"
          element={
            <ProtectedRoute>
              <Layout>
                <BulkUpload />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <ProtectedRoute>
              <Layout>
                <BranchManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Reports Page</h2>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900">Settings Page</h2>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </UrqlProvider>
  )
}

export default App
