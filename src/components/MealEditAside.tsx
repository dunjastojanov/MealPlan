import { type FormEvent } from 'react'
import {
  addIngredientLine,
  computeMealFormMacros,
  removeIngredientLine,
  type MealFormValues,
} from '../lib/mealForm'
import { formatMealMacros } from '../lib/mealMacros'
import type { Ingredient } from '../types'

const inputClassName =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent disabled:opacity-60'

type MealEditAsideProps = {
  open: boolean
  title: string
  form: MealFormValues
  catalog: Ingredient[]
  error: string | null
  saving: boolean
  onClose: () => void
  onChange: (form: MealFormValues) => void
  onSave: () => void
  saveLabel?: string
  panelLabel?: string
}

function amountLabel(catalog: Ingredient[], ingredientId: string) {
  const ingredient = catalog.find((item) => item.id === ingredientId)
  if (!ingredient) {
    return 'Količina'
  }
  return ingredient.unit === 'g' ? 'Količina (g)' : 'Količina (kom)'
}

export function MealEditAside({
  open,
  title,
  form,
  catalog,
  error,
  saving,
  onClose,
  onChange,
  onSave,
  saveLabel = 'Sačuvaj',
  panelLabel = 'Izmena obroka',
}: MealEditAsideProps) {
  const macroTotals = computeMealFormMacros(form, catalog)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave()
  }

  function updateLine(
    key: string,
    patch: Partial<MealFormValues['ingredients'][number]>,
  ) {
    onChange({
      ...form,
      ingredients: form.ingredients.map((line) =>
        line.key === key ? { ...line, ...patch } : line,
      ),
    })
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

          <label className="block">
            <span className="text-sm font-medium text-text-h">Naziv</span>
            <input
              type="text"
              value={form.name}
              disabled={saving}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              className={inputClassName}
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-text-h">Priprema</span>
            <textarea
              value={form.preparation}
              disabled={saving}
              onChange={(event) => onChange({ ...form, preparation: event.target.value })}
              rows={4}
              className={inputClassName}
            />
          </label>

          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-text-h">Sastojci</span>
              <span className="shrink-0 text-right text-xs font-medium text-text">
                {formatMealMacros(macroTotals.calories, macroTotals.protein)}
              </span>
            </div>

            <ul className="mt-3 space-y-4">
              {form.ingredients.map((line) => (
                <li
                  key={line.key}
                  className="flex items-end gap-2 rounded-lg border border-border bg-bg p-3"
                >
                  <label className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-text">Sastojak</span>
                    <select
                      value={line.ingredientId}
                      disabled={saving}
                      onChange={(event) =>
                        updateLine(line.key, { ingredientId: event.target.value })
                      }
                      className={inputClassName}
                      required
                    >
                      <option value="">Izaberite…</option>
                      {catalog.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="w-24 shrink-0">
                    <span className="text-xs font-medium text-text">
                      {amountLabel(catalog, line.ingredientId)}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={line.amount}
                      disabled={saving}
                      onChange={(event) =>
                        updateLine(line.key, { amount: event.target.value })
                      }
                      className={inputClassName}
                      required
                    />
                  </label>

                  <button
                    type="button"
                    disabled={saving || form.ingredients.length <= 1}
                    onClick={() => onChange(removeIngredientLine(form, line.key))}
                    className="shrink-0 pb-2.5 text-xs font-medium text-danger transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Ukloni
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={saving}
              onClick={() => onChange(addIngredientLine(form))}
              className="mt-4 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              Dodaj sastojak
            </button>
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
