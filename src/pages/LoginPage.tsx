import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prijava nije uspela.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow">
        <h1 className="text-2xl font-semibold text-text-h">Prijava</h1>
        <p className="mt-1 text-sm text-text">Prijavite se na svoj nalog za plan ishrane.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <p
              className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-text-h">Imejl</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-h">Lozinka</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Prijavljivanje…' : 'Prijavi se'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text">
          Nemate nalog?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Registracija
          </Link>
        </p>
      </section>
    </main>
  )
}
