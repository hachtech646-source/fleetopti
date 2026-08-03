import { supabase } from './supabase'
import type { Driver, DriverWithVehicle } from './types'

export async function getDrivers(): Promise<DriverWithVehicle[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*, vehicles(id, fleet_number, make, model, registration_number)')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data as DriverWithVehicle[]
}

export async function createDriver(driver: {
  full_name: string
  license_number: string
  license_expiry?: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  assigned_vehicle_id?: string
  status?: string
}): Promise<Driver> {
  const { data, error } = await supabase
    .from('drivers')
    .insert(driver)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDriver(id: string): Promise<void> {
  const { error } = await supabase.from('drivers').delete().eq('id', id)
  if (error) throw error
}