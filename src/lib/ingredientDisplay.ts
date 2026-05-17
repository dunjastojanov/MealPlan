import { isMadeIngredientType } from './ingredientType'
import type { Ingredient, IngredientType, IngredientUnit } from '../types'
import type { IngredientUpdate } from '../services/ingredientService'

export type IngredientFormValues = {
  name: string
  calories: string
  protein: string
  unit: IngredientUnit
  ingredientTypeId: string
  recipeId: string
}

export function toDisplayMacro(value: number, unit: IngredientUnit) {
  const scaled = unit === 'g' ? value * 100 : value
  return scaled.toFixed(unit === 'g' ? 1 : 2)
}

export function fromDisplayMacro(display: string, unit: IngredientUnit) {
  const parsed = Number.parseFloat(display.trim())
  if (!Number.isFinite(parsed)) {
    throw new Error('Kalorije i proteini moraju biti važeći brojevi.')
  }
  return unit === 'g' ? parsed / 100 : parsed
}

export function macroLabel(unit: IngredientUnit) {
  return unit === 'g' ? 'na 100 g' : 'po komadu'
}

export function emptyIngredientFormValues(): IngredientFormValues {
  return {
    name: '',
    calories: '',
    protein: '',
    unit: 'g',
    ingredientTypeId: '',
    recipeId: '',
  }
}

export function ingredientToFormValues(ingredient: Ingredient): IngredientFormValues {
  return {
    name: ingredient.name,
    calories: toDisplayMacro(ingredient.calories, ingredient.unit),
    protein: toDisplayMacro(ingredient.protein, ingredient.unit),
    unit: ingredient.unit,
    ingredientTypeId: ingredient.ingredientTypeId ?? '',
    recipeId: ingredient.recipeId ?? '',
  }
}

export function formValuesToUpdate(
  form: IngredientFormValues,
  ingredientTypes: IngredientType[],
): IngredientUpdate {
  const name = form.name.trim()
  if (!name) {
    throw new Error('Naziv je obavezan.')
  }

  if (!form.ingredientTypeId.trim()) {
    throw new Error('Tip je obavezan.')
  }

  const madeType = isMadeIngredientType(form.ingredientTypeId, ingredientTypes)
  const recipeId = madeType && form.recipeId.trim() ? form.recipeId : null

  return {
    name,
    calories: fromDisplayMacro(form.calories, form.unit),
    protein: fromDisplayMacro(form.protein, form.unit),
    unit: form.unit,
    ingredient_type_id: form.ingredientTypeId,
    recipe_id: recipeId,
  }
}
