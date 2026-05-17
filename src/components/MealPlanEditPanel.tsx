import { type FormEvent, useState } from 'react'
import { DAY_OF_WEEK_OPTIONS } from '../lib/dayOfWeek'
import { formatMealMacros, sumMealMacros } from '../lib/mealMacros'
import type { MealPlanFormValues } from '../lib/mealPlanForm'
import type { Meal, User } from '../types'

const inputClassName =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent disabled:opacity-60'

const actionButtonClassName =
  'rounded-lg border border-border px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

type MealPlanEditPanelProps = {
  open: boolean
  title: string
  form: MealPlanFormValues
  users: User[]
  meals: Meal[]
  error: string | null
  saving: boolean
  onClose: () => void
  onAddMeal: (mealId: string) => void
  onRemoveMeal: (index: number) => void
  onSave: () => void
  saveLabel?: string
  panelLabel?: string
}

function userLabel(user: User) {
  return `${user.first_name} ${user.last_name}`
}

export function MealPlanEditPanel({
  open,
  title,
  form,
  users,
  meals,
  error,
  saving,
  onClose,
  onAddMeal,
  onRemoveMeal,
  onSave,
  saveLabel = 'Sačuvaj',
  panelLabel = 'Plan ishrane',
}: MealPlanEditPanelProps) {
  const [pendingMealId, setPendingMealId] = useState('')

  const selectedMeals = form.mealIds
    .map((mealId) => meals.find((item) => item.id === mealId))
    .filter((meal): meal is Meal => meal != null)
  const planTotals = sumMealMacros(selectedMeals)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
  }

  function handleAddMeal() {
    if (!pendingMealId) {
      return
    }
    onAddMeal(pendingMealId)
    setPendingMealId('')
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        aria-hidden={!open}
        aria-label={panelLabel}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-text-h">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-2 py-1 text-sm text-text transition-colors hover:bg-accent-soft hover:text-text-h disabled:opacity-60"
            aria-label="Zatvori"
          >
            Zatvori
          </button>
        </div>

        <form
          className="scrollbar-themed flex flex-1 flex-col overflow-y-auto px-5 py-5"
          onSubmit={handleSubmit}
        >
          {error && (
            <p
              className="mb-4 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <label>
            <span className="text-sm font-medium text-text-h">Član domaćinstva</span>
            <select
              value={form.userId}
              disabled
              className={inputClassName}
            >
              {users.length === 0 ? (
                <option value="">Nema dostupnih članova</option>
              ) : (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {userLabel(user)}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">Dan u nedelji</span>
            <select
              value={form.dayOfWeek}
              disabled
              className={inputClassName}
            >
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-text-h">Obroci</span>
              {selectedMeals.length > 0 && (
                <span className="shrink-0 text-right text-xs font-medium text-text">
                  {formatMealMacros(planTotals.calories, planTotals.protein)}
                </span>
              )}
            </div>
            {form.mealIds.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {form.mealIds.map((mealId, index) => {
                  const meal = meals.find((item) => item.id === mealId)
                  if (!meal) {
                    return null
                  }
                  return (
                    <li
                      key={`${mealId}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-text-h">{meal.name}</span>
                        <p className="mt-0.5 text-xs text-text">
                          {formatMealMacros(meal.calories, meal.protein)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => onRemoveMeal(index)}
                        className={`${actionButtonClassName} border-danger-border text-danger hover:bg-danger-bg`}
                      >
                        Ukloni
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-text">Nema dodeljenih obroka.</p>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Dodaj obrok</span>
                <select
                  value={pendingMealId}
                  disabled={saving || meals.length === 0}
                  onChange={(event) => setPendingMealId(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Izaberite obrok…</option>
                  {meals.map((meal) => (
                    <option key={meal.id} value={meal.id}>
                      {meal.name} ({formatMealMacros(meal.calories, meal.protein)})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={saving || !pendingMealId}
                onClick={handleAddMeal}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                Dodaj
              </button>
            </div>
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Čuvanje…' : saveLabel}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
