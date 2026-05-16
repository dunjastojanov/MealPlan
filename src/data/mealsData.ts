import mealsJson from '../../meals.json'
import ingredientsJson from '../../ingredients.json'
import type { Ingredient, Meal } from '../types'
import { buildIngredientMap, sumNutrients } from '../lib/nutrition'

export const meals: Meal[] = mealsJson as Meal[]

export const ingredientMap: Map<string, Ingredient> = buildIngredientMap(
  ingredientsJson as Ingredient[],
)

export const mealsById = new Map(meals.map((m) => [m.id, m]))

export function getMealTotals(meal: Meal) {
  return {
    female: sumNutrients(meal.ingredients_female, ingredientMap),
    male: sumNutrients(meal.ingredients_male, ingredientMap),
  }
}
