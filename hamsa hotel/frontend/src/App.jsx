import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Rooms from './pages/Rooms.jsx'
import Bookings from './pages/Bookings.jsx'
import Expenses from './pages/Expenses.jsx'
import Banquet from './pages/Banquet.jsx'
import DailySheet from './pages/DailySheet.jsx'
import Reports from './pages/Reports.jsx'

function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-full flex">
      <aside className="w-60 bg-gray-100 p-4 space-y-2">
        <div className="text-xl font-semibold mb-4">Hamsa Hotel</div>
        <nav className="flex flex-col gap-2">
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/">Dashboard</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/rooms">Rooms</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/bookings">Bookings</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/expenses">Expenses</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/banquet">Banquet Hall</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/daily-sheet">Daily Sheet</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-200" to="/reports">Reports</Link>
        </nav>
        <div className="mt-auto">
          {user && (
            <button className="w-full mt-4" onClick={logout}>Logout</button>
          )}
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute>
            <Layout><Rooms /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute roles={["admin","receptionist"]}>
            <Layout><Bookings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute roles={["admin"]}>
            <Layout><Expenses /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/banquet" element={
          <ProtectedRoute roles={["admin"]}>
            <Layout><Banquet /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/daily-sheet" element={
          <ProtectedRoute>
            <Layout><DailySheet /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute roles={["admin"]}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

