import { macroLabel, toDisplayMacro } from '../hooks/useIngredients'
import { unitLabel } from '../lib/unitDisplay'
import type { Ingredient } from '../types'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

type IngredientCardListProps = {
  ingredients: Ingredient[]
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredient: Ingredient) => void
}

export function IngredientCardList({
  ingredients,
  onEdit,
  onDelete,
}: IngredientCardListProps) {
  return (
    <ul className="space-y-3">
      {ingredients.map((ingredient) => (
        <li
          key={ingredient.id}
          className="rounded-xl border border-border bg-surface p-4 shadow"
        >
          <h2 className="font-semibold text-text-h">{ingredient.name}</h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text">Tip</dt>
              <dd className="text-right font-medium text-text-h">
                {ingredient.ingredientTypeName ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text">Kalorije</dt>
              <dd className="text-right font-medium text-text-h">
                {toDisplayMacro(ingredient.calories, ingredient.unit)}{' '}
                <span className="text-xs font-normal text-text/80">
                  ({macroLabel(ingredient.unit)})
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text">Proteini</dt>
              <dd className="text-right font-medium text-text-h">
                {toDisplayMacro(ingredient.protein, ingredient.unit)}{' '}
                <span className="text-xs font-normal text-text/80">
                  ({macroLabel(ingredient.unit)})
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text">Jedinica</dt>
              <dd className="font-medium text-text-h">{unitLabel(ingredient.unit)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onEdit(ingredient)}
              className={actionButtonClassName}
            >
              Izmeni
            </button>
            <button
              type="button"
              onClick={() => onDelete(ingredient)}
              className={`${actionButtonClassName} border-danger-border text-danger hover:bg-danger-bg`}
            >
              Obriši
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

