import { type FormEvent } from 'react'

const inputClassName =
  'mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-accent disabled:opacity-60'

type IngredientTypeEditAsideProps = {
  open: boolean
  title: string
  name: string
  error: string | null
  saving: boolean
  onClose: () => void
  onNameChange: (name: string) => void
  onSave: () => void
  saveLabel?: string
  panelLabel?: string
}

export function IngredientTypeEditAside({
  open,
  title,
  name,
  error,
  saving,
  onClose,
  onNameChange,
  onSave,
  saveLabel = 'Sačuvaj',
  panelLabel = 'Izmena tipa',
}: IngredientTypeEditAsideProps) {
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
              value={name}
              disabled={saving}
              onChange={(event) => onNameChange(event.target.value)}
              className={inputClassName}
              required
            />
          </label>

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

