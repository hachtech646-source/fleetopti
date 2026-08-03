'use client'

import { useEffect, useState } from 'react'
import { getFuelRecords, createFuelRecord, deleteFuelRecord } from '@/lib/fuel'
import { getVehicles } from '@/lib/vehicles'
import type { FuelRecordWithVehicle, Vehicle } from '@/lib/types'

export default function FuelPage() {
  const [records, setRecords] = useState<FuelRecordWithVehicle[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [vehicleId, setVehicleId] = useState('')
  const [fuelDate, setFuelDate] = useState('')
  const [liters, setLiters] = useState('')
  const [cost, setCost] = useState('')
  const [odometerReading, setOdometerReading] = useState('')

  async function loadAll() {
    setLoading(true)
    try {
      const [recordsData, vehiclesData] = await Promise.all([
        getFuelRecords(),
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

    if (!vehicleId || !liters || !cost) {
      setError('Vehicle, liters, and cost are required.')
      return
    }

    setSaving(true)
    try {
      await createFuelRecord({
        vehicle_id: vehicleId,
        fuel_date: fuelDate || undefined,
        liters: Number(liters),
        cost: Number(cost),
        odometer_reading: odometerReading ? Number(odometerReading) : undefined,
      })

      setFuelDate('')
      setLiters('')
      setCost('')
      setOdometerReading('')
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fuel record')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this fuel record?')) return
    try {
      await deleteFuelRecord(id)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Fuel Tracking</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Fuel Log</h2>

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
          <label>Date: </label>
          <input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Liters: </label>
          <input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Cost: </label>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Odometer reading: </label>
          <input type="number" value={odometerReading} onChange={(e) => setOdometerReading(e.target.value)} />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add Fuel Log'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Fuel History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No fuel records yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Liters</th>
              <th>Cost</th>
              <th>Odometer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{r.vehicles ? `${r.vehicles.fleet_number || r.vehicles.registration_number} — ${r.vehicles.make} ${r.vehicles.model}` : 'Unknown vehicle'}</td>
                <td>{r.fuel_date}</td>
                <td>{r.liters}</td>
                <td>{r.cost}</td>
                <td>{r.odometer_reading ?? '-'}</td>
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