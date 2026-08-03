import { supabase } from './supabase'
import type { Vehicle } from './types'

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createVehicle(vehicle: {
  fleet_number?: string
  registration_number: string
  make: string
  model: string
  year?: number
  vin?: string
  engine_number?: string
  chassis_number?: string
  fuel_type?: string
  purchase_date?: string
  purchase_price?: number
  current_odometer?: number
  status?: string
  location?: string
  insurance_expiry?: string
  road_tax_expiry?: string
  notes?: string
}): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert(vehicle)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id)
  if (error) throw error
}