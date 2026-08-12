import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/ui/Loader'

export default function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth?.isLoading) return <Loader />

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
