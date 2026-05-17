import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const inputClassName =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent'

export function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [calorieGoal, setCalorieGoal] = useState('')
  const [proteinGoal, setProteinGoal] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const calorieGoalNum = Number(calorieGoal)
    const proteinGoalNum = Number(proteinGoal)

    if (!Number.isFinite(calorieGoalNum) || calorieGoalNum <= 0) {
      setError('Cilj kalorija mora biti veći od nule.')
      return
    }

    if (!Number.isFinite(proteinGoalNum) || proteinGoalNum <= 0) {
      setError('Cilj proteina mora biti veći od nule.')
      return
    }

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        calorieGoal: calorieGoalNum,
        proteinGoal: proteinGoalNum,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registracija nije uspela.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow">
        <h1 className="text-2xl font-semibold text-text-h">Kreiranje naloga</h1>
        <p className="mt-1 text-sm text-text">Podesite profil i dnevne ciljeve.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <p
              className="rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-text-h">Ime</span>
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Prezime</span>
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClassName}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-text-h">Imejl</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-h">Lozinka</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-text-h">Cilj kalorija</span>
              <input
                type="number"
                name="calorieGoal"
                required
                min={1}
                step={1}
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-h">Cilj proteina (g)</span>
              <input
                type="number"
                name="proteinGoal"
                required
                min={1}
                step={1}
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className={inputClassName}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Kreiranje naloga…' : 'Kreiraj nalog'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text">
          Već imate nalog?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Prijava
          </Link>
        </p>
      </section>
    </main>
  )
}
