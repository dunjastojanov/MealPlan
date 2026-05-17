export function AuthLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-bg text-text"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-text-h">Učitavanje…</p>
    </main>
  )
}
