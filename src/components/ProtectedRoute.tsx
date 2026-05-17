import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthLoading } from './AuthLoading'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { initializing } = useAuth()
  const user = useUser()
  const location = useLocation()

  if (initializing) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
