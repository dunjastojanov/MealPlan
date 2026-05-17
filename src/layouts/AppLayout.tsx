import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

