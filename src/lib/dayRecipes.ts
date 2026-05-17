import type { ShoppingListItem } from './shoppingList'
import type {
  DailyMealPlanSummary,
  DayOfWeek,
  Ingredient,
  IngredientUnit,
  Meal,
} from '../types'

export type PersonPortions = {
  userId: string
  userName: string
  portions: number
}

export type DayRecipe = {
  mealId: string
  mealName: string
  preparation: string | null
  portionsByPerson: PersonPortions[]
  totalPortions: number
  ingredients: ShoppingListItem[]
}

function scaleMealIngredients(
  meal: Meal,
  totalPortions: number,
  ingredientById: Map<string, Ingredient>,
): ShoppingListItem[] {
  const totals = new Map<
    string,
    { amount: number; name: string; unit: IngredientUnit }
  >()

  for (const line of meal.ingredients) {
    const catalogItem = ingredientById.get(line.ingredientId)
    const unit = catalogItem?.unit ?? 'g'
    const name = catalogItem?.name ?? line.ingredientName
    const scaledAmount = line.amount * totalPortions
    const existing = totals.get(line.ingredientId)

    if (existing) {
      existing.amount += scaledAmount
    } else {
      totals.set(line.ingredientId, { amount: scaledAmount, name, unit })
    }
  }

  return [...totals.entries()]
    .map(([ingredientId, { amount, name, unit }]) => ({
      ingredientId,
      name,
      amount,
      unit,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sr'))
}

export function buildDayRecipes(
  day: DayOfWeek,
  plans: DailyMealPlanSummary[],
  meals: Meal[],
  ingredients: Ingredient[],
): DayRecipe[] {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]))
  const ingredientById = new Map(ingredients.map((item) => [item.id, item]))

  const portionsByMeal = new Map<
    string,
    Map<string, { userName: string; portions: number }>
  >()

  for (const plan of plans) {
    if (plan.dayOfWeek !== day) {
      continue
    }

    for (const mealId of plan.mealIds) {
      const byUser = portionsByMeal.get(mealId) ?? new Map()
      const existing = byUser.get(plan.userId)

      if (existing) {
        existing.portions += 1
      } else {
        byUser.set(plan.userId, { userName: plan.userName, portions: 1 })
      }

      portionsByMeal.set(mealId, byUser)
    }
  }

  const recipes: DayRecipe[] = []

  for (const [mealId, byUser] of portionsByMeal) {
    const meal = mealsById.get(mealId)
    if (!meal) {
      continue
    }

    const portionsByPerson = [...byUser.entries()]
      .map(([userId, { userName, portions }]) => ({
        userId,
        userName,
        portions,
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName, 'sr'))

    const totalPortions = portionsByPerson.reduce((sum, item) => sum + item.portions, 0)

    recipes.push({
      mealId,
      mealName: meal.name,
      preparation: meal.preparation,
      portionsByPerson,
      totalPortions,
      ingredients: scaleMealIngredients(meal, totalPortions, ingredientById),
    })
  }

  return recipes.sort((a, b) => a.mealName.localeCompare(b.mealName, 'sr'))
}
