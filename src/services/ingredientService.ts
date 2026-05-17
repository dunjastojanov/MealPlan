import { supabase } from '../lib/supabase'
import type { Ingredient, IngredientUnit } from '../types'

export type IngredientUpdate = {
  name: string
  calories: number
  protein: number
  unit: IngredientUnit
  ingredient_type_id: string | null
  recipe_id: string | null
}

export type IngredientMealUsage = {
  mealIngredientId: string
  mealName: string
  amount: number
}

type MealEmbed = { name: string } | { name: string }[] | null

type IngredientTypeEmbed =
  | { id: string; number: number; name: string }
  | { id: string; number: number; name: string }[]
  | null

const ingredientSelect = `
  id,
  name,
  calories,
  protein,
  unit,
  ingredient_type_id,
  recipe_id,
  ingredient_type (
    id,
    number,
    name
  )
`

function resolveIngredientType(embed: IngredientTypeEmbed): {
  ingredientTypeId: string | null
  ingredientTypeName: string | null
  ingredientTypeNumber: number | null
} {
  if (embed == null) {
    return {
      ingredientTypeId: null,
      ingredientTypeName: null,
      ingredientTypeNumber: null,
    }
  }

  const type = Array.isArray(embed) ? (embed[0] ?? null) : embed
  if (!type) {
    return {
      ingredientTypeId: null,
      ingredientTypeName: null,
      ingredientTypeNumber: null,
    }
  }

  return {
    ingredientTypeId: type.id,
    ingredientTypeName: type.name,
    ingredientTypeNumber: type.number,
  }
}

function mapIngredientRow(row: {
  id: string
  name: string
  calories: number | string
  protein: number | string
  unit: string
  ingredient_type_id: string | null
  recipe_id: string | null
  ingredient_type: IngredientTypeEmbed
}): Ingredient {
  const typeFields = resolveIngredientType(row.ingredient_type)

  return {
    id: row.id,
    name: row.name,
    calories: Number(row.calories),
    protein: Number(row.protein),
    unit: row.unit as Ingredient['unit'],
    ingredientTypeId: row.ingredient_type_id ?? typeFields.ingredientTypeId,
    ingredientTypeName: typeFields.ingredientTypeName,
    ingredientTypeNumber: typeFields.ingredientTypeNumber,
    recipeId: row.recipe_id,
  }
}

function resolveMealName(meals: MealEmbed): string | null {
  if (meals == null) {
    return null
  }
  const meal = Array.isArray(meals) ? (meals[0] ?? null) : meals
  return meal?.name ?? null
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select(ingredientSelect)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapIngredientRow(row))
}

export async function createIngredient(update: IngredientUpdate): Promise<Ingredient> {
  const { data, error } = await supabase
    .from('ingredients')
    .insert(update)
    .select(ingredientSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapIngredientRow(data)
}

export async function updateIngredient(
  id: string,
  update: IngredientUpdate,
): Promise<Ingredient> {
  const { data, error } = await supabase
    .from('ingredients')
    .update(update)
    .eq('id', id)
    .select(ingredientSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapIngredientRow(data)
}

export async function fetchIngredientMealUsages(
  ingredientId: string,
): Promise<IngredientMealUsage[]> {
  const { data, error } = await supabase
    .from('meal_ingredients')
    .select('id, amount, meals ( name )')
    .eq('ingredient_id', ingredientId)

  if (error) {
    throw new Error(error.message)
  }

  const usages: IngredientMealUsage[] = []

  for (const row of data ?? []) {
    const mealName = resolveMealName(row.meals as MealEmbed)
    if (!mealName) {
      continue
    }
    usages.push({
      mealIngredientId: row.id,
      mealName,
      amount: Number(row.amount),
    })
  }

  return usages.sort((a, b) => a.mealName.localeCompare(b.mealName))
}

export async function updateMealIngredientAmounts(
  updates: { id: string; amount: number }[],
): Promise<void> {
  if (updates.length === 0) {
    return
  }

  const results = await Promise.all(
    updates.map(({ id, amount }) =>
      supabase.from('meal_ingredients').update({ amount }).eq('id', id),
    ),
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(failed.error.message)
  }
}

export async function deleteIngredient(id: string): Promise<void> {
  const { error } = await supabase.from('ingredients').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
