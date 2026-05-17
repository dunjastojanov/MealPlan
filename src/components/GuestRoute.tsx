import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthLoading } from './AuthLoading'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'

type GuestRouteProps = {
  children: ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { initializing } = useAuth()
  const user = useUser()

  if (initializing) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
