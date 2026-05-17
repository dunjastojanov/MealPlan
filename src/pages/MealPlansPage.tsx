import { useMemo } from 'react'
import { MealPlanEditPanel } from '../components/MealPlanEditPanel'
import { MealPlanTimetable } from '../components/MealPlanTimetable'
import { DayNavColumn } from '../components/DayNavColumn'
import { ShoppingList } from '../components/ShoppingList'
import { useMealPlans } from '../hooks/useMealPlans'
import { buildShoppingList } from '../lib/shoppingList'
import { buildUserMealPlanTimetables } from '../lib/mealPlanTimetable'
import { dayOfWeekLabel } from '../lib/dayOfWeek'

export function MealPlansPage() {
  const {
    plans,
    users,
    meals,
    ingredients,
    loading,
    error,
    editingPlan,
    detailLoading,
    form,
    formError,
    saving,
    closeEdit,
    openEdit,
    addMealToDay,
    removeMealFromDay,
    saveEdit,
  } = useMealPlans()

  const timetables = useMemo(
    () => buildUserMealPlanTimetables(plans, users),
    [plans, users],
  )

  const shoppingList = useMemo(
    () => buildShoppingList(plans, meals, ingredients),
    [plans, meals, ingredients],
  )

  const hasUsers = users.length > 0

  return (
    <section>
      <div>
        <h1 className="text-xl font-semibold text-text-h sm:text-2xl">Planovi ishrane</h1>
        <p className="mt-1 text-sm text-text">
          Nedeljni raspored po članu domaćinstva — dani u kolonama, obroci u redovima.
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-text">Učitavanje planova…</p>}

      {error && (
        <p
          className="mt-6 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && timetables.length === 0 && (
        <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-6 text-sm text-text shadow">
          {hasUsers
            ? 'Planovi se učitavaju za svakog člana. Osvežite stranicu ako ih ne vidite.'
            : 'Nema registrovanih članova domaćinstva.'}
        </p>
      )}

      {!loading && !error && timetables.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {timetables.map((timetable) => (
            <MealPlanTimetable
              key={timetable.userId}
              timetable={timetable}
              detailLoading={detailLoading}
              onEdit={(plan) => void openEdit(plan)}
            />
          ))}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <ShoppingList items={shoppingList} />
            </div>
            <DayNavColumn />
          </div>
        </div>
      )}

      {form && editingPlan && (
        <MealPlanEditPanel
          open={editingPlan != null && !detailLoading}
          title={`Izmena: ${editingPlan.userName} — ${dayOfWeekLabel(editingPlan.dayOfWeek)}`}
          form={form}
          users={users}
          meals={meals}
          error={formError}
          saving={saving}
          panelLabel="Izmena dnevnog plana ishrane"
          onClose={closeEdit}
          onAddMeal={addMealToDay}
          onRemoveMeal={removeMealFromDay}
          onSave={() => void saveEdit()}
        />
      )}

      {detailLoading && editingPlan && (
        <p className="fixed bottom-4 left-4 right-4 z-[60] rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text shadow sm:left-auto sm:right-4 sm:max-w-xs">
          Učitavanje plana…
        </p>
      )}

    </section>
  )
}
