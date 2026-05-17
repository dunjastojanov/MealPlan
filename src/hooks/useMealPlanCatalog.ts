import { useEffect, useState } from 'react'
import { fetchMeals } from '../services/mealService'
import { fetchDailyMealPlans } from '../services/mealPlanService'
import { fetchIngredients } from '../services/ingredientService'
import { fetchUsers } from '../services/userService'
import type { DailyMealPlanSummary, Ingredient, Meal, User } from '../types'

export function useMealPlanCatalog() {
  const [plans, setPlans] = useState<DailyMealPlanSummary[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [plansData, usersData, mealsData, ingredientsData] = await Promise.all([
          fetchDailyMealPlans(),
          fetchUsers(),
          fetchMeals(),
          fetchIngredients(),
        ])
        if (!cancelled) {
          setPlans(plansData)
          setUsers(usersData)
          setMeals(mealsData)
          setIngredients(ingredientsData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Učitavanje podataka nije uspelo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return { plans, users, meals, ingredients, loading, error, setPlans }
}
