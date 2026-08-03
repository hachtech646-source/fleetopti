import { supabase } from './supabase'
import type { SparePart, SparePartWithCategory, SparePartCategory } from './types'

export async function getSpareParts(): Promise<SparePartWithCategory[]> {
  const { data, error } = await supabase
    .from('spare_parts')
    .select('*, spare_part_categories(id, category_name)')
    .order('part_name', { ascending: true })

  if (error) throw error
  return data as SparePartWithCategory[]
}

export async function getSparePartCategories(): Promise<SparePartCategory[]> {
  const { data, error } = await supabase
    .from('spare_part_categories')
    .select('*')
    .order('category_name', { ascending: true })

  if (error) throw error
  return data
}

export async function createSparePart(part: {
  part_code: string
  part_name: string
  category_id?: string
  brand?: string
  compatible_vehicle?: string
  supplier?: string
  cost_price?: number
  selling_price?: number
  stock_quantity?: number
  minimum_stock?: number
  storage_location?: string
  notes?: string
}): Promise<SparePart> {
  const { data, error } = await supabase
    .from('spare_parts')
    .insert(part)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSparePart(id: string): Promise<void> {
  const { error } = await supabase.from('spare_parts').delete().eq('id', id)
  if (error) throw error
}