import type { Ingredient, IngredientUnit } from '../types'
import type { IngredientUpdate } from '../services/ingredientService'

export type IngredientFormValues = {
  name: string
  calories: string
  protein: string
  unit: IngredientUnit
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
  }
}

export function ingredientToFormValues(ingredient: Ingredient): IngredientFormValues {
  return {
    name: ingredient.name,
    calories: toDisplayMacro(ingredient.calories, ingredient.unit),
    protein: toDisplayMacro(ingredient.protein, ingredient.unit),
    unit: ingredient.unit,
  }
}

export function formValuesToUpdate(form: IngredientFormValues): IngredientUpdate {
  const name = form.name.trim()
  if (!name) {
    throw new Error('Naziv je obavezan.')
  }

  return {
    name,
    calories: fromDisplayMacro(form.calories, form.unit),
    protein: fromDisplayMacro(form.protein, form.unit),
    unit: form.unit,
  }
}
