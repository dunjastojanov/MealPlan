import type { DailyMealPlanDetail, DailyMealPlanUpdatePayload, DayOfWeek } from '../types'

export type MealPlanFormValues = {
  userId: string
  dayOfWeek: DayOfWeek
  mealIds: string[]
}

export function detailToFormValues(detail: DailyMealPlanDetail): MealPlanFormValues {
  return {
    userId: detail.userId,
    dayOfWeek: detail.dayOfWeek,
    mealIds: detail.meals.map((meal) => meal.mealId),
  }
}

export function addMealToForm(form: MealPlanFormValues, mealId: string): MealPlanFormValues {
  return { ...form, mealIds: [...form.mealIds, mealId] }
}

export function removeMealFromForm(form: MealPlanFormValues, index: number): MealPlanFormValues {
  return {
    ...form,
    mealIds: form.mealIds.filter((_, mealIndex) => mealIndex !== index),
  }
}

export function formValuesToUpdatePayload(form: MealPlanFormValues): DailyMealPlanUpdatePayload {
  return {
    dayOfWeek: form.dayOfWeek,
    mealIds: form.mealIds,
  }
}

export function mealPlanUpdateEquals(
  original: DailyMealPlanDetail,
  payload: DailyMealPlanUpdatePayload,
): boolean {
  const originalMeals = original.meals.map((meal) => meal.mealId)

  if (originalMeals.length !== payload.mealIds.length) {
    return false
  }

  for (let index = 0; index < originalMeals.length; index += 1) {
    if (originalMeals[index] !== payload.mealIds[index]) {
      return false
    }
  }

  return true
}
