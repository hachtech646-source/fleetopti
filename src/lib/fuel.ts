import { supabase } from './supabase'
import type { FuelRecord, FuelRecordWithVehicle } from './types'

export async function getFuelRecords(): Promise<FuelRecordWithVehicle[]> {
  const { data, error } = await supabase
    .from('fuel_records')
    .select('*, vehicles(id, fleet_number, make, model, registration_number)')
    .order('fuel_date', { ascending: false })

  if (error) throw error
  return data as FuelRecordWithVehicle[]
}

export async function createFuelRecord(record: {
  vehicle_id: string
  fuel_date?: string
  liters: number
  cost: number
  odometer_reading?: number
}): Promise<FuelRecord> {
  const { data, error } = await supabase
    .from('fuel_records')
    .insert(record)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFuelRecord(id: string): Promise<void> {
  const { error } = await supabase.from('fuel_records').delete().eq('id', id)
  if (error) throw error
}