import { computeMealMacros, sumMealMacros } from '../lib/mealMacros'
import { supabase } from '../lib/supabase'
import type {
  DailyMealPlanDetail,
  DailyMealPlanSummary,
  DailyMealPlanUpdatePayload,
  DayOfWeek,
  MealPlanMeal,
} from '../types'

export type { DailyMealPlanUpdatePayload } from '../types'

const DUPLICATE_DAY_MESSAGE = 'Ovaj član već ima plan za izabrani dan.'

function mapSupabaseError(error: { code?: string; message: string }): Error {
  if (error.code === '23505') {
    return new Error(DUPLICATE_DAY_MESSAGE)
  }

  return new Error(error.message)
}

const dailyPlanListSelect = `
  id,
  user_id,
  day_of_week,
  created_at,
  users (
    first_name,
    last_name
  ),
  daily_meal_plan_meals (
    id,
    sort_order,
    meal_id,
    meals (
      id,
      name,
      meal_ingredients (
        amount,
        ingredients (
          calories,
          protein
        )
      )
    )
  )
`

const dailyPlanDetailSelect = `
  id,
  user_id,
  day_of_week,
  created_at,
  daily_meal_plan_meals (
    id,
    sort_order,
    meal_id,
    meals (
      id,
      name,
      meal_ingredients (
        amount,
        ingredients (
          calories,
          protein
        )
      )
    )
  )
`

type IngredientEmbed = {
  calories: number | string
  protein: number | string
}

type MealIngredientRow = {
  amount: number | string
  ingredients: IngredientEmbed | IngredientEmbed[] | null
}

type MealEmbed = {
  id: string
  name: string
  meal_ingredients: MealIngredientRow[] | null
}

type DailyMealPlanMealRow = {
  id: string
  sort_order: number
  meal_id: string
  meals: MealEmbed | MealEmbed[] | null
}

type DailyMealPlanRow = {
  id: string
  user_id: string
  day_of_week: DayOfWeek
  created_at: string
  daily_meal_plan_meals: DailyMealPlanMealRow[] | null
}

type DailyMealPlanListRow = {
  id: string
  user_id: string
  day_of_week: DayOfWeek
  created_at: string
  users: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
  daily_meal_plan_meals: DailyMealPlanMealRow[] | null
}

function resolveSingle<T>(value: T | T[] | null): T | null {
  if (value == null) {
    return null
  }
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function resolveIngredient(
  ingredients: MealIngredientRow['ingredients'],
): IngredientEmbed | null {
  return resolveSingle(ingredients)
}

function mapMealEmbed(meal: MealEmbed): { calories: number; protein: number } {
  const macroLines = (meal.meal_ingredients ?? [])
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

  return computeMealMacros(macroLines)
}

function mapDailyMealRow(row: DailyMealPlanMealRow): MealPlanMeal | null {
  const meal = resolveSingle(row.meals)
  if (!meal) {
    return null
  }

  const { calories, protein } = mapMealEmbed(meal)

  return {
    id: row.id,
    mealId: row.meal_id,
    mealName: meal.name,
    sortOrder: row.sort_order,
    calories,
    protein,
  }
}

function mapDailyPlanDetail(row: DailyMealPlanRow): DailyMealPlanDetail {
  const meals = (row.daily_meal_plan_meals ?? [])
    .map((line) => mapDailyMealRow(line))
    .filter((meal): meal is MealPlanMeal => meal != null)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return {
    id: row.id,
    userId: row.user_id,
    dayOfWeek: row.day_of_week,
    createdAt: row.created_at,
    meals,
  }
}

export function dailyPlanDetailToSummary(
  detail: DailyMealPlanDetail,
  userName: string,
): DailyMealPlanSummary {
  const totals = sumMealMacros(detail.meals)

  return {
    id: detail.id,
    userId: detail.userId,
    userName,
    dayOfWeek: detail.dayOfWeek,
    createdAt: detail.createdAt,
    mealNames: detail.meals.map((meal) => meal.mealName),
    mealIds: detail.meals.map((meal) => meal.mealId),
    totalCalories: totals.calories,
    totalProtein: totals.protein,
  }
}

function mapDailyPlanSummary(row: DailyMealPlanListRow): DailyMealPlanSummary {
  const user = resolveSingle(row.users)
  const userName = user ? `${user.first_name} ${user.last_name}` : row.user_id
  const detail = mapDailyPlanDetail(row as unknown as DailyMealPlanRow)

  return dailyPlanDetailToSummary(detail, userName)
}

export async function fetchDailyMealPlans(): Promise<DailyMealPlanSummary[]> {
  const { data, error } = await supabase
    .from('daily_meal_plans')
    .select(dailyPlanListSelect)
    .order('created_at', { ascending: false })

  if (error) {
    throw mapSupabaseError(error)
  }

  return (data ?? []).map((row) => mapDailyPlanSummary(row as unknown as DailyMealPlanListRow))
}

export async function fetchDailyMealPlan(id: string): Promise<DailyMealPlanDetail> {
  const { data, error } = await supabase
    .from('daily_meal_plans')
    .select(dailyPlanDetailSelect)
    .eq('id', id)
    .single()

  if (error) {
    throw mapSupabaseError(error)
  }

  return mapDailyPlanDetail(data as unknown as DailyMealPlanRow)
}

async function replaceDailyMeals(dailyPlanId: string, mealIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('daily_meal_plan_meals')
    .delete()
    .eq('daily_meal_plan_id', dailyPlanId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (mealIds.length === 0) {
    return
  }

  const { error: insertError } = await supabase.from('daily_meal_plan_meals').insert(
    mealIds.map((mealId, index) => ({
      daily_meal_plan_id: dailyPlanId,
      meal_id: mealId,
      sort_order: index,
    })),
  )

  if (insertError) {
    throw new Error(insertError.message)
  }
}

export async function clearDailyMealPlanMeals(id: string): Promise<DailyMealPlanDetail> {
  await replaceDailyMeals(id, [])
  return fetchDailyMealPlan(id)
}

export async function updateDailyMealPlan(
  id: string,
  payload: DailyMealPlanUpdatePayload,
): Promise<DailyMealPlanDetail> {
  const existing = await fetchDailyMealPlan(id)
  const existingMealIds = existing.meals.map((meal) => meal.mealId)

  if (existing.dayOfWeek !== payload.dayOfWeek) {
    const { error } = await supabase
      .from('daily_meal_plans')
      .update({ day_of_week: payload.dayOfWeek })
      .eq('id', id)

    if (error) {
      throw mapSupabaseError(error)
    }
  }

  const mealsUnchanged =
    existingMealIds.length === payload.mealIds.length &&
    existingMealIds.every((mealId, index) => mealId === payload.mealIds[index])

  if (!mealsUnchanged) {
    await replaceDailyMeals(id, payload.mealIds)
  }

  return fetchDailyMealPlan(id)
}
