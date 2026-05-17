import { supabase } from '../lib/supabase'
import type { IngredientType } from '../types'

export type IngredientTypeUpdate = {
  name: string
}

function mapRow(row: {
  id: string
  number: number
  name: string
}): IngredientType {
  return {
    id: row.id,
    number: row.number,
    name: row.name,
  }
}

export async function fetchIngredientTypes(): Promise<IngredientType[]> {
  const { data, error } = await supabase
    .from('ingredient_type')
    .select('id, number, name')
    .order('number')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapRow)
}

export async function createIngredientType(
  update: IngredientTypeUpdate,
): Promise<IngredientType> {
  const existing = await fetchIngredientTypes()
  const maxNumber = existing.reduce((max, item) => Math.max(max, item.number), 0)
  const number = maxNumber + 1

  const { data, error } = await supabase
    .from('ingredient_type')
    .insert({ name: update.name.trim(), number })
    .select('id, number, name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapRow(data)
}

export async function updateIngredientType(
  id: string,
  update: IngredientTypeUpdate,
): Promise<IngredientType> {
  const { data, error } = await supabase
    .from('ingredient_type')
    .update({ name: update.name.trim() })
    .eq('id', id)
    .select('id, number, name')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapRow(data)
}

export async function deleteIngredientType(id: string): Promise<void> {
  const { error } = await supabase.from('ingredient_type').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      throw new Error('Tip se ne može obrisati jer ga koriste sastojci.')
    }
    throw new Error(error.message)
  }
}

export async function swapIngredientTypeOrder(
  id: string,
  direction: 'up' | 'down',
): Promise<IngredientType[]> {
  const types = await fetchIngredientTypes()
  const index = types.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Tip nije pronađen.')
  }

  const neighborIndex = direction === 'up' ? index - 1 : index + 1
  if (neighborIndex < 0 || neighborIndex >= types.length) {
    return types
  }

  const current = types[index]
  const neighbor = types[neighborIndex]

  const results = await Promise.all([
    supabase.from('ingredient_type').update({ number: neighbor.number }).eq('id', current.id),
    supabase.from('ingredient_type').update({ number: current.number }).eq('id', neighbor.id),
  ])

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(failed.error.message)
  }

  return fetchIngredientTypes()
}
