import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useMealPlanCatalog } from '../hooks/useMealPlanCatalog'
import { buildDayRecipes } from '../lib/dayRecipes'
import { dayOfWeekLabel, isDayOfWeek } from '../lib/dayOfWeek'
import { formatShoppingListLine } from '../lib/shoppingList'
import type { DayOfWeek } from '../types'

function formatPortionsLabel(count: number): string {
  if (count === 1) {
    return '1 porcija'
  }
  if (count >= 2 && count <= 4) {
    return `${count} porcije`
  }
  return `${count} porcija`
}

function DayRecipePageContent({ day }: { day: DayOfWeek }) {
  const { plans, meals, ingredients, loading, error } = useMealPlanCatalog()

  const recipes = useMemo(
    () => buildDayRecipes(day, plans, meals, ingredients),
    [day, plans, meals, ingredients],
  )

  return (
    <section>
      <div>
        <Link
          to="/meal-plans"
          className="text-sm font-medium text-accent transition-colors hover:underline"
        >
          ← Planovi ishrane
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-text-h sm:text-2xl">
          {dayOfWeekLabel(day)} — spojeni recepti
        </h1>
        <p className="mt-1 text-sm text-text">
          Zbir sastojaka po receptu za sve članove domaćinstva tog dana.
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-text">Učitavanje…</p>}

      {error && (
        <p
          className="mt-6 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && recipes.length === 0 && (
        <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-6 text-sm text-text shadow">
          Nema obroka u planovima za {dayOfWeekLabel(day).toLowerCase()}.
        </p>
      )}

      {!loading && !error && recipes.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {recipes.map((recipe) => (
            <article
              key={recipe.mealId}
              className="rounded-xl border border-border bg-surface shadow"
            >
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-semibold text-text-h">{recipe.mealName}</h2>
                <p className="mt-1 text-sm text-text">
                  <span className="font-medium text-text-h">Porcije: </span>
                  {recipe.portionsByPerson
                    .map((person) => `${person.userName}: ${person.portions}`)
                    .join(', ')}
                  {' · '}
                  Ukupno: {formatPortionsLabel(recipe.totalPortions)}
                </p>
              </div>

              <div className="px-4 py-3">
                {recipe.preparation && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-text-h">Priprema</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-text">
                      {recipe.preparation}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-text-h">Sastojci (zbir)</h3>
                  {recipe.ingredients.length === 0 ? (
                    <p className="mt-1 text-sm text-text">Nema navedenih sastojaka.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-border">
                      {recipe.ingredients.map((item) => (
                        <li key={item.ingredientId} className="py-2 text-sm text-text-h">
                          {formatShoppingListLine(item)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function DayRecipePage() {
  const { dayOfWeek: dayParam } = useParams<{ dayOfWeek: string }>()

  if (!dayParam || !isDayOfWeek(dayParam)) {
    return <Navigate to="/meal-plans" replace />
  }

  return <DayRecipePageContent day={dayParam} />
}

