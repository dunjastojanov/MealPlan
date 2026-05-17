export const MADE_INGREDIENT_TYPE_NAME = 'Napravljeno'

export function isMadeIngredientType(
  ingredientTypeId: string,
  ingredientTypes: { id: string; name: string }[],
): boolean {
  const type = ingredientTypes.find((item) => item.id === ingredientTypeId)
  return type?.name === MADE_INGREDIENT_TYPE_NAME
}
