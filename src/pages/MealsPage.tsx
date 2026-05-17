import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { MealEditAside } from '../components/MealEditAside'
import { formatMealMacros, useMeals } from '../hooks/useMeals'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

const addButtonClassName =
  'shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

export function MealsPage() {
  const {
    meals,
    catalog,
    loading,
    error,
    editingMeal,
    form,
    formError,
    saving,
    creating,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    updateForm,
    saveCreate,
    saveEdit,
    deletingMeal,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useMeals()

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-h sm:text-2xl">Obroci</h1>
          <p className="mt-1 text-sm text-text">Recepti i šabloni obroka u vašem katalogu.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading}
          className={addButtonClassName}
        >
          Dodaj obrok
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-text">Učitavanje obroka…</p>}

      {error && (
        <p
          className="mt-6 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && meals.length === 0 && (
        <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-6 text-sm text-text shadow">
          Još nema obroka. Kliknite „Dodaj obrok“ da dodate prvi.
        </p>
      )}

      {!loading && !error && meals.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <article
              key={meal.id}
              className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow"
            >
              <h2 className="font-semibold text-text-h">{meal.name}</h2>

              {meal.ingredients.length > 0 ? (
                <p className="mt-2 text-sm text-text">
                  {meal.ingredients.map((line) => line.ingredientName).join(', ')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-text">Nema navedenih sastojaka.</p>
              )}

              <p className="mt-3 text-sm font-medium text-text-h pb-2">
                {formatMealMacros(meal.calories, meal.protein)}
              </p>

              <div className="mt-auto flex gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(meal)}
                  className={actionButtonClassName}
                >
                  Izmeni
                </button>
                <button
                  type="button"
                  onClick={() => openDelete(meal)}
                  className={`${actionButtonClassName} border-danger-border text-danger hover:bg-danger-bg`}
                >
                  Obriši
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {form && creating && (
        <MealEditAside
          open={creating}
          title="Novi obrok"
          form={form}
          catalog={catalog}
          error={formError}
          saving={saving}
          saveLabel="Dodaj"
          panelLabel="Novi obrok"
          onClose={closeCreate}
          onChange={updateForm}
          onSave={() => void saveCreate()}
        />
      )}

      {form && editingMeal && (
        <MealEditAside
          open={editingMeal != null}
          title={`Izmena: ${editingMeal.name}`}
          form={form}
          catalog={catalog}
          error={formError}
          saving={saving}
          onClose={closeEdit}
          onChange={updateForm}
          onSave={() => void saveEdit()}
        />
      )}

      {deletingMeal && (
        <ConfirmDeleteModal
          open={deletingMeal != null}
          entityLabel="obrok"
          itemName={deletingMeal.name}
          error={deleteError}
          deleting={deleting}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </section>
  )
}
