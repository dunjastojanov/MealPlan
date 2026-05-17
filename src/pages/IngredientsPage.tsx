import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { IngredientCardList } from '../components/IngredientCardList'
import { IngredientEditAside } from '../components/IngredientEditAside'
import { macroLabel, toDisplayMacro, useIngredients } from '../hooks/useIngredients'
import { unitLabel } from '../lib/unitDisplay'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

const addButtonClassName =
  'shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

export function IngredientsPage() {
  const {
    ingredients,
    ingredientTypes,
    mealOptions,
    loading,
    error,
    editingIngredient,
    form,
    formError,
    saving,
    originalUnit,
    mealUsages,
    mealAmounts,
    usagesLoading,
    unitChanged,
    creating,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    updateForm,
    updateMealAmount,
    saveCreate,
    saveEdit,
    deletingIngredient,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useIngredients()

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-h sm:text-2xl">Sastojci</h1>
          <p className="mt-1 text-sm text-text">
            Makro vrednosti su prikazane na 100 g za stavke u gramima.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading}
          className={addButtonClassName}
        >
          Dodaj sastojak
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-text">Učitavanje sastojaka…</p>}

      {error && (
        <p
          className="mt-6 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && ingredients.length === 0 && (
        <p className="mt-6 text-sm text-text">Još nema sastojaka u katalogu.</p>
      )}

      {!loading && !error && ingredients.length > 0 && (
        <>
          <div className="mt-6 md:hidden">
            <IngredientCardList
              ingredients={ingredients}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>
          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-surface shadow md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text">
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  Naziv
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  Tip
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  Kalorije
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  Proteini (g)
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  Jedinica
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-text-h">
                  <span className="sr-only">Akcije</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-h">{ingredient.name}</td>
                  <td className="px-4 py-3 text-text">
                    {ingredient.ingredientTypeName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-text">
                    {toDisplayMacro(ingredient.calories, ingredient.unit)}{' '}
                    <span className="text-xs text-text/80">({macroLabel(ingredient.unit)})</span>
                  </td>
                  <td className="px-4 py-3 text-text">
                    {toDisplayMacro(ingredient.protein, ingredient.unit)}{' '}
                    <span className="text-xs text-text/80">({macroLabel(ingredient.unit)})</span>
                  </td>
                  <td className="px-4 py-3 text-text">{unitLabel(ingredient.unit)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(ingredient)}
                        className={actionButtonClassName}
                      >
                        Izmeni
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(ingredient)}
                        className={`${actionButtonClassName} border-danger-border text-danger hover:bg-danger-bg`}
                      >
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {form && creating && (
        <IngredientEditAside
          open={creating}
          title="Novi sastojak"
          form={form}
          ingredientTypes={ingredientTypes}
          mealOptions={mealOptions}
          originalUnit={form.unit}
          unitChanged={false}
          mealUsages={[]}
          mealAmounts={{}}
          usagesLoading={false}
          error={formError}
          saving={saving}
          saveLabel="Dodaj"
          panelLabel="Novi sastojak"
          onClose={closeCreate}
          onChange={updateForm}
          onMealAmountChange={updateMealAmount}
          onSave={() => void saveCreate()}
        />
      )}

      {form && editingIngredient && originalUnit != null && (
        <IngredientEditAside
          open={editingIngredient != null}
          title={`Izmena: ${editingIngredient.name}`}
          form={form}
          ingredientTypes={ingredientTypes}
          mealOptions={mealOptions}
          originalUnit={originalUnit}
          unitChanged={unitChanged}
          mealUsages={mealUsages}
          mealAmounts={mealAmounts}
          usagesLoading={usagesLoading}
          error={formError}
          saving={saving}
          onClose={closeEdit}
          onChange={updateForm}
          onMealAmountChange={updateMealAmount}
          onSave={() => void saveEdit()}
        />
      )}

      {deletingIngredient && (
        <ConfirmDeleteModal
          open={deletingIngredient != null}
          itemName={deletingIngredient.name}
          error={deleteError}
          deleting={deleting}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </section>
  )
}
