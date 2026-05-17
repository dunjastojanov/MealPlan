import { supabase } from '../lib/supabase'
import type { User } from '../types'

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, calorie_goal, protein_goal')
    .order('first_name')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    calorie_goal: Number(row.calorie_goal),
    protein_goal: Number(row.protein_goal),
  }))
}
