import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { IngredientsPage } from './pages/IngredientsPage'
import { LoginPage } from './pages/LoginPage'
import { DayRecipePage } from './pages/DayRecipePage'
import { MealPlansPage } from './pages/MealPlansPage'
import { MealsPage } from './pages/MealsPage'
import { RegisterPage } from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/meal-plans" element={<MealPlansPage />} />
        <Route path="/meal-plans/:dayOfWeek" element={<DayRecipePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
