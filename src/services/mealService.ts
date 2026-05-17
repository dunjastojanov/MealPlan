import { computeMealMacros } from '../lib/mealMacros'
import { supabase } from '../lib/supabase'
import type { IngredientUnit, Meal, MealIngredientLine, MealOption } from '../types'

export type MealIngredientUpdate = {
  ingredientId: string
  amount: number
}

export type MealUpdate = {
  name: string
  preparation: string | null
  ingredients: MealIngredientUpdate[]
}

const mealSelect = `
  id,
  name,
  preparation,
  meal_ingredients (
    id,
    amount,
    ingredients (
      id,
      name,
      calories,
      protein,
      unit
    )
  )
`

type IngredientEmbed = {
  id: string
  name: string
  calories: number | string
  protein: number | string
  unit: IngredientUnit
}

type MealIngredientRow = {
  id: string
  amount: number | string
  ingredients: IngredientEmbed | IngredientEmbed[] | null
}

function resolveIngredient(
  ingredients: MealIngredientRow['ingredients'],
): IngredientEmbed | null {
  if (ingredients == null) {
    return null
  }
  return Array.isArray(ingredients) ? (ingredients[0] ?? null) : ingredients
}

type MealRow = {
  id: string
  name: string
  preparation: string | null
  meal_ingredients: MealIngredientRow[] | null
}

function mapMealRow(row: MealRow): Meal {
  const ingredients: MealIngredientLine[] = (row.meal_ingredients ?? [])
    .map((line) => {
      const ingredient = resolveIngredient(line.ingredients)
      if (!ingredient) {
        return null
      }
      return {
        id: line.id,
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        amount: Number(line.amount),
      }
    })
    .filter((line): line is MealIngredientLine => line != null)
    .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName))

  const macroLines = (row.meal_ingredients ?? [])
    .map((line) => {
      const ingredient = resolveIngredient(line.ingredients)
      if (!ingredient) {
        return null
      }
      return {
        calories: Number(ingredient.calories),
        protein: Number(ingredient.protein),
        amount: Number(line.amount),
      }
    })
    .filter((line): line is { calories: number; protein: number; amount: number } => line != null)

  const { calories, protein } = computeMealMacros(macroLines)

  return {
    id: row.id,
    name: row.name,
    preparation: row.preparation,
    ingredients,
    calories,
    protein,
  }
}

export async function fetchMealOptions(): Promise<MealOption[]> {
  const { data, error } = await supabase.from('meals').select('id, name').order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function fetchMeals(): Promise<Meal[]> {
  const { data, error } = await supabase
    .from('meals')
    .select(mealSelect)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapMealRow(row as unknown as MealRow))
}

async function fetchMealById(id: string): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .select(mealSelect)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapMealRow(data as unknown as MealRow)
}

export async function createMeal(update: MealUpdate): Promise<Meal> {
  const { data, error } = await supabase
    .from('meals')
    .insert({
      name: update.name,
      preparation: update.preparation,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (update.ingredients.length > 0) {
    const { error: insertError } = await supabase.from('meal_ingredients').insert(
      update.ingredients.map((line) => ({
        meal_id: data.id,
        ingredient_id: line.ingredientId,
        amount: line.amount,
      })),
    )

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return fetchMealById(data.id)
}

export async function updateMeal(id: string, update: MealUpdate): Promise<Meal> {
  const { error: mealError } = await supabase
    .from('meals')
    .update({
      name: update.name,
      preparation: update.preparation,
    })
    .eq('id', id)

  if (mealError) {
    throw new Error(mealError.message)
  }

  const { error: deleteError } = await supabase
    .from('meal_ingredients')
    .delete()
    .eq('meal_id', id)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (update.ingredients.length > 0) {
    const { error: insertError } = await supabase.from('meal_ingredients').insert(
      update.ingredients.map((line) => ({
        meal_id: id,
        ingredient_id: line.ingredientId,
        amount: line.amount,
      })),
    )

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return fetchMealById(id)
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
