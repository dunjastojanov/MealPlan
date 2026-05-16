import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MealCard } from '../components/MealCard'
import { getMealTotals, meals, mealsById } from '../data/mealsData'
import {
  FEMALE_DAILY_CALORIES,
  FEMALE_DAILY_PROTEIN,
  MALE_DAILY_CALORIES,
  MALE_DAILY_PROTEIN,
} from '../lib/dailyLimits'
import { loadDayMealIds, saveDayMealIds } from '../lib/daySelectionStorage'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../lib/mealTypes'
import { formatKcal, formatProteinG } from '../lib/nutrition'

export function Dashboard() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    loadDayMealIds(),
  )

  useEffect(() => {
    saveDayMealIds(selectedIds)
  }, [selectedIds])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const dayTotals = useMemo(() => {
    let femaleKcal = 0
    let maleKcal = 0
    let femaleProtein = 0
    let maleProtein = 0
    for (const id of selectedIds) {
      const meal = mealsById.get(id)
      if (!meal) continue
      const t = getMealTotals(meal)
      femaleKcal += t.female.calories
      maleKcal += t.male.calories
      femaleProtein += t.female.protein
      maleProtein += t.male.protein
    }
    return {
      calories: { female: femaleKcal, male: maleKcal },
      protein: { female: femaleProtein, male: maleProtein },
    }
  }, [selectedIds])

  const hasSelection = selectedIds.length > 0

  const femaleOverCal =
    hasSelection && dayTotals.calories.female > FEMALE_DAILY_CALORIES
  const maleOverCal =
    hasSelection && dayTotals.calories.male > MALE_DAILY_CALORIES
  const femaleUnderProtein =
    hasSelection && dayTotals.protein.female < FEMALE_DAILY_PROTEIN
  const maleUnderProtein =
    hasSelection && dayTotals.protein.male < MALE_DAILY_PROTEIN

  function toggleId(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function removeId(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  function clearDay() {
    setSelectedIds([])
  }

  return (
    <div className="dashboard">
      <section className="day-plan" aria-labelledby="day-plan-heading">
        <h2 id="day-plan-heading" className="day-plan-title">
          Today&apos;s plan
        </h2>
        <p className="day-plan-hint">
          Check meals below to include them in your daily total. Selections are
          saved for today and reset when the calendar date changes.
        </p>

        {selectedIds.length === 0 ? (
          <p className="day-plan-empty">
            No meals selected yet. Use the checkboxes on the cards to build
            your day.
          </p>
        ) : (
          <ul className="day-plan-list">
            {selectedIds.map((id) => {
              const meal = mealsById.get(id)
              if (!meal) return null
              const t = getMealTotals(meal)
              return (
                <li key={id} className="day-plan-row">
                  <Link to={`/meal/${id}`} className="day-plan-meal-name">
                    {meal.name}
                  </Link>
                  <span className="day-plan-kcal">
                    <span title="Female portion">
                      {formatKcal(t.female.calories)} F
                    </span>
                    <span className="day-plan-sep" aria-hidden="true">
                      {' · '}
                    </span>
                    <span title="Male portion">
                      {formatKcal(t.male.calories)} M
                    </span>
                  </span>
                  <button
                    type="button"
                    className="day-plan-remove"
                    onClick={() => removeId(id)}
                    aria-label={`Remove ${meal.name} from today`}
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div
          className="day-plan-totals"
          role="region"
          aria-label="Daily calorie and protein totals vs targets"
        >
          <h3 className="day-plan-totals-title">Daily totals</h3>
          <div
            className="day-totals-table"
            role="group"
            aria-label="Sums vs daily calorie maximum and protein minimum"
          >
            <div className="day-totals-corner" aria-hidden="true" />
            <div className="day-totals-h">Calories</div>
            <div className="day-totals-h">Protein</div>

            <div className="day-totals-person">Female</div>
            <div
              className={
                femaleOverCal
                  ? 'day-totals-cell day-totals-cell--over-cal'
                  : 'day-totals-cell'
              }
            >
              <span className="day-totals-value">
                {formatKcal(dayTotals.calories.female)}
              </span>
              <span className="day-totals-goal">
                Max {formatKcal(FEMALE_DAILY_CALORIES)}
              </span>
              {femaleOverCal && (
                <span className="day-totals-flag day-totals-flag--max" role="status">
                  Over max by{' '}
                  {formatKcal(
                    dayTotals.calories.female - FEMALE_DAILY_CALORIES,
                  )}
                </span>
              )}
            </div>
            <div
              className={
                femaleUnderProtein
                  ? 'day-totals-cell day-totals-cell--under-protein'
                  : 'day-totals-cell'
              }
            >
              <span className="day-totals-value">
                {formatProteinG(dayTotals.protein.female)}
              </span>
              <span className="day-totals-goal">
                Min {formatProteinG(FEMALE_DAILY_PROTEIN)}
              </span>
              {femaleUnderProtein && (
                <span className="day-totals-flag day-totals-flag--min" role="status">
                  Below min by{' '}
                  {formatProteinG(
                    FEMALE_DAILY_PROTEIN - dayTotals.protein.female,
                  )}
                </span>
              )}
            </div>

            <div className="day-totals-person">Male</div>
            <div
              className={
                maleOverCal
                  ? 'day-totals-cell day-totals-cell--over-cal'
                  : 'day-totals-cell'
              }
            >
              <span className="day-totals-value">
                {formatKcal(dayTotals.calories.male)}
              </span>
              <span className="day-totals-goal">
                Max {formatKcal(MALE_DAILY_CALORIES)}
              </span>
              {maleOverCal && (
                <span className="day-totals-flag day-totals-flag--max" role="status">
                  Over max by{' '}
                  {formatKcal(dayTotals.calories.male - MALE_DAILY_CALORIES)}
                </span>
              )}
            </div>
            <div
              className={
                maleUnderProtein
                  ? 'day-totals-cell day-totals-cell--under-protein'
                  : 'day-totals-cell'
              }
            >
              <span className="day-totals-value">
                {formatProteinG(dayTotals.protein.male)}
              </span>
              <span className="day-totals-goal">
                Min {formatProteinG(MALE_DAILY_PROTEIN)}
              </span>
              {maleUnderProtein && (
                <span className="day-totals-flag day-totals-flag--min" role="status">
                  Below min by{' '}
                  {formatProteinG(
                    MALE_DAILY_PROTEIN - dayTotals.protein.male,
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <button type="button" className="day-plan-clear" onClick={clearDay}>
            Clear today&apos;s plan
          </button>
        )}
      </section>

      <h1 className="page-title">Meals</h1>
      <p className="page-lead">
        Per-recipe calories and protein (macros per 100 g in data; totals scale
        by portion weight).
      </p>
      {MEAL_TYPES.map((mealType) => {
        const sectionMeals = meals.filter((m) => m.meal_type === mealType)
        if (sectionMeals.length === 0) return null
        return (
          <section key={mealType} className="meal-section" aria-labelledby={`meal-section-${mealType}`}>
            <h2 id={`meal-section-${mealType}`} className="meal-section-title">
              {MEAL_TYPE_LABELS[mealType]}
            </h2>
            <div className="meal-grid">
              {sectionMeals.map((meal) => {
                const { female, male } = getMealTotals(meal)
                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    female={female}
                    male={male}
                    selectedForDay={selectedSet.has(meal.id)}
                    onToggleDay={() => toggleId(meal.id)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
