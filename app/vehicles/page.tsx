'use client'

import { useEffect, useState } from 'react'
import { getVehicles, createVehicle, deleteVehicle } from '@/lib/vehicles'
import type { Vehicle } from '@/lib/types'

const PRESET_VEHICLES = [
  'Toyota',
  'Scania R Series',
  'Scania P Series',
  'Scania G Series',
  'Howo 371',
  'Howo 380',
  'Howo N7',
  'Custom',
]

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [preset, setPreset] = useState(PRESET_VEHICLES[0])
  const [customMake, setCustomMake] = useState('')
  const [model, setModel] = useState('')
  const [fleetNumber, setFleetNumber] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')

  async function loadVehicles() {
    setLoading(true)
    try {
      const data = await getVehicles()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const make = preset === 'Custom' ? customMake.trim() : preset
    if (!make || !registrationNumber.trim()) {
      setError('Make and registration number are required.')
      return
    }

    setSaving(true)
    try {
      await createVehicle({
        make,
        model: model.trim() || '-',
        registration_number: registrationNumber.trim(),
        fleet_number: fleetNumber.trim() || undefined,
      })
      setPreset(PRESET_VEHICLES[0])
      setCustomMake('')
      setModel('')
      setFleetNumber('')
      setRegistrationNumber('')
      await loadVehicles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this vehicle?')) return
    try {
      await deleteVehicle(id)
      await loadVehicles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Vehicles</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Vehicle</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Make / Type: </label>
          <select value={preset} onChange={(e) => setPreset(e.target.value)}>
            {PRESET_VEHICLES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {preset === 'Custom' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Custom make: </label>
            <input value={customMake} onChange={(e) => setCustomMake(e.target.value)} placeholder="e.g. Isuzu FRR" />
          </div>
        )}

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Model: </label>
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Hilux" />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Fleet number (optional): </label>
          <input value={fleetNumber} onChange={(e) => setFleetNumber(e.target.value)} placeholder="e.g. FLT-001" />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Registration number: </label>
          <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="e.g. BAT 1234" />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add Vehicle'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Vehicle List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : vehicles.length === 0 ? (
        <p>No vehicles yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Fleet #</th>
              <th>Make</th>
              <th>Model</th>
              <th>Reg. No.</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{v.fleet_number || '-'}</td>
                <td>{v.make}</td>
                <td>{v.model}</td>
                <td>{v.registration_number}</td>
                <td>{v.status}</td>
                <td>
                  <button onClick={() => handleDelete(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}