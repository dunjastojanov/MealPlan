import { unitLabel } from './unitDisplay'
import type { IngredientUnit } from '../types'

export function parseMealAmount(display: string): number {
  const amount = Number.parseFloat(display.trim())
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Svaka količina mora biti pozitivan broj.')
  }
  return amount
}

export function formatPreviousAmount(amount: number, unit: IngredientUnit): string {
  return `${amount} ${unitLabel(unit)}`
}

export function mealAmountLabel(unit: IngredientUnit) {
  return unit === 'g' ? 'Količina (g)' : 'Količina (kom)'
}
