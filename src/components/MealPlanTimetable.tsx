import { TIMETABLE_DAYS } from '../lib/mealPlanTimetable'
import type { UserMealPlanTimetable } from '../lib/mealPlanTimetable'
import { formatMealMacros } from '../lib/mealMacros'
import type { DailyMealPlanSummary } from '../types'
import { MealPlanTimetableMobile } from './MealPlanTimetableMobile'

const actionButtonClassName =
  'rounded border border-border px-1.5 py-0.5 text-[0.65rem] font-medium leading-tight text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

type MealPlanTimetableProps = {
  timetable: UserMealPlanTimetable
  detailLoading: boolean
  onEdit: (plan: DailyMealPlanSummary) => void
}

export function MealPlanTimetable({
  timetable,
  detailLoading,
  onEdit,
}: MealPlanTimetableProps) {
  const { userName, plansByDay, mealSlotCount } = timetable

  return (
    <article className="rounded-xl border border-border bg-surface shadow">
      <h2 className="border-b border-border px-4 py-3 font-semibold text-text-h">{userName}</h2>

      <div className="md:hidden">
        <MealPlanTimetableMobile
          timetable={timetable}
          detailLoading={detailLoading}
          onEdit={onEdit}
        />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-accent-soft/30">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[4.5rem] border-r border-border bg-accent-soft/30 px-3 py-2 font-medium text-text-h"
              >
                Obrok
              </th>
              {TIMETABLE_DAYS.map(({ value, label }) => {
                const plan = plansByDay.get(value)
                return (
                  <th
                    key={value}
                    scope="col"
                    className="min-w-[7rem] px-2 py-2 font-medium text-text-h"
                  >
                    <div className="flex flex-col gap-1">
                      <span>{label}</span>
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
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: mealSlotCount }, (_, slotIndex) => (
              <tr key={slotIndex} className="border-b border-border last:border-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-border bg-surface px-3 py-2 text-center text-xs font-medium text-text"
                >
                  {slotIndex + 1}
                </th>
                {TIMETABLE_DAYS.map(({ value }) => {
                  const plan = plansByDay.get(value)
                  const mealName = plan?.mealNames[slotIndex]

                  return (
                    <td
                      key={value}
                      className={`px-2 py-2 align-top text-text ${
                        mealName ? 'font-medium text-text-h' : 'text-text/50'
                      }`}
                    >
                      {mealName ?? '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-accent-soft/20 text-xs">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-border bg-accent-soft/20 px-3 py-2 font-medium text-text-h"
              >
                Ukupno
              </th>
              {TIMETABLE_DAYS.map(({ value }) => {
                const plan = plansByDay.get(value)
                const hasMeals = plan && plan.mealNames.length > 0

                return (
                  <td key={value} className="px-2 py-2 text-text">
                    {hasMeals
                      ? formatMealMacros(plan.totalCalories, plan.totalProtein)
                      : '—'}
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </article>
  )
}
