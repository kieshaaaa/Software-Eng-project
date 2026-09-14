import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Nav from './components/Nav.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Feed from './pages/Feed.jsx'
import ReportForm from './pages/ReportForm.jsx'
import ItemDetail from './pages/ItemDetail.jsx'

function ProtectedShell() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="shell">
        <div className="page">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="shell">
      <Nav user={user} />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/report/lost" element={<ReportForm type="lost" />} />
        <Route path="/report/found" element={<ReportForm type="found" />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={!loading && isAuthenticated ? <Navigate to="/feed" replace /> : <div className="shell"><Login /></div>}
      />
      <Route
        path="/register"
        element={!loading && isAuthenticated ? <Navigate to="/feed" replace /> : <div className="shell"><Register /></div>}
      />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
