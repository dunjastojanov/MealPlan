import { computeMealMacros } from './mealMacros'
import type { MealUpdate } from '../services/mealService'
import type { Ingredient, Meal } from '../types'

export type MealIngredientFormLine = {
  key: string
  ingredientId: string
  amount: string
}

export type MealFormValues = {
  name: string
  preparation: string
  ingredients: MealIngredientFormLine[]
}

function newIngredientLine(): MealIngredientFormLine {
  return {
    key: crypto.randomUUID(),
    ingredientId: '',
    amount: '',
  }
}

export function emptyMealFormValues(): MealFormValues {
  return {
    name: '',
    preparation: '',
    ingredients: [newIngredientLine()],
  }
}

export function mealToFormValues(meal: Meal): MealFormValues {
  return {
    name: meal.name,
    preparation: meal.preparation ?? '',
    ingredients: meal.ingredients.map((line) => ({
      key: line.id,
      ingredientId: line.ingredientId,
      amount: String(line.amount),
    })),
  }
}

export function addIngredientLine(form: MealFormValues): MealFormValues {
  return {
    ...form,
    ingredients: [...form.ingredients, newIngredientLine()],
  }
}

export function removeIngredientLine(
  form: MealFormValues,
  key: string,
): MealFormValues {
  return {
    ...form,
    ingredients: form.ingredients.filter((line) => line.key !== key),
  }
}

export function computeMealFormMacros(form: MealFormValues, catalog: Ingredient[]) {
  const macroLines = form.ingredients
    .map((line) => {
      if (!line.ingredientId) {
        return null
      }
      const ingredient = catalog.find((item) => item.id === line.ingredientId)
      if (!ingredient) {
        return null
      }
      const amount = Number.parseFloat(line.amount.trim())
      if (!Number.isFinite(amount) || amount <= 0) {
        return null
      }
      return {
        calories: ingredient.calories,
        protein: ingredient.protein,
        amount,
      }
    })
    .filter((line): line is { calories: number; protein: number; amount: number } => line != null)

  return computeMealMacros(macroLines)
}

export function formValuesToUpdate(form: MealFormValues): MealUpdate {
  const name = form.name.trim()
  if (!name) {
    throw new Error('Naziv je obavezan.')
  }

  if (form.ingredients.length === 0) {
    throw new Error('Dodajte bar jedan sastojak.')
  }

  const ingredients: MealUpdate['ingredients'] = []
  const seenIngredientIds = new Set<string>()

  for (const line of form.ingredients) {
    if (!line.ingredientId) {
      throw new Error('Izaberite sastojak za svaki red.')
    }

    const amount = Number.parseFloat(line.amount.trim())
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Svaka količina mora biti pozitivan broj.')
    }

    if (seenIngredientIds.has(line.ingredientId)) {
      throw new Error('Svaki sastojak može se pojaviti samo jednom po obroku.')
    }
    seenIngredientIds.add(line.ingredientId)

    ingredients.push({
      ingredientId: line.ingredientId,
      amount,
    })
  }

  const preparation = form.preparation.trim()

  return {
    name,
    preparation: preparation || null,
    ingredients,
  }
}

export function mealUpdateEquals(meal: Meal, update: MealUpdate) {
  if (meal.name !== update.name) {
    return false
  }

  const mealPreparation = meal.preparation ?? ''
  const updatePreparation = update.preparation ?? ''
  if (mealPreparation !== updatePreparation) {
    return false
  }

  if (meal.ingredients.length !== update.ingredients.length) {
    return false
  }

  const sortedMeal = [...meal.ingredients].sort((a, b) =>
    a.ingredientId.localeCompare(b.ingredientId),
  )
  const sortedUpdate = [...update.ingredients].sort((a, b) =>
    a.ingredientId.localeCompare(b.ingredientId),
  )

  return sortedMeal.every((line, index) => {
    const other = sortedUpdate[index]
    return (
      line.ingredientId === other.ingredientId &&
      line.amount === other.amount
    )
  })
}
