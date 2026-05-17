import { useCallback, useState } from 'react'
import {
  addMealToForm,
  detailToFormValues,
  formValuesToUpdatePayload,
  mealPlanUpdateEquals,
  removeMealFromForm,
  type MealPlanFormValues,
} from '../lib/mealPlanForm'
import { useMealPlanCatalog } from './useMealPlanCatalog'
import {
  dailyPlanDetailToSummary,
  fetchDailyMealPlan,
  updateDailyMealPlan,
} from '../services/mealPlanService'
import type { DailyMealPlanSummary } from '../types'

export type { MealPlanFormValues } from '../lib/mealPlanForm'

export function useMealPlans() {
  const { plans, users, meals, ingredients, loading, error, setPlans } = useMealPlanCatalog()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDetail, setEditingDetail] = useState<Awaited<
    ReturnType<typeof fetchDailyMealPlan>
  > | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [form, setForm] = useState<MealPlanFormValues | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const editingPlan =
    editingId != null ? (plans.find((item) => item.id === editingId) ?? null) : null

  const closePanel = useCallback(() => {
    setEditingId(null)
    setEditingDetail(null)
    setForm(null)
    setFormError(null)
  }, [])

  const openEdit = useCallback(async (plan: DailyMealPlanSummary) => {
    setEditingId(plan.id)
    setForm(null)
    setFormError(null)
    setDetailLoading(true)

    try {
      const detail = await fetchDailyMealPlan(plan.id)
      setEditingDetail(detail)
      setForm(detailToFormValues(detail))
    } catch (err) {
      setEditingId(null)
      setFormError(err instanceof Error ? err.message : 'Učitavanje plana nije uspelo.')
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const addMealToDay = useCallback((mealId: string) => {
    if (!mealId) {
      setFormError('Izaberite obrok.')
      return
    }
    setForm((current) => (current ? addMealToForm(current, mealId) : current))
    setFormError(null)
  }, [])

  const removeMealFromDay = useCallback((index: number) => {
    setForm((current) => (current ? removeMealFromForm(current, index) : current))
    setFormError(null)
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingId || !form || !editingDetail || saving) {
      return
    }

    let payload
    try {
      payload = formValuesToUpdatePayload(form)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nevažeće vrednosti u formi.')
      return
    }

    if (mealPlanUpdateEquals(editingDetail, payload)) {
      closePanel()
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      await updateDailyMealPlan(editingId, payload)
      const detail = await fetchDailyMealPlan(editingId)
      const user = users.find((item) => item.id === detail.userId)
      const userName = user ? `${user.first_name} ${user.last_name}` : detail.userId
      const summary = dailyPlanDetailToSummary(detail, userName)
      setPlans((current) => current.map((item) => (item.id === editingId ? summary : item)))
      closePanel()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ažuriranje plana nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closePanel, editingDetail, editingId, form, saving, users])

  return {
    plans,
    users,
    meals,
    ingredients,
    loading,
    error,
    editingPlan,
    detailLoading,
    form,
    formError,
    saving,
    closeEdit: closePanel,
    openEdit,
    addMealToDay,
    removeMealFromDay,
    saveEdit,
  }
}
