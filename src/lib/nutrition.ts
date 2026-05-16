import type { Ingredient, IngredientLine } from '../types'

export function buildIngredientMap(
  ingredients: Ingredient[],
): Map<string, Ingredient> {
  return new Map(ingredients.map((i) => [i.id, i]))
}

/** Calories and protein for a single portion line (macros per 100 g in `ing`). */
export function nutrientsForLine(
  line: IngredientLine,
  map: Map<string, Ingredient>,
): { calories: number; protein: number } | null {
  const ing = map.get(line.ingredient_id)
  if (!ing) return null
  const factor = line.amount_g / 100
  return {
    calories: factor * ing.calories,
    protein: factor * ing.protein,
  }
}

export function sumNutrients(
  lines: IngredientLine[],
  map: Map<string, Ingredient>,
): { calories: number; protein: number } {
  let calories = 0
  let protein = 0
  for (const line of lines) {
    const part = nutrientsForLine(line, map)
    if (!part) continue
    calories += part.calories
    protein += part.protein
  }
  return { calories, protein }
}

export function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`
}

export function formatProteinG(value: number): string {
  return `${value.toFixed(1)} g`
}
