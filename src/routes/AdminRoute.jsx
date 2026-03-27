import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/ui/PageLoader'

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
