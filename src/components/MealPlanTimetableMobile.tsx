import { TIMETABLE_DAYS } from '../lib/mealPlanTimetable'
import type { UserMealPlanTimetable } from '../lib/mealPlanTimetable'
import { formatMealMacros } from '../lib/mealMacros'
import type { DailyMealPlanSummary } from '../types'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

type MealPlanTimetableMobileProps = {
  timetable: UserMealPlanTimetable
  detailLoading: boolean
  onEdit: (plan: DailyMealPlanSummary) => void
}

export function MealPlanTimetableMobile({
  timetable,
  detailLoading,
  onEdit,
}: MealPlanTimetableMobileProps) {
  const { plansByDay, mealSlotCount } = timetable

  return (
    <div className="divide-y divide-border">
      {TIMETABLE_DAYS.map(({ value, label }) => {
        const plan = plansByDay.get(value)
        const hasMeals = plan && plan.mealNames.length > 0

        return (
          <section key={value} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-text-h">{label}</h3>
              {plan && (
                <button
                  type="button"
                  onClick={() => onEdit(plan)}
                  disabled={detailLoading}
                  className={actionButtonClassName}
                >
                  Izmeni
                </button>
              )}
            </div>
            <ol className="mt-3 space-y-2">
              {Array.from({ length: mealSlotCount }, (_, slotIndex) => {
                const mealName = plan?.mealNames[slotIndex]

                return (
                  <li
                    key={slotIndex}
                    className="flex gap-3 text-sm"
                  >
                    <span className="w-6 shrink-0 text-center font-medium text-text">
                      {slotIndex + 1}
                    </span>
                    <span
                      className={
                        mealName ? 'font-medium text-text-h' : 'text-text/50'
                      }
                    >
                      {mealName ?? '—'}
                    </span>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 border-t border-border pt-3 text-xs text-text">
              <span className="font-medium text-text-h">Ukupno: </span>
              {hasMeals
                ? formatMealMacros(plan.totalCalories, plan.totalProtein)
                : '—'}
            </p>
          </section>
        )
      })}
    </div>
  )
}
