'use client'

import { useEffect, useState } from 'react'
import { getDrivers, createDriver, deleteDriver } from '@/lib/drivers'
import { getVehicles } from '@/lib/vehicles'
import type { DriverWithVehicle, Vehicle } from '@/lib/types'

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false
  const days = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days <= 30
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverWithVehicle[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseExpiry, setLicenseExpiry] = useState('')
  const [phone, setPhone] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [assignedVehicleId, setAssignedVehicleId] = useState('')

  async function loadAll() {
    setLoading(true)
    try {
      const [driversData, vehiclesData] = await Promise.all([
        getDrivers(),
        getVehicles(),
      ])
      setDrivers(driversData)
      setVehicles(vehiclesData)
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

    if (!fullName.trim() || !licenseNumber.trim()) {
      setError('Full name and license number are required.')
      return
    }

    setSaving(true)
    try {
      await createDriver({
        full_name: fullName.trim(),
        license_number: licenseNumber.trim(),
        license_expiry: licenseExpiry || undefined,
        phone: phone.trim() || undefined,
        emergency_contact_name: emergencyContactName.trim() || undefined,
        emergency_contact_phone: emergencyContactPhone.trim() || undefined,
        hire_date: hireDate || undefined,
        assigned_vehicle_id: assignedVehicleId || undefined,
      })

      setFullName('')
      setLicenseNumber('')
      setLicenseExpiry('')
      setPhone('')
      setEmergencyContactName('')
      setEmergencyContactPhone('')
      setHireDate('')
      setAssignedVehicleId('')
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save driver')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this driver?')) return
    try {
      await deleteDriver(id)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete driver')
    }
  }

  return (
    <div style={{ maxWidth: 850, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Drivers</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Driver</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Full name: </label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>License number: </label>
          <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>License expiry: </label>
          <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Phone: </label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Emergency contact name: </label>
          <input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Emergency contact phone: </label>
          <input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Hire date: </label>
          <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Assigned vehicle: </label>
          <select value={assignedVehicleId} onChange={(e) => setAssignedVehicleId(e.target.value)}>
            <option value="">-- None --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.fleet_number ? `${v.fleet_number} — ` : ''}{v.make} {v.model} ({v.registration_number})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add Driver'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Driver List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : drivers.length === 0 ? (
        <p>No drivers yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Name</th>
              <th>License #</th>
              <th>Expiry</th>
              <th>Phone</th>
              <th>Assigned Vehicle</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr
                key={d.id}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: isExpiringSoon(d.license_expiry) ? '#fff3f3' : undefined,
                }}
              >
                <td>{d.full_name}</td>
                <td>{d.license_number}</td>
                <td>{d.license_expiry ?? '-'}</td>
                <td>{d.phone ?? '-'}</td>
                <td>{d.vehicles ? `${d.vehicles.fleet_number || d.vehicles.registration_number}` : '-'}</td>
                <td>{d.status}</td>
                <td>
                  <button onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}