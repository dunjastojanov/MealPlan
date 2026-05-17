import { useCallback, useEffect, useState } from 'react'
import {
  emptyMealFormValues,
  formValuesToUpdate,
  mealToFormValues,
  mealUpdateEquals,
  type MealFormValues,
} from '../lib/mealForm'
import { fetchIngredients } from '../services/ingredientService'
import { createMeal, deleteMeal, fetchMeals, updateMeal } from '../services/mealService'
import type { Ingredient, Meal } from '../types'

export type { MealFormValues } from '../lib/mealForm'
export { formatMealMacros } from '../lib/mealMacros'

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [catalog, setCatalog] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MealFormValues | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [mealsData, catalogData] = await Promise.all([
          fetchMeals(),
          fetchIngredients(),
        ])
        if (!cancelled) {
          setMeals(mealsData)
          setCatalog(catalogData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Učitavanje obroka nije uspelo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const editingMeal =
    editingId != null ? (meals.find((item) => item.id === editingId) ?? null) : null

  const deletingMeal =
    deletingId != null ? (meals.find((item) => item.id === deletingId) ?? null) : null

  const closeCreate = useCallback(() => {
    setCreating(false)
    setForm(null)
    setFormError(null)
  }, [])

  const openCreate = useCallback(() => {
    setCreating(true)
    setEditingId(null)
    setForm(emptyMealFormValues())
    setFormError(null)
  }, [])

  const openEdit = useCallback((meal: Meal) => {
    setCreating(false)
    setEditingId(meal.id)
    setForm(mealToFormValues(meal))
    setFormError(null)
  }, [])

  const closeEdit = useCallback(() => {
    setCreating(false)
    setEditingId(null)
    setForm(null)
    setFormError(null)
  }, [])

  const updateForm = useCallback((next: MealFormValues) => {
    setForm(next)
    setFormError(null)
  }, [])

  const saveCreate = useCallback(async () => {
    if (!creating || !form || saving) {
      return
    }

    let payload
    try {
      payload = formValuesToUpdate(form)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nevažeće vrednosti u formi.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const created = await createMeal(payload)
      setMeals((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      )
      closeCreate()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Dodavanje obroka nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closeCreate, creating, form, saving])

  const saveEdit = useCallback(async () => {
    if (!editingId || !form || saving) {
      return
    }

    let payload
    try {
      payload = formValuesToUpdate(form)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nevažeće vrednosti u formi.')
      return
    }

    const original = meals.find((item) => item.id === editingId)
    if (!original) {
      closeEdit()
      return
    }

    if (mealUpdateEquals(original, payload)) {
      closeEdit()
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const updated = await updateMeal(editingId, payload)
      setMeals((current) => current.map((item) => (item.id === editingId ? updated : item)))
      closeEdit()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ažuriranje obroka nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closeEdit, editingId, form, meals, saving])

  const openDelete = useCallback((meal: Meal) => {
    setDeletingId(meal.id)
    setDeleteError(null)
  }, [])

  const closeDelete = useCallback(() => {
    setDeletingId(null)
    setDeleteError(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deletingId || deleting) {
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteMeal(deletingId)
      setMeals((current) => current.filter((item) => item.id !== deletingId))
      if (editingId === deletingId) {
        closeEdit()
      }
      closeDelete()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Brisanje obroka nije uspelo.')
    } finally {
      setDeleting(false)
    }
  }, [closeDelete, closeEdit, deleting, deletingId, editingId])

  return {
    meals,
    catalog,
    loading,
    error,
    editingMeal,
    form,
    formError,
    saving,
    creating,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    updateForm,
    saveCreate,
    saveEdit,
    deletingMeal,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  }
}
