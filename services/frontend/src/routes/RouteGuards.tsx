import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingScreen } from '../components/common/LoadingScreen'

type GuardProps = {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return <LoadingScreen />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export const PublicRoute = ({ children }: GuardProps) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return <LoadingScreen />
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
