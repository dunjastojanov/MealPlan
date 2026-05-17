import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useUser() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useUser must be used within AuthProvider')
  }

  return ctx.user
}
