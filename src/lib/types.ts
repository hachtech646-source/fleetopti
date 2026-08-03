export interface VehicleType {
  id: string
  category: string
  make: string
  model: string
  created_at: string
}

export interface Vehicle {
  id: string
  fleet_number: string | null
  registration_number: string
  make: string
  model: string
  year: number | null
  vin: string | null
  engine_number: string | null
  chassis_number: string | null
  fuel_type: string | null
  purchase_date: string | null
  purchase_price: number | null
  current_odometer: number
  status: string
  category: 'Small Vehicle' | 'Commercial' | 'Heavy Duty' | null
  brand_series: string | null
  location: string | null
  insurance_expiry: string | null
  road_tax_expiry: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VehicleBrand {
  id: string
  category: 'Small Vehicle' | 'Commercial' | 'Heavy Duty'
  brand: string
  series: string | null
  created_at: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role_id: string | null
  created_at: string
  updated_at: string
}
export interface MaintenanceRecord {
  id: string
  vehicle_id: string | null
  service_type: string
  service_date: string
  odometer_reading: number | null
  technician: string | null
  description: string | null
  labour_cost: number
  parts_cost: number
  total_cost: number
  next_service_date: string | null
  next_service_odometer: number | null
  status: string
  created_at: string
}

export interface MaintenanceRecordWithVehicle extends MaintenanceRecord {
  vehicles: { id: string; fleet_number: string | null; make: string; model: string; registration_number: string } | null
}
export interface SparePartCategory {
  id: string
  category_name: string
  description: string | null
  created_at: string
}

export interface SparePart {
  id: string
  part_code: string
  part_name: string
  category_id: string | null
  brand: string | null
  compatible_vehicle: string | null
  supplier: string | null
  cost_price: number
  selling_price: number
  stock_quantity: number
  minimum_stock: number
  storage_location: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SparePartWithCategory extends SparePart {
  spare_part_categories: { id: string; category_name: string } | null
  part_compatibility?: { vehicle_brands: VehicleBrand }[]
}

export interface PartCompatibility {
  id: string
  spare_part_id: string
  vehicle_brand_id: string
  created_at: string
}
export interface FuelRecord {
  id: string
  vehicle_id: string
  fuel_date: string
  liters: number
  cost: number
  odometer_reading: number | null
  created_at: string
}

export interface FuelRecordWithVehicle extends FuelRecord {
  vehicles: { id: string; fleet_number: string | null; make: string; model: string; registration_number: string } | null
}
export interface Driver {
  id: string
  full_name: string
  license_number: string
  license_expiry: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  hire_date: string | null
  assigned_vehicle_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface DriverWithVehicle extends Driver {
  vehicles: { id: string; fleet_number: string | null; make: string; model: string; registration_number: string } | null
}
export interface DashboardSummary {
  total_vehicles: number
  active_vehicles: number
  total_parts: number
  inventory_value: number
  total_maintenance_cost: number
}

export interface LowStockAlert {
  part_code: string
  part_name: string
  stock_quantity: number
  minimum_stock: number
}