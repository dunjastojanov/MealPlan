import { DAY_OF_WEEK_OPTIONS } from './dayOfWeek'
import type { DailyMealPlanSummary, DayOfWeek, User } from '../types'

export type UserMealPlanTimetable = {
  userId: string
  userName: string
  plansByDay: Map<DayOfWeek, DailyMealPlanSummary>
  mealSlotCount: number
}

export function buildUserMealPlanTimetables(
  plans: DailyMealPlanSummary[],
  users: User[],
): UserMealPlanTimetable[] {
  const byUser = new Map<string, DailyMealPlanSummary[]>()

  for (const plan of plans) {
    const list = byUser.get(plan.userId) ?? []
    list.push(plan)
    byUser.set(plan.userId, list)
  }

  const orderedUserIds = [
    ...users.map((user) => user.id),
    ...[...byUser.keys()].filter((id) => !users.some((user) => user.id === id)),
  ]

  return orderedUserIds
    .filter((userId) => byUser.has(userId))
    .map((userId) => {
      const userPlans = byUser.get(userId)!
      const plansByDay = new Map<DayOfWeek, DailyMealPlanSummary>()
      let mealSlotCount = 0

      for (const plan of userPlans) {
        plansByDay.set(plan.dayOfWeek, plan)
        mealSlotCount = Math.max(mealSlotCount, plan.mealNames.length)
      }

      return {
        userId,
        userName: userPlans[0]?.userName ?? userId,
        plansByDay,
        mealSlotCount: Math.max(mealSlotCount, 1),
      }
    })
}

export const TIMETABLE_DAYS = DAY_OF_WEEK_OPTIONS
