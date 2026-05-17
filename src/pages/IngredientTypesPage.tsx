import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { IngredientTypeEditAside } from '../components/IngredientTypeEditAside'
import { IngredientTypeOrderControls } from '../components/IngredientTypeOrderControls'
import { useIngredientTypes } from '../hooks/useIngredientTypes'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

const addButtonClassName =
  'shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

export function IngredientTypesPage() {
  const {
    types,
    loading,
    error,
    creating,
    editingType,
    formName,
    formError,
    saving,
    reorderingId,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    setFormName,
    saveCreate,
    saveEdit,
    moveType,
    deletingType,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useIngredientTypes()

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-h sm:text-2xl">Tipovi sastojaka</h1>
          <p className="mt-1 text-sm text-text">
            Redosled određuje grupisanje liste za kupovinu. Koristite strelice za promenu reda.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={loading}
          className={addButtonClassName}
        >
          Dodaj tip
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-text">Učitavanje tipova…</p>}

      {error && (
        <p
          className="mt-6 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && types.length === 0 && (
        <p className="mt-6 text-sm text-text">Još nema tipova.</p>
      )}

      {!loading && !error && types.length > 0 && (
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {types.map((type, index) => (
              <li
                key={type.id}
                className="rounded-xl border border-border bg-surface p-4 shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-text">Redosled {type.number}</p>
                    <h2 className="font-semibold text-text-h">{type.name}</h2>
                  </div>
                  <IngredientTypeOrderControls
                    canMoveUp={index > 0}
                    canMoveDown={index < types.length - 1}
                    disabled={reorderingId != null}
                    onMoveUp={() => void moveType(type.id, 'up')}
                    onMoveDown={() => void moveType(type.id, 'down')}
                  />
                </div>
                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(type)}
                    className={actionButtonClassName}
                  >
                    Izmeni
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(type)}
                    className={`${actionButtonClassName} border-danger-border text-danger hover:bg-danger-bg`}
                  >
                    Obriši
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-surface shadow md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text">
                  <th scope="col" className="px-4 py-3 font-medium text-text-h">
                    Redosled
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-text-h">
                    Naziv
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-text-h">
                    <span className="sr-only">Akcije</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {types.map((type, index) => (
                  <tr key={type.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <IngredientTypeOrderControls
                        canMoveUp={index > 0}
                        canMoveDown={index < types.length - 1}
                        disabled={reorderingId != null}
                        onMoveUp={() => void moveType(type.id, 'up')}
                        onMoveDown={() => void moveType(type.id, 'down')}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-text-h">{type.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(type)}
                          className={actionButtonClassName}
                        >
                          Izmeni
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(type)}
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

      <IngredientTypeEditAside
        open={creating}
        title="Novi tip"
        name={formName}
        error={formError}
        saving={saving}
        panelLabel="Novi tip"
        saveLabel="Dodaj"
        onClose={closeCreate}
        onNameChange={setFormName}
        onSave={() => void saveCreate()}
      />

      <IngredientTypeEditAside
        open={editingType != null}
        title={editingType ? `Izmena: ${editingType.name}` : 'Izmena tipa'}
        name={formName}
        error={formError}
        saving={saving}
        onClose={closeEdit}
        onNameChange={setFormName}
        onSave={() => void saveEdit()}
      />

      {deletingType && (
        <ConfirmDeleteModal
          open={deletingType != null}
          itemName={deletingType.name}
          error={deleteError}
          deleting={deleting}
          onCancel={closeDelete}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </section>
  )
}


