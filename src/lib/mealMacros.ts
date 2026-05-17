export type MacroIngredient = {
  calories: number
  protein: number
  amount: number
}

export function computeMealMacros(ingredients: MacroIngredient[]) {
  return ingredients.reduce(
    (totals, line) => ({
      calories: totals.calories + line.calories * line.amount,
      protein: totals.protein + line.protein * line.amount,
    }),
    { calories: 0, protein: 0 },
  )
}

export function formatMealCalories(value: number) {
  return `${Math.round(value)} kcal`
}

export function formatMealProtein(value: number) {
  const rounded = Math.round(value * 10) / 10
  return `${rounded} g proteina`
}

export function formatMealMacros(calories: number, protein: number) {
  return `${formatMealCalories(calories)} · ${formatMealProtein(protein)}`
}

export function sumMealMacros(items: { calories: number; protein: number }[]) {
  return items.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
    }),
    { calories: 0, protein: 0 },
  )
}
