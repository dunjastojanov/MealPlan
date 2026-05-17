import { useMemo } from 'react'
import { DayNavColumn } from '../components/DayNavColumn'
import { ShoppingList } from '../components/ShoppingList'
import { useUser } from '../hooks/useUser'
import { buildShoppingList } from '../lib/shoppingList'
import { useMealPlans } from '../hooks/useMealPlans'

export function HomePage() {
  const user = useUser()!
  const { plans, meals, ingredients } = useMealPlans()

  const shoppingList = useMemo(
    () => buildShoppingList(plans, meals, ingredients),
    [plans, meals, ingredients],
  )

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-surface p-8 shadow">
        <h1 className="text-2xl font-semibold text-text-h">
          Dobrodošli, {user.first_name} {user.last_name}
        </h1>
        <p className="mt-2 text-text">
          Dnevni ciljevi: {user.calorie_goal} kcal · {user.protein_goal} g proteina
        </p>
        <p className="mt-4 text-sm text-text">
          Pregledajte katalog sastojaka ili biblioteku obroka iz navigacije iznad.
        </p>
      </section>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ShoppingList items={shoppingList} />
        </div>
        <DayNavColumn />
      </div>
    </div>
  )
}
