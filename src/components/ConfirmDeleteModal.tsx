type ConfirmDeleteModalProps = {
  open: boolean
  itemName: string
  entityLabel?: string
  error: string | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  open,
  itemName,
  entityLabel = 'sastojak',
  error,
  deleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={deleting ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl"
      >
        <h2 id="delete-dialog-title" className="text-lg font-semibold text-text-h">
          Obriši {entityLabel}
        </h2>
        <p className="mt-2 text-sm text-text">
          Da li ste sigurni da želite da obrišete{' '}
          <span className="font-medium text-text-h">{itemName}</span>?
        </p>

        {error && (
          <p
            className="mt-4 rounded-lg border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            Otkaži
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Brisanje…' : 'Obriši'}
          </button>
        </div>
      </div>
    </div>
  )
}
