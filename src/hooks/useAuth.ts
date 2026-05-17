import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  const { login, register, logout, initializing, loading } = ctx
  return { login, register, logout, initializing, loading }
}
