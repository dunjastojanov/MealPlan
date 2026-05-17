import { type FormEvent } from 'react'
import { macroLabel, type IngredientFormValues } from '../lib/ingredientDisplay'
import {
  formatPreviousAmount,
  mealAmountLabel,
} from '../lib/ingredientMealAmounts'
import { isMadeIngredientType } from '../lib/ingredientType'
import type { IngredientMealUsage } from '../services/ingredientService'
import type { IngredientType, IngredientUnit, MealOption } from '../types'

const inputClassName =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent disabled:opacity-60'

type IngredientEditAsideProps = {
  open: boolean
  title: string
  form: IngredientFormValues
  ingredientTypes: IngredientType[]
  mealOptions: MealOption[]
  originalUnit: IngredientUnit
  unitChanged: boolean
  mealUsages: IngredientMealUsage[]
  mealAmounts: Record<string, string>
  usagesLoading: boolean
  error: string | null
  saving: boolean
  onClose: () => void
  onChange: (patch: Partial<IngredientFormValues>) => void
  onMealAmountChange: (mealIngredientId: string, amount: string) => void
  onSave: () => void
  saveLabel?: string
  panelLabel?: string
}

export function IngredientEditAside({
  open,
  title,
  form,
  ingredientTypes,
  mealOptions,
  originalUnit,
  unitChanged,
  mealUsages,
  mealAmounts,
  usagesLoading,
  error,
  saving,
  onClose,
  onChange,
  onMealAmountChange,
  onSave,
  saveLabel = 'Sačuvaj',
  panelLabel = 'Izmena sastojka',
}: IngredientEditAsideProps) {
  const saveDisabled = saving || (unitChanged && usagesLoading)
  const showRecipeField = isMadeIngredientType(form.ingredientTypeId, ingredientTypes)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
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

        <form className="flex flex-1 flex-col overflow-y-auto px-5 py-5" onSubmit={handleSubmit}>
          {error && (
            <p
              className="mb-4 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-text-h">Naziv</span>
            <input
              type="text"
              value={form.name}
              disabled={saving}
              onChange={(event) => onChange({ name: event.target.value })}
              className={inputClassName}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">
              Kalorije <span className="font-normal text-text">({macroLabel(form.unit)})</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={form.calories}
              disabled={saving}
              onChange={(event) => onChange({ calories: event.target.value })}
              className={inputClassName}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">
              Proteini (g){' '}
              <span className="font-normal text-text">({macroLabel(form.unit)})</span>
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={form.protein}
              disabled={saving}
              onChange={(event) => onChange({ protein: event.target.value })}
              className={inputClassName}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">Tip</span>
            <select
              value={form.ingredientTypeId}
              disabled={saving}
              onChange={(event) => {
                const ingredientTypeId = event.target.value
                const patch: Partial<IngredientFormValues> = { ingredientTypeId }
                if (!isMadeIngredientType(ingredientTypeId, ingredientTypes)) {
                  patch.recipeId = ''
                }
                onChange(patch)
              }}
              className={inputClassName}
              required
            >
              <option value="">Izaberite tip</option>
              {ingredientTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">Jedinica</span>
            <select
              value={form.unit}
              disabled={saving}
              onChange={(event) => onChange({ unit: event.target.value as IngredientUnit })}
              className={inputClassName}
            >
              <option value="g">g</option>
              <option value="piece">komad</option>
            </select>
          </label>

          {showRecipeField && (
            <label className="mt-4 block">
              <span className="text-sm font-medium text-text-h">Recept</span>
              <select
                value={form.recipeId}
                disabled={saving}
                onChange={(event) => onChange({ recipeId: event.target.value })}
                className={inputClassName}
              >
                <option value="">Bez recepta</option>
                {mealOptions.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {unitChanged && mealUsages.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-text-h">Količine u obrocima</legend>
              <p className="mt-1 text-xs text-text">
                Jedinica je promenjena — unesite novu količinu za svaki obrok.
              </p>

              {usagesLoading && (
                <p className="mt-3 text-sm text-text">Učitavanje obroka…</p>
              )}

              <ul className="mt-3 space-y-4">
                {mealUsages.map((usage) => (
                  <li
                    key={usage.mealIngredientId}
                    className="rounded-lg border border-border bg-bg p-3"
                  >
                    <p className="text-sm font-medium text-text-h">{usage.mealName}</p>
                    <p className="mt-1 text-xs text-text">
                      Prethodno: {formatPreviousAmount(usage.amount, originalUnit)}
                    </p>
                    <label className="mt-3 block">
                      <span className="text-xs font-medium text-text">
                        {mealAmountLabel(form.unit)}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={mealAmounts[usage.mealIngredientId] ?? ''}
                        disabled={saveDisabled}
                        onChange={(event) =>
                          onMealAmountChange(usage.mealIngredientId, event.target.value)
                        }
                        className={inputClassName}
                        required
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}

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
              disabled={saveDisabled}
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
