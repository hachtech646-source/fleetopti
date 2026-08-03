import { supabase } from './supabase'
import type { MaintenanceRecord, MaintenanceRecordWithVehicle } from './types'

export async function getMaintenanceRecords(): Promise<MaintenanceRecordWithVehicle[]> {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*, vehicles(id, fleet_number, make, model, registration_number)')
    .order('service_date', { ascending: false })

  if (error) throw error
  return data as MaintenanceRecordWithVehicle[]
}

export async function createMaintenanceRecord(record: {
  vehicle_id: string
  service_type: string
  service_date?: string
  odometer_reading?: number
  technician?: string
  description?: string
  labour_cost?: number
  parts_cost?: number
  next_service_date?: string
  next_service_odometer?: number
  status?: string
}): Promise<MaintenanceRecord> {
  const { data, error } = await supabase
    .from('maintenance_records')
    .insert(record)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMaintenanceRecord(id: string): Promise<void> {
  const { error } = await supabase.from('maintenance_records').delete().eq('id', id)
  if (error) throw error
}