import type { DayOfWeek } from '../types'

export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Ponedeljak' },
  { value: 'tuesday', label: 'Utorak' },
  { value: 'wednesday', label: 'Sreda' },
  { value: 'thursday', label: 'Četvrtak' },
  { value: 'friday', label: 'Petak' },
  { value: 'saturday', label: 'Subota' },
  { value: 'sunday', label: 'Nedelja' },
]

const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export function defaultDayOfWeek(): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[new Date().getDay()]
}

export function dayOfWeekLabel(day: DayOfWeek): string {
  return DAY_OF_WEEK_OPTIONS.find((option) => option.value === day)?.label ?? day
}

const DAY_OF_WEEK_SET = new Set<DayOfWeek>(DAY_OF_WEEK_OPTIONS.map((option) => option.value))

export function isDayOfWeek(value: string): value is DayOfWeek {
  return DAY_OF_WEEK_SET.has(value as DayOfWeek)
}
