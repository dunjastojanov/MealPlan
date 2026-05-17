import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import {
  fetchUserProfile,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from '../services/authService'
import type { LoginInput, RegisterInput, User } from '../types'

export type AuthContextValue = {
  user: User | null
  /** True only while restoring session on first mount (route guards use this). */
  initializing: boolean
  /** True during login, register, or logout (form buttons use this). */
  loading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

async function resolveUserFromSession(
  session: Session | null,
): Promise<User | null> {
  if (!session?.user) {
    return null
  }

  try {
    return await fetchUserProfile(session.user.id)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }
        if (mounted) {
          setUser(await resolveUserFromSession(data.session))
        }
      } catch {
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION is handled by init(); defer other events to avoid getSession deadlocks.
      if (event === 'INITIAL_SESSION') {
        return
      }

      setTimeout(() => {
        if (!mounted) {
          return
        }

        if (event === 'SIGNED_OUT') {
          setUser(null)
          return
        }

        void resolveUserFromSession(session).then((profile) => {
          if (mounted) {
            setUser(profile)
          }
        })
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true)
    try {
      const result = await loginService(input)
      setUser(result.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    setLoading(true)
    try {
      const result = await registerService(input)
      setUser(result.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await logoutService()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, initializing, loading, login, register, logout }),
    [user, initializing, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
