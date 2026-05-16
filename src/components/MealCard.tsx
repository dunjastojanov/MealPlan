import { Link } from 'react-router-dom'
import type { Meal } from '../types'
import { formatKcal, formatProteinG } from '../lib/nutrition'

type Props = {
  meal: Meal
  female: { calories: number; protein: number }
  male: { calories: number; protein: number }
  selectedForDay: boolean
  onToggleDay: () => void
}

function excerpt(text: string, max = 100): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

export function MealCard({
  meal,
  female,
  male,
  selectedForDay,
  onToggleDay,
}: Props) {
  return (
    <div
      className={
        selectedForDay ? 'meal-card meal-card--selected' : 'meal-card'
      }
    >
      <h2 className="meal-card-title">
        <Link to={`/meal/${meal.id}`}>{meal.name}</Link>
      </h2>
      <p className="meal-card-prep">{excerpt(meal.preparation)}</p>
      <div className="meal-card-stats">
        <div className="meal-card-stat">
          <span className="meal-card-label">Female</span>
          <span className="meal-card-values">
            {formatKcal(female.calories)} · {formatProteinG(female.protein)}{' '}
            protein
          </span>
        </div>
        <div className="meal-card-stat">
          <span className="meal-card-label">Male</span>
          <span className="meal-card-values">
            {formatKcal(male.calories)} · {formatProteinG(male.protein)} protein
          </span>
        </div>
      </div>
      <Link to={`/meal/${meal.id}`} className="meal-card-view-btn">
        View full meal
      </Link>
      <label className="meal-card-day-toggle">
        <input
          type="checkbox"
          checked={selectedForDay}
          onChange={onToggleDay}
        />
        <span>Add to today&apos;s plan</span>
      </label>
    </div>
  )
}
