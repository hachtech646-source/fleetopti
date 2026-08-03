'use client'

import { useEffect, useState } from 'react'
import {
  getDashboardSummary,
  getLowStockAlerts,
  getTotalFuelCost,
  getExpiringLicenses,
} from '@/lib/reports'
import {
  exportMonthlyReport,
  exportTotalVehicles,
  exportActiveVehicles,
  exportAllStock,
  exportAllMaintenance,
  exportAllFuel,
} from '@/lib/exportReport'
import type { DashboardSummary, LowStockAlert, DriverWithVehicle } from '@/lib/types'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([])
  const [totalFuelCost, setTotalFuelCost] = useState(0)
  const [expiringLicenses, setExpiringLicenses] = useState<DriverWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1)
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [summaryData, lowStockData, fuelCost, licenses] = await Promise.all([
          getDashboardSummary(),
          getLowStockAlerts(),
          getTotalFuelCost(),
          getExpiringLicenses(),
        ])
        setSummary(summaryData)
        setLowStock(lowStockData)
        setTotalFuelCost(fuelCost)
        setExpiringLicenses(licenses)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleExport() {
    setExporting(true)
    try {
      await exportMonthlyReport(reportYear, reportMonth)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  async function handleCardClick(exportFn: () => Promise<void>, label: string) {
    const confirmed = confirm(`Export ${label} report to Excel?`)
    if (!confirmed) return

    try {
      await exportFn()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>

  const cardStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: '1rem',
    minWidth: 150,
    textAlign: 'center',
    cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 950, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Dashboard</h1>

      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <label>Month: </label>
        <select value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <label>Year: </label>
        <input
          type="number"
          value={reportYear}
          onChange={(e) => setReportYear(Number(e.target.value))}
          style={{ width: 80 }}
        />
        <button onClick={handleExport} disabled={exporting}>
          {exporting ? 'Generating...' : 'Export Monthly Report (Excel)'}
        </button>
      </div>

      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        Tip: click any card below to download a focused report for that category.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={cardStyle} onClick={() => handleCardClick(exportTotalVehicles, 'Total Vehicles')} title="Click to export all vehicles">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary?.total_vehicles ?? 0}</div>
          <div>Total Vehicles</div>
        </div>
        <div style={cardStyle} onClick={() => handleCardClick(exportActiveVehicles, 'Active Vehicles')} title="Click to export active vehicles">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary?.active_vehicles ?? 0}</div>
          <div>Active Vehicles</div>
        </div>
        <div style={cardStyle} onClick={() => handleCardClick(exportAllStock, 'Total Parts / Stock')} title="Click to export stock report">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary?.total_parts ?? 0}</div>
          <div>Total Parts</div>
        </div>
        <div style={cardStyle} onClick={() => handleCardClick(exportAllStock, 'Inventory Value / Stock')} title="Click to export stock report">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary?.inventory_value ?? 0}</div>
          <div>Inventory Value</div>
        </div>
        <div style={cardStyle} onClick={() => handleCardClick(exportAllMaintenance, 'Maintenance')} title="Click to export maintenance report">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{summary?.total_maintenance_cost ?? 0}</div>
          <div>Maintenance Cost</div>
        </div>
        <div style={cardStyle} onClick={() => handleCardClick(exportAllFuel, 'Fuel')} title="Click to export fuel report">
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalFuelCost}</div>
          <div>Total Fuel Cost</div>
        </div>
      </div>

      <h2>Low Stock Alerts</h2>
      {lowStock.length === 0 ? (
        <p>No low stock alerts. Everything is well stocked.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Code</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Minimum</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((item) => (
              <tr key={item.part_code} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff3f3' }}>
                <td>{item.part_code}</td>
                <td>{item.part_name}</td>
                <td>{item.stock_quantity}</td>
                <td>{item.minimum_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Expiring Driver Licenses (next 30 days)</h2>
      {expiringLicenses.length === 0 ? (
        <p>No licenses expiring soon.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Driver</th>
              <th>License #</th>
              <th>Expiry</th>
              <th>Assigned Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {expiringLicenses.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #eee', backgroundColor: '#fff3f3' }}>
                <td>{d.full_name}</td>
                <td>{d.license_number}</td>
                <td>{d.license_expiry}</td>
                <td>{d.vehicles ? (d.vehicles.fleet_number || d.vehicles.registration_number) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}