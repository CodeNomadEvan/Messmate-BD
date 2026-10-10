import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Meals from './pages/Meals'
import Members from './pages/Members'
import { useAuth } from './context/AuthContext'

function PrivateRoutes() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return <AppLayout />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/members" element={<Members />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}
