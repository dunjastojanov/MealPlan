import { useCallback, useEffect, useState } from 'react'
import {
  formatShoppingListForCopy,
  formatShoppingListLine,
  type ShoppingListItem,
} from '../lib/shoppingList'

const actionButtonClassName =
  'rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60'

type ShoppingListProps = {
  items: ShoppingListItem[]
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const handleCopy = useCallback(async () => {
    if (items.length === 0) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatShoppingListForCopy(items))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [items])

  return (
    <article className="rounded-xl border border-border bg-surface shadow">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold text-text-h">Lista za kupovinu</h2>
          <p className="mt-0.5 text-sm text-text">
            Zbir svih sastojaka iz planova svih članova domaćinstva.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={items.length === 0}
          className={actionButtonClassName}
        >
          {copied ? 'Kopirano' : 'Kopiraj'}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text">Nema sastojaka u planovima.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-4 gap-y-1 px-4 py-3">
          {items.map((item) => (
            <li key={item.ingredientId} className="py-1.5 text-sm text-text-h">
              {formatShoppingListLine(item)}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
