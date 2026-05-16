import { Link, useParams } from 'react-router-dom'
import {
  formatKcal,
  formatProteinG,
  nutrientsForLine,
  sumNutrients,
} from '../lib/nutrition'
import { getMealTotals, ingredientMap, mealsById } from '../data/mealsData'
import type { IngredientLine } from '../types'

function IngredientSection({
  title,
  lines,
}: {
  title: string
  lines: IngredientLine[]
}) {
  const totals = sumNutrients(lines, ingredientMap)
  return (
    <section className="portion-section">
      <div className="portion-header">
        <h2 className="portion-title">{title}</h2>
        <p className="portion-totals">
          {formatKcal(totals.calories)} · {formatProteinG(totals.protein)}{' '}
          protein
        </p>
      </div>
      <ul className="ingredient-list">
        {lines.map((line, index) => {
          const ing = ingredientMap.get(line.ingredient_id)
          const label = ing?.name ?? line.ingredient_id
          const lineNut = nutrientsForLine(line, ingredientMap)
          return (
            <li key={`${line.ingredient_id}-${index}`}>
              <span className="ingredient-name">{label}</span>
              <span className="ingredient-amount">{line.amount_g} g</span>
              <span className="ingredient-kcal">
                {lineNut ? formatKcal(lineNut.calories) : '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function MealDetail() {
  const { id } = useParams<{ id: string }>()
  const meal = id ? mealsById.get(id) : undefined

  if (!meal) {
    return (
      <div className="not-found">
        <h1 className="page-title">Meal not found</h1>
        <p>No recipe matches this link.</p>
        <Link to="/">Back to dashboard</Link>
      </div>
    )
  }

  const { female, male } = getMealTotals(meal)

  return (
    <article className="meal-detail">
      <Link to="/" className="back-link">
        ← All meals
      </Link>
      <h1 className="page-title">{meal.name}</h1>
      <p className="meal-prep">{meal.preparation}</p>

      <div className="summary-strip">
        <div>
          <span className="summary-label">Female (total)</span>
          <span className="summary-value">
            {formatKcal(female.calories)} · {formatProteinG(female.protein)}{' '}
            protein
          </span>
        </div>
        <div>
          <span className="summary-label">Male (total)</span>
          <span className="summary-value">
            {formatKcal(male.calories)} · {formatProteinG(male.protein)} protein
          </span>
        </div>
      </div>

      <div className="portion-columns">
        <IngredientSection title="Female portion" lines={meal.ingredients_female} />
        <IngredientSection title="Male portion" lines={meal.ingredients_male} />
      </div>
    </article>
  )
}
