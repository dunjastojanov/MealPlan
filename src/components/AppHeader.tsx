import { useEffect, useId, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent-soft text-accent'
      : 'text-text hover:bg-accent-soft hover:text-text-h',
  ].join(' ')

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex min-h-11 w-full items-center rounded-lg px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent-soft text-accent'
      : 'text-text hover:bg-accent-soft hover:text-text-h',
  ].join(' ')

const navItems = [
  { to: '/', end: true, label: 'Početna' },
  { to: '/ingredients', end: false, label: 'Sastojci' },
  { to: '/ingredient-types', end: false, label: 'Tipovi' },
  { to: '/meals', end: false, label: 'Obroci' },
  { to: '/meal-plans', end: false, label: 'Planovi' },
] as const

export function AppHeader() {
  const user = useUser()!
  const { logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      // Keep user on page if logout fails
    }
  }

  return (
    <header className="border-b border-border bg-surface shadow">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <NavLink to="/" className="shrink-0 text-lg font-semibold text-text-h hover:text-accent">
              Plan ishrane
            </NavLink>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Glavna navigacija">
              {navItems.map(({ to, end, label }) => (
                <NavLink key={to} to={to} end={end} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text sm:inline">
              {user.first_name} {user.last_name}
            </span>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-soft md:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? 'Zatvori' : 'Meni'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Odjavljivanje…' : 'Odjava'}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id={menuId}
            className="mt-3 flex flex-col gap-1 border-t border-border pt-3 md:hidden"
            aria-label="Glavna navigacija"
          >
            {navItems.map(({ to, end, label }) => (
              <NavLink key={to} to={to} end={end} className={mobileNavLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
