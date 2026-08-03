import * as XLSX from 'xlsx'
import { getFuelByMonth, getAllStockLevels, getLowStockAlerts, getExpiringLicenses, getUpcomingMaintenance } from './reports'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export async function exportMonthlyReport(year: number, month: number) {
  const [fuelData, stockData, lowStock, expiringLicenses, upcomingMaintenance] = await Promise.all([
    getFuelByMonth(year, month),
    getAllStockLevels(),
    getLowStockAlerts(),
    getExpiringLicenses(),
    getUpcomingMaintenance(),
  ])

  console.log('Export data counts:', {
    fuel: fuelData.length,
    stock: stockData.length,
    lowStock: lowStock.length,
    expiringLicenses: expiringLicenses.length,
    upcomingMaintenance: upcomingMaintenance.length,
  })

  const wb = XLSX.utils.book_new()

  const fuelRows = fuelData.map((r: any) => ({
    Date: r.fuel_date,
    Vehicle: r.vehicles
      ? `${r.vehicles.fleet_number || r.vehicles.registration_number} — ${r.vehicles.make} ${r.vehicles.model}`
      : 'Unknown',
    Liters: r.liters,
    Cost: r.cost,
    Odometer: r.odometer_reading ?? '',
  }))
  const totalLiters = fuelData.reduce((sum: number, r: any) => sum + Number(r.liters), 0)
  const totalCost = fuelData.reduce((sum: number, r: any) => sum + Number(r.cost), 0)
  fuelRows.push({ Date: '', Vehicle: 'TOTAL', Liters: totalLiters, Cost: totalCost, Odometer: '' })
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fuelRows), 'Fuel')

  const stockRows = stockData.map((p: any) => ({
    'Part Code': p.part_code,
    'Part Name': p.part_name,
    'Stock Qty': p.stock_quantity,
    'Minimum Stock': p.minimum_stock,
    'Cost Price': p.cost_price,
    'Selling Price': p.selling_price,
    Location: p.storage_location ?? '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stockRows), 'Stock')

  const issueRows: any[] = []
  lowStock.forEach((item) => {
    issueRows.push({
      Type: 'Low Stock',
      Detail: `${item.part_name} (${item.part_code})`,
      Info: `Stock: ${item.stock_quantity} / Min: ${item.minimum_stock}`,
    })
  })
  expiringLicenses.forEach((d: any) => {
    issueRows.push({
      Type: 'License Expiring',
      Detail: d.full_name,
      Info: `License ${d.license_number} expires ${d.license_expiry}`,
    })
  })
  if (issueRows.length === 0) {
    issueRows.push({ Type: 'None', Detail: 'No issues found', Info: '' })
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(issueRows), 'Issues')

  const maintenanceRows = upcomingMaintenance.map((m: any) => ({
    Vehicle: m.vehicles
      ? `${m.vehicles.fleet_number || m.vehicles.registration_number} — ${m.vehicles.make} ${m.vehicles.model}`
      : 'Unknown',
    'Next Service Date': m.next_service_date ?? '',
    'Next Service Odometer': m.next_service_odometer ?? '',
  }))
  if (maintenanceRows.length === 0) {
    maintenanceRows.push({ Vehicle: 'None scheduled', 'Next Service Date': '', 'Next Service Odometer': '' })
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(maintenanceRows), 'Maintenance Due')

  const fileName = `FleetOpti_Report_${MONTH_NAMES[month - 1]}_${year}.xlsx`
  XLSX.writeFile(wb, fileName)
}import { getVehiclesByStatus, getAllStockLevels as getStock, getAllMaintenanceRecordsFull, getAllFuelRecordsFull } from './reports'

function downloadSheet(rows: any[], sheetName: string, fileName: string) {
  const wb = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'No data found' }])
  XLSX.utils.book_append_sheet(wb, sheet, sheetName)
  XLSX.writeFile(wb, fileName)
}

export async function exportTotalVehicles() {
  const data = await getVehiclesByStatus()
  const rows = data.map((v: any) => ({
    'Fleet #': v.fleet_number ?? '',
    Make: v.make,
    Model: v.model,
    'Reg No': v.registration_number,
    Status: v.status,
    Odometer: v.current_odometer,
  }))
  downloadSheet(rows, 'All Vehicles', 'FleetOpti_All_Vehicles.xlsx')
}

export async function exportActiveVehicles() {
  const data = await getVehiclesByStatus('Active')
  const rows = data.map((v: any) => ({
    'Fleet #': v.fleet_number ?? '',
    Make: v.make,
    Model: v.model,
    'Reg No': v.registration_number,
    Status: v.status,
    Odometer: v.current_odometer,
  }))
  downloadSheet(rows, 'Active Vehicles', 'FleetOpti_Active_Vehicles.xlsx')
}

export async function exportAllStock() {
  const data = await getStock()
  const rows = data.map((p: any) => ({
    'Part Code': p.part_code,
    'Part Name': p.part_name,
    'Stock Qty': p.stock_quantity,
    'Minimum Stock': p.minimum_stock,
    'Cost Price': p.cost_price,
    'Selling Price': p.selling_price,
    Location: p.storage_location ?? '',
  }))
  downloadSheet(rows, 'Stock', 'FleetOpti_Stock_Report.xlsx')
}

export async function exportAllMaintenance() {
  const data = await getAllMaintenanceRecordsFull()
  const rows = data.map((m: any) => ({
    Vehicle: m.vehicles ? `${m.vehicles.fleet_number || m.vehicles.registration_number} — ${m.vehicles.make} ${m.vehicles.model}` : 'Unknown',
    'Service Type': m.service_type,
    Date: m.service_date,
    Technician: m.technician ?? '',
    'Labour Cost': m.labour_cost,
    'Parts Cost': m.parts_cost,
    Status: m.status,
  }))
  downloadSheet(rows, 'Maintenance', 'FleetOpti_Maintenance_Report.xlsx')
}

export async function exportAllFuel() {
  const data = await getAllFuelRecordsFull()
  const rows = data.map((f: any) => ({
    Vehicle: f.vehicles ? `${f.vehicles.fleet_number || f.vehicles.registration_number} — ${f.vehicles.make} ${f.vehicles.model}` : 'Unknown',
    Date: f.fuel_date,
    Liters: f.liters,
    Cost: f.cost,
    Odometer: f.odometer_reading ?? '',
  }))
  downloadSheet(rows, 'Fuel', 'FleetOpti_Fuel_Report.xlsx')
}