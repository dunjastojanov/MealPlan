import type { IngredientUnit } from '../types'

export function unitLabel(unit: IngredientUnit) {
  return unit === 'g' ? 'g' : 'komad'
}
