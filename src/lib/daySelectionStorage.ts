const STORAGE_KEY = 'mealplan-day-meals-v1'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadDayMealIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { date: string; ids: string[] }
    if (parsed.date !== todayKey()) return []
    return Array.isArray(parsed.ids) ? parsed.ids : []
  } catch {
    return []
  }
}

export function saveDayMealIds(ids: string[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: todayKey(), ids }),
  )
}
