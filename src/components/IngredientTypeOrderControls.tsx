type IngredientTypeOrderControlsProps = {
  canMoveUp: boolean
  canMoveDown: boolean
  disabled: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

const buttonClassName =
  'rounded-lg border border-border px-2 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40'

export function IngredientTypeOrderControls({
  canMoveUp,
  canMoveDown,
  disabled,
  onMoveUp,
  onMoveDown,
}: IngredientTypeOrderControlsProps) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disabled || !canMoveUp}
        className={buttonClassName}
        aria-label="Pomeri gore"
        title="Pomeri gore"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disabled || !canMoveDown}
        className={buttonClassName}
        aria-label="Pomeri dole"
        title="Pomeri dole"
      >
        ↓
      </button>
    </div>
  )
}
