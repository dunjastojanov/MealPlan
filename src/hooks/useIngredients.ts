import { useCallback, useEffect, useState } from 'react'
import {
  emptyIngredientFormValues,
  formValuesToUpdate,
  ingredientToFormValues,
  type IngredientFormValues,
} from '../lib/ingredientDisplay'
import { parseMealAmount } from '../lib/ingredientMealAmounts'
import {
  createIngredient,
  deleteIngredient,
  fetchIngredientMealUsages,
  fetchIngredients,
  type IngredientMealUsage,
  updateIngredient,
  updateMealIngredientAmounts,
} from '../services/ingredientService'
import { fetchIngredientTypes } from '../services/ingredientTypeService'
import { fetchMealOptions } from '../services/mealService'
import type { Ingredient, IngredientType, IngredientUnit, MealOption } from '../types'

export type { IngredientFormValues } from '../lib/ingredientDisplay'
export type { IngredientMealUsage } from '../services/ingredientService'
export { macroLabel, toDisplayMacro } from '../lib/ingredientDisplay'

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([])
  const [mealOptions, setMealOptions] = useState<MealOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<IngredientFormValues | null>(null)
  const [originalUnit, setOriginalUnit] = useState<IngredientUnit | null>(null)
  const [mealUsages, setMealUsages] = useState<IngredientMealUsage[]>([])
  const [mealAmounts, setMealAmounts] = useState<Record<string, string>>({})
  const [usagesLoading, setUsagesLoading] = useState(false)
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
        const [data, types, meals] = await Promise.all([
          fetchIngredients(),
          fetchIngredientTypes(),
          fetchMealOptions(),
        ])
        if (!cancelled) {
          setIngredients(data)
          setIngredientTypes(types)
          setMealOptions(meals)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Učitavanje sastojaka nije uspelo.')
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

  const editingIngredient =
    editingId != null ? (ingredients.find((item) => item.id === editingId) ?? null) : null

  const deletingIngredient =
    deletingId != null ? (ingredients.find((item) => item.id === deletingId) ?? null) : null

  const unitChanged =
    form != null && originalUnit != null && form.unit !== originalUnit

  const closeCreate = useCallback(() => {
    setCreating(false)
    setForm(null)
    setFormError(null)
  }, [])

  const openCreate = useCallback(() => {
    setCreating(true)
    setEditingId(null)
    setForm(emptyIngredientFormValues())
    setOriginalUnit(null)
    setMealUsages([])
    setMealAmounts({})
    setUsagesLoading(false)
    setFormError(null)
  }, [])

  const openEdit = useCallback((ingredient: Ingredient) => {
    setCreating(false)
    setEditingId(ingredient.id)
    setForm(ingredientToFormValues(ingredient))
    setOriginalUnit(ingredient.unit)
    setMealAmounts({})
    setMealUsages([])
    setFormError(null)
    setUsagesLoading(true)

    void fetchIngredientMealUsages(ingredient.id)
      .then((usages) => {
        setMealUsages(usages)
      })
      .catch((err) => {
        setFormError(
          err instanceof Error ? err.message : 'Učitavanje obroka za sastojak nije uspelo.',
        )
      })
      .finally(() => {
        setUsagesLoading(false)
      })
  }, [])

  const closeEdit = useCallback(() => {
    setCreating(false)
    setEditingId(null)
    setForm(null)
    setOriginalUnit(null)
    setMealUsages([])
    setMealAmounts({})
    setUsagesLoading(false)
    setFormError(null)
  }, [])

  const updateForm = useCallback((patch: Partial<IngredientFormValues>) => {
    setForm((current) => {
      if (!current) {
        return current
      }
      return { ...current, ...patch }
    })

    if (patch.unit !== undefined && originalUnit != null) {
      if (patch.unit !== originalUnit) {
        setMealAmounts((current) => {
          const next = { ...current }
          for (const usage of mealUsages) {
            if (!(usage.mealIngredientId in next)) {
              next[usage.mealIngredientId] = ''
            }
          }
          return next
        })
      } else {
        setMealAmounts({})
      }
    }

    setFormError(null)
  }, [mealUsages, originalUnit])

  useEffect(() => {
    if (!unitChanged || mealUsages.length === 0) {
      return
    }

    setMealAmounts((current) => {
      const next = { ...current }
      let changed = false
      for (const usage of mealUsages) {
        if (!(usage.mealIngredientId in next)) {
          next[usage.mealIngredientId] = ''
          changed = true
        }
      }
      return changed ? next : current
    })
  }, [mealUsages, unitChanged])

  const updateMealAmount = useCallback((mealIngredientId: string, amount: string) => {
    setMealAmounts((current) => ({ ...current, [mealIngredientId]: amount }))
    setFormError(null)
  }, [])

  const saveCreate = useCallback(async () => {
    if (!creating || !form || saving) {
      return
    }

    let payload
    try {
      payload = formValuesToUpdate(form, ingredientTypes)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nevažeće vrednosti u formi.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const created = await createIngredient(payload)
      setIngredients((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      )
      closeCreate()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Dodavanje sastojka nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closeCreate, creating, form, ingredientTypes, saving])

  const saveEdit = useCallback(async () => {
    if (!editingId || !form || saving || originalUnit == null) {
      return
    }

    let payload
    try {
      payload = formValuesToUpdate(form, ingredientTypes)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nevažeće vrednosti u formi.')
      return
    }

    const original = ingredients.find((item) => item.id === editingId)
    if (!original) {
      closeEdit()
      return
    }

    const unitChangedOnSave = payload.unit !== originalUnit
    let mealAmountUpdates: { id: string; amount: number }[] = []

    if (unitChangedOnSave && mealUsages.length > 0) {
      if (usagesLoading) {
        return
      }

      try {
        mealAmountUpdates = mealUsages.map((usage) => {
          const display = mealAmounts[usage.mealIngredientId]?.trim() ?? ''
          if (!display) {
            throw new Error(
              'Unesite novu količinu za sve obroke koji koriste ovaj sastojak.',
            )
          }
          return {
            id: usage.mealIngredientId,
            amount: parseMealAmount(display),
          }
        })
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : 'Unesite novu količinu za sve obroke koji koriste ovaj sastojak.',
        )
        return
      }
    }

    const unchanged =
      original.name === payload.name &&
      original.calories === payload.calories &&
      original.protein === payload.protein &&
      original.unit === payload.unit &&
      original.ingredientTypeId === payload.ingredient_type_id &&
      original.recipeId === payload.recipe_id

    if (unchanged) {
      closeEdit()
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (mealAmountUpdates.length > 0) {
        await updateMealIngredientAmounts(mealAmountUpdates)
      }

      const updated = await updateIngredient(editingId, payload)
      setIngredients((current) => current.map((item) => (item.id === editingId ? updated : item)))
      closeEdit()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ažuriranje sastojka nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [
    closeEdit,
    editingId,
    form,
    ingredientTypes,
    ingredients,
    mealAmounts,
    mealUsages,
    originalUnit,
    saving,
    usagesLoading,
  ])

  const openDelete = useCallback((ingredient: Ingredient) => {
    setDeletingId(ingredient.id)
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
      await deleteIngredient(deletingId)
      setIngredients((current) => current.filter((item) => item.id !== deletingId))
      if (editingId === deletingId) {
        closeEdit()
      }
      closeDelete()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Brisanje sastojka nije uspelo.')
    } finally {
      setDeleting(false)
    }
  }, [closeDelete, closeEdit, deleting, deletingId, editingId])

  return {
    ingredients,
    ingredientTypes,
    mealOptions,
    loading,
    error,
    editingIngredient,
    form,
    originalUnit,
    mealUsages,
    mealAmounts,
    usagesLoading,
    unitChanged,
    formError,
    saving,
    creating,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    updateForm,
    updateMealAmount,
    saveCreate,
    saveEdit,
    deletingIngredient,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  }
}
