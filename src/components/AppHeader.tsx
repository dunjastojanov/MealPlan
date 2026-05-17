import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../hooks/useUser'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent-soft text-accent'
      : 'text-text hover:bg-accent-soft hover:text-text-h',
  ].join(' ')

export function AppHeader() {
  const user = useUser()!
  const { logout, loading } = useAuth()
  const navigate = useNavigate()

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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <NavLink to="/" className="text-lg font-semibold text-text-h hover:text-accent">
            Plan ishrane
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Glavna navigacija">
            <NavLink to="/" end className={navLinkClass}>
              Početna
            </NavLink>
            <NavLink to="/ingredients" className={navLinkClass}>
              Sastojci
            </NavLink>
            <NavLink to="/meals" className={navLinkClass}>
              Obroci
            </NavLink>
            <NavLink to="/meal-plans" className={navLinkClass}>
              Planovi
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-text sm:inline">
            {user.first_name} {user.last_name}
          </span>
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
    </header>
  )
}