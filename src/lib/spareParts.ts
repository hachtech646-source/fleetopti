import { supabase } from './supabase'
import type { SparePart, SparePartWithCategory, SparePartCategory } from './types'

export async function getSpareParts(): Promise<SparePartWithCategory[]> {
  const { data, error } = await supabase
    .from('spare_parts')
    .select('*, spare_part_categories(id, category_name), part_compatibility(vehicle_brands(*))')
    .order('part_name', { ascending: true })

  if (error) throw error
  return data as SparePartWithCategory[]
}

// Search spare parts compatible with a given vehicle brand (optionally narrowed by series)
export async function getPartsByVehicleBrand(
  brand: string,
  series?: string
): Promise<SparePartWithCategory[]> {
  let brandQuery = supabase.from('vehicle_brands').select('id').eq('brand', brand)
  if (series) brandQuery = brandQuery.eq('series', series)

  const { data: brands, error: brandError } = await brandQuery
  if (brandError) throw brandError
  if (!brands || brands.length === 0) return []

  const brandIds = brands.map((b: { id: string }) => b.id)

  const { data, error } = await supabase
    .from('spare_parts')
    .select('*, spare_part_categories(id, category_name), part_compatibility!inner(vehicle_brands(*))')
    .in('part_compatibility.vehicle_brand_id', brandIds)
    .order('part_name', { ascending: true })

  if (error) throw error
  return data as SparePartWithCategory[]
}

// Link a spare part to one or more compatible vehicle brands/series
export async function setPartCompatibility(
  sparePartId: string,
  vehicleBrandIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('part_compatibility')
    .delete()
    .eq('spare_part_id', sparePartId)

  if (deleteError) throw deleteError

  if (vehicleBrandIds.length === 0) return

  const rows = vehicleBrandIds.map((vehicle_brand_id) => ({
    spare_part_id: sparePartId,
    vehicle_brand_id,
  }))

  const { error: insertError } = await supabase.from('part_compatibility').insert(rows)
  if (insertError) throw insertError
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