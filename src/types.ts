export interface IngredientLine {
  ingredient_id: string
  amount_g: number
}

import type { MealType } from './lib/mealTypes'

export type { MealType }

export interface Meal {
  id: string
  meal_type: MealType
  name: string
  preparation: string
  ingredients_female: IngredientLine[]
  ingredients_male: IngredientLine[]
}

export interface Ingredient {
  id: string
  name: string
  calories: number
  protein: number
}
