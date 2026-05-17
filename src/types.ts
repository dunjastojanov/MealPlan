import type { Session } from '@supabase/supabase-js'

export type User = {
  id: string
  first_name: string
  last_name: string
  calorie_goal: number
  protein_goal: number
}

export type RegisterInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  calorieGoal: number
  proteinGoal: number
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthResult = {
  session: Session
  user: User
}

export type IngredientUnit = 'g' | 'piece'

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type IngredientType = {
  id: string
  number: number
  name: string
}

export type MealOption = {
  id: string
  name: string
}

export type Ingredient = {
  id: string
  name: string
  calories: number
  protein: number
  unit: IngredientUnit
  ingredientTypeId: string | null
  ingredientTypeName: string | null
  ingredientTypeNumber: number | null
  recipeId: string | null
}

export type MealIngredientLine = {
  id: string
  ingredientId: string
  ingredientName: string
  amount: number
}

export type Meal = {
  id: string
  name: string
  preparation: string | null
  ingredients: MealIngredientLine[]
  calories: number
  protein: number
}

export type DailyMealPlanSummary = {
  id: string
  userId: string
  userName: string
  dayOfWeek: DayOfWeek
  createdAt: string
  mealNames: string[]
  mealIds: string[]
  totalCalories: number
  totalProtein: number
}

export type MealPlanMeal = {
  id: string
  mealId: string
  mealName: string
  sortOrder: number
  calories: number
  protein: number
}

export type DailyMealPlanDetail = {
  id: string
  userId: string
  dayOfWeek: DayOfWeek
  createdAt: string
  meals: MealPlanMeal[]
}

export type DailyMealPlanUpdatePayload = {
  dayOfWeek: DayOfWeek
  mealIds: string[]
}
