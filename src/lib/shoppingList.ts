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

export type ShoppingListSection = {
  typeName: string
  typeNumber: number
  items: ShoppingListItem[]
}

const UNTYPED_SECTION_NUMBER = 9999
const UNTYPED_SECTION_NAME = 'Bez tipa'

type TotalEntry = {
  amount: number
  name: string
  unit: IngredientUnit
  typeNumber: number
  typeName: string
}

type ShoppingListContext = {
  totals: Map<string, TotalEntry>
  mealsById: Map<string, Meal>
  ingredientById: Map<string, Ingredient>
  visitedRecipeIds: Set<string>
}

export function formatIngredientAmount(amount: number, unit: IngredientUnit): string {
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(1)
  return unit === 'g' ? `${formatted} g` : `${formatted} kom`
}

export function formatShoppingListLine(item: ShoppingListItem): string {
  return `${item.name} (${formatIngredientAmount(item.amount, item.unit)})`
}

export function formatShoppingListForCopy(sections: ShoppingListSection[]): string {
  return sections.flatMap((section) => section.items.map(formatShoppingListLine)).join('\n')
}

export function computeRecipeYield(meal: Meal): number {
  return meal.ingredients.reduce((sum, line) => sum + line.amount, 0)
}

function addToTotals(
  totals: Map<string, TotalEntry>,
  ingredientById: Map<string, Ingredient>,
  ingredientId: string,
  amount: number,
  fallbackName?: string,
): void {
  const catalogItem = ingredientById.get(ingredientId)
  const unit = catalogItem?.unit ?? 'g'
  const name = catalogItem?.name ?? fallbackName ?? 'Nepoznat sastojak'
  const typeNumber = catalogItem?.ingredientTypeNumber ?? UNTYPED_SECTION_NUMBER
  const typeName = catalogItem?.ingredientTypeName ?? UNTYPED_SECTION_NAME
  const existing = totals.get(ingredientId)

  if (existing) {
    existing.amount += amount
  } else {
    totals.set(ingredientId, { amount, name, unit, typeNumber, typeName })
  }
}

function addDemand(
  ingredientId: string,
  amount: number,
  context: ShoppingListContext,
  fallbackName?: string,
): void {
  const catalogItem = context.ingredientById.get(ingredientId)

  if (!catalogItem?.recipeId) {
    addToTotals(
      context.totals,
      context.ingredientById,
      ingredientId,
      amount,
      fallbackName,
    )
    return
  }

  const recipeId = catalogItem.recipeId
  const recipe = context.mealsById.get(recipeId)
  const recipeYield = recipe ? computeRecipeYield(recipe) : 0

  if (
    !recipe?.ingredients.length ||
    recipeYield <= 0 ||
    context.visitedRecipeIds.has(recipeId)
  ) {
    addToTotals(
      context.totals,
      context.ingredientById,
      ingredientId,
      amount,
      fallbackName ?? catalogItem.name,
    )
    return
  }

  context.visitedRecipeIds.add(recipeId)
  const scale = amount / recipeYield

  for (const line of recipe.ingredients) {
    addDemand(line.ingredientId, line.amount * scale, context, line.ingredientName)
  }

  context.visitedRecipeIds.delete(recipeId)
}

export function buildShoppingList(
  plans: DailyMealPlanSummary[],
  meals: Meal[],
  ingredients: Ingredient[],
): ShoppingListSection[] {
  const mealsById = new Map(meals.map((meal) => [meal.id, meal]))
  const ingredientById = new Map(ingredients.map((item) => [item.id, item]))
  const totals = new Map<string, TotalEntry>()

  for (const plan of plans) {
    for (const mealId of plan.mealIds) {
      const meal = mealsById.get(mealId)
      if (!meal) {
        continue
      }

      for (const line of meal.ingredients) {
        addDemand(line.ingredientId, line.amount, {
          totals,
          mealsById,
          ingredientById,
          visitedRecipeIds: new Set(),
        }, line.ingredientName)
      }
    }
  }

  const sectionsByNumber = new Map<number, ShoppingListSection>()

  for (const [ingredientId, { amount, name, unit, typeNumber, typeName }] of totals) {
    const section =
      sectionsByNumber.get(typeNumber) ??
      (() => {
        const created: ShoppingListSection = { typeName, typeNumber, items: [] }
        sectionsByNumber.set(typeNumber, created)
        return created
      })()

    section.items.push({ ingredientId, name, amount, unit })
  }

  return [...sectionsByNumber.values()]
    .sort((a, b) => a.typeNumber - b.typeNumber)
    .map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) => a.name.localeCompare(b.name, 'sr')),
    }))
}
