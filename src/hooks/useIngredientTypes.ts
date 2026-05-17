import { useCallback, useEffect, useState } from 'react'
import {
  createIngredientType,
  deleteIngredientType,
  fetchIngredientTypes,
  swapIngredientTypeOrder,
  updateIngredientType,
} from '../services/ingredientTypeService'
import type { IngredientType } from '../types'

export function useIngredientTypes() {
  const [types, setTypes] = useState<IngredientType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadTypes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchIngredientTypes()
      setTypes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Učitavanje tipova nije uspelo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTypes()
  }, [loadTypes])

  const editingType = editingId != null ? (types.find((item) => item.id === editingId) ?? null) : null
  const deletingType = deletingId != null ? (types.find((item) => item.id === deletingId) ?? null) : null

  const closeCreate = useCallback(() => {
    setCreating(false)
    setFormName('')
    setFormError(null)
  }, [])

  const openCreate = useCallback(() => {
    setCreating(true)
    setEditingId(null)
    setFormName('')
    setFormError(null)
  }, [])

  const openEdit = useCallback((type: IngredientType) => {
    setCreating(false)
    setEditingId(type.id)
    setFormName(type.name)
    setFormError(null)
  }, [])

  const closeEdit = useCallback(() => {
    setEditingId(null)
    setFormName('')
    setFormError(null)
  }, [])

  const saveCreate = useCallback(async () => {
    if (!creating || saving) {
      return
    }

    const name = formName.trim()
    if (!name) {
      setFormError('Naziv je obavezan.')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const created = await createIngredientType({ name })
      setTypes((current) => [...current, created].sort((a, b) => a.number - b.number))
      closeCreate()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Dodavanje tipa nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closeCreate, creating, formName, saving])

  const saveEdit = useCallback(async () => {
    if (!editingId || saving) {
      return
    }

    const name = formName.trim()
    if (!name) {
      setFormError('Naziv je obavezan.')
      return
    }

    const original = types.find((item) => item.id === editingId)
    if (!original) {
      closeEdit()
      return
    }

    if (original.name === name) {
      closeEdit()
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const updated = await updateIngredientType(editingId, { name })
      setTypes((current) => current.map((item) => (item.id === editingId ? updated : item)))
      closeEdit()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ažuriranje tipa nije uspelo.')
    } finally {
      setSaving(false)
    }
  }, [closeEdit, editingId, formName, saving, types])

  const moveType = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      if (reorderingId != null) {
        return
      }

      setReorderingId(id)
      setError(null)

      try {
        const reordered = await swapIngredientTypeOrder(id, direction)
        setTypes(reordered)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Promena redosleda nije uspela.')
      } finally {
        setReorderingId(null)
      }
    },
    [reorderingId],
  )

  const openDelete = useCallback((type: IngredientType) => {
    setDeletingId(type.id)
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
      await deleteIngredientType(deletingId)
      setTypes((current) => current.filter((item) => item.id !== deletingId))
      if (editingId === deletingId) {
        closeEdit()
      }
      closeDelete()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Brisanje tipa nije uspelo.')
    } finally {
      setDeleting(false)
    }
  }, [closeDelete, closeEdit, deleting, deletingId, editingId])

  return {
    types,
    loading,
    error,
    creating,
    editingType,
    formName,
    formError,
    saving,
    reorderingId,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    setFormName,
    saveCreate,
    saveEdit,
    moveType,
    deletingType,
    deleteError,
    deleting,
    openDelete,
    closeDelete,
    confirmDelete,
  }
}
