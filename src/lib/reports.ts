import { supabase } from './supabase'
import type { DashboardSummary, LowStockAlert, DriverWithVehicle } from './types'

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  const { data, error } = await supabase.from('dashboard_summary').select('*').single()
  if (error) throw error
  return data
}

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const { data, error } = await supabase.from('low_stock_alerts').select('*')
  if (error) throw error
  return data
}

export async function getTotalFuelCost(): Promise<number> {
  const { data, error } = await supabase.from('fuel_records').select('cost')
  if (error) throw error
  return data.reduce((sum, r) => sum + Number(r.cost), 0)
}

export async function getExpiringLicenses(): Promise<DriverWithVehicle[]> {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const { data, error } = await supabase
    .from('drivers')
    .select('*, vehicles(id, fleet_number, make, model, registration_number)')
    .lte('license_expiry', thirtyDaysFromNow.toISOString().split('T')[0])
    .order('license_expiry', { ascending: true })

  if (error) throw error
  return data as DriverWithVehicle[]
}

export async function getFuelByMonth(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${endDate}`

  const { data, error } = await supabase
    .from('fuel_records')
    .select('fuel_date, liters, cost, odometer_reading, vehicles(fleet_number, make, model, registration_number)')
    .gte('fuel_date', start)
    .lte('fuel_date', end)
    .order('fuel_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getAllStockLevels() {
  const { data, error } = await supabase
    .from('spare_parts')
    .select('part_code, part_name, stock_quantity, minimum_stock, cost_price, selling_price, storage_location')
    .order('part_name', { ascending: true })

  if (error) throw error
  return data
}export async function getUpcomingMaintenance() {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('next_service_date, next_service_odometer, vehicle_id, vehicles(fleet_number, make, model, registration_number)')
    .not('next_service_date', 'is', null)
    .order('next_service_date', { ascending: true })

  if (error) throw error
  return data
}export async function getVehiclesByStatus(status?: string) {
  let query = supabase.from('vehicles').select('*')
  if (status) query = query.eq('status', status)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllMaintenanceRecordsFull() {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*, vehicles(fleet_number, make, model, registration_number)')
    .order('service_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllFuelRecordsFull() {
  const { data, error } = await supabase
    .from('fuel_records')
    .select('*, vehicles(fleet_number, make, model, registration_number)')
    .order('fuel_date', { ascending: false })
  if (error) throw error
  return data
}