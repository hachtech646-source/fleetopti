'use client'

import { useEffect, useState } from 'react'
import { getMaintenanceRecords, createMaintenanceRecord, deleteMaintenanceRecord } from '@/lib/maintenance'
import { getVehicles } from '@/lib/vehicles'
import type { MaintenanceRecordWithVehicle, Vehicle } from '@/lib/types'

const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Engine Repair',
  'General Inspection',
  'Other',
]

const STATUS_OPTIONS = ['Completed', 'In Progress', 'Scheduled']

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecordWithVehicle[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vehicleId, setVehicleId] = useState('')
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0])
  const [serviceDate, setServiceDate] = useState('')
  const [odometerReading, setOdometerReading] = useState('')
  const [technician, setTechnician] = useState('')
  const [description, setDescription] = useState('')
  const [labourCost, setLabourCost] = useState('')
  const [partsCost, setPartsCost] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')
  const [nextServiceOdometer, setNextServiceOdometer] = useState('')
  const [status, setStatus] = useState(STATUS_OPTIONS[0])

  async function loadAll() {
    setLoading(true)
    try {
      const [recordsData, vehiclesData] = await Promise.all([
        getMaintenanceRecords(),
        getVehicles(),
      ])
      setRecords(recordsData)
      setVehicles(vehiclesData)
      if (vehiclesData.length > 0) setVehicleId(vehiclesData[0].id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!vehicleId) {
      setError('Please select a vehicle.')
      return
    }

    setSaving(true)
    try {
      await createMaintenanceRecord({
        vehicle_id: vehicleId,
        service_type: serviceType,
        service_date: serviceDate || undefined,
        odometer_reading: odometerReading ? Number(odometerReading) : undefined,
        technician: technician.trim() || undefined,
        description: description.trim() || undefined,
        labour_cost: labourCost ? Number(labourCost) : undefined,
        parts_cost: partsCost ? Number(partsCost) : undefined,
        next_service_date: nextServiceDate || undefined,
        next_service_odometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined,
        status,
      })

      setServiceDate('')
      setOdometerReading('')
      setTechnician('')
      setDescription('')
      setLabourCost('')
      setPartsCost('')
      setNextServiceDate('')
      setNextServiceOdometer('')
      setStatus(STATUS_OPTIONS[0])
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save maintenance record')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this maintenance record?')) return
    try {
      await deleteMaintenanceRecord(id)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Maintenance Records</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Maintenance Record</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Vehicle: </label>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.length === 0 && <option value="">No vehicles found</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.fleet_number ? `${v.fleet_number} — ` : ''}{v.make} {v.model} ({v.registration_number})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Service type: </label>
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Service date: </label>
          <input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Odometer reading: </label>
          <input type="number" value={odometerReading} onChange={(e) => setOdometerReading(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Technician: </label>
          <input value={technician} onChange={(e) => setTechnician(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Description: </label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Labour cost: </label>
          <input type="number" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Parts cost: </label>
          <input type="number" value={partsCost} onChange={(e) => setPartsCost(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Next service date: </label>
          <input type="date" value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Next service odometer: </label>
          <input type="number" value={nextServiceOdometer} onChange={(e) => setNextServiceOdometer(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Status: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add Record'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Maintenance History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No maintenance records yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Date</th>
              <th>Labour</th>
              <th>Parts</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{r.vehicles ? `${r.vehicles.fleet_number || r.vehicles.registration_number} — ${r.vehicles.make} ${r.vehicles.model}` : 'Unknown vehicle'}</td>
                <td>{r.service_type}</td>
                <td>{r.service_date}</td>
                <td>{r.labour_cost}</td>
                <td>{r.parts_cost}</td>
                <td>{r.status}</td>
                <td>
                  <button onClick={() => handleDelete(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}