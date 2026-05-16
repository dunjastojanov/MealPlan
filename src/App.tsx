import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Layout } from './pages/Layout'
import { Dashboard } from './pages/Dashboard'
import { MealDetail } from './pages/MealDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="meal/:id" element={<MealDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
