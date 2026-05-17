import { NavLink } from 'react-router-dom'
import { DAY_OF_WEEK_OPTIONS } from '../lib/dayOfWeek'

const dayLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block shrink-0 whitespace-nowrap rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors lg:w-full',
    isActive
      ? 'border-accent/30 bg-accent-soft text-accent'
      : 'border-border text-text hover:bg-accent-soft hover:text-text-h',
  ].join(' ')

export function DayNavColumn() {
  return (
    <aside className="w-full shrink-0 lg:w-36">
      <h2 className="text-sm font-semibold text-text-h">Recepti po danu</h2>
      <p className="mt-0.5 text-xs text-text">Spojeni recepti i porcije</p>
      <nav
        className="scrollbar-themed mt-3 flex-col gap-1.5 overflow-visible"
        aria-label="Dani u nedelji"
      >
        {DAY_OF_WEEK_OPTIONS.map(({ value, label }) => (
          <NavLink
            key={value}
            to={`/meal-plans/${value}`}
            className={dayLinkClass}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
