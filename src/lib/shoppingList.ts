import type {
  DailyMealPlanSummary,
  Ingredient,
  IngredientUnit,
  Meal,
} from '../types'

export type ShoppingListItem = {
  ingredientId: string
  name: string
  amount: number
  unit: IngredientUnit
}

export function formatIngredientAmount(amount: number, unit: IngredientUnit): string {
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(1)
  return unit === 'g' ? `${formatted} g` : `${formatted} kom`
}

export function formatShoppingListLine(item: ShoppingListItem): string {
  return `${item.name} (${formatIngredientAmount(item.amount, item.unit)})`
}

export function formatShoppingListForCopy(items: ShoppingListItem[]): string {
  return items.map(formatShoppingListLine).join('\n')
}

export function buildShoppingList(
  plans: DailyMealPlanSummary[],
  meals: Meal[],
  ingredients: Ingredient[],
): ShoppingListItem[] {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]))
  const ingredientById = new Map(ingredients.map((item) => [item.id, item]))

  const totals = new Map<
    string,
    { amount: number; name: string; unit: IngredientUnit }
  >()

  for (const plan of plans) {
    for (const mealId of plan.mealIds) {
      const meal = mealsById.get(mealId)
      if (!meal) {
        continue
      }

      for (const line of meal.ingredients) {
        const catalogItem = ingredientById.get(line.ingredientId)
        const unit = catalogItem?.unit ?? 'g'
        const name = catalogItem?.name ?? line.ingredientName
        const existing = totals.get(line.ingredientId)

        if (existing) {
          existing.amount += line.amount
        } else {
          totals.set(line.ingredientId, { amount: line.amount, name, unit })
        }
      }
    }
  }

  return [...totals.entries()]
    .map(([ingredientId, { amount, name, unit }]) => ({
      ingredientId,
      name,
      amount,
      unit,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
