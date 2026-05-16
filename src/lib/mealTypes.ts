export const MEAL_TYPES = ['breakfast', 'lunch_dinner', 'prep'] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch_dinner: 'Lunch & dinner',
  prep: 'Prep',
}
