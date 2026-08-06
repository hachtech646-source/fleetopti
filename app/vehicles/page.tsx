'use client'

import { useEffect, useState } from 'react'
import { getVehicles, createVehicle, deleteVehicle, getVehicleBrands } from '@/lib/vehicles'
import type { Vehicle, VehicleBrand } from '@/lib/types'

const CATEGORIES = ['Small Vehicle', 'Commercial', 'Heavy Duty'] as const

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [brandId, setBrandId] = useState<string>('')
  const [customMake, setCustomMake] = useState('')
  const [model, setModel] = useState('')
  const [fleetNumber, setFleetNumber] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [insuranceExpiry, setInsuranceExpiry] = useState('')
  const [roadTaxExpiry, setRoadTaxExpiry] = useState('')

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

  async function loadBrands(cat: string) {
    try {
      const data = await getVehicleBrands(cat)
      setBrands(data)
      setBrandId(data.length > 0 ? data[0].id : '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle brands')
    }
  }

  useEffect(() => {
    loadVehicles()
    loadBrands(CATEGORIES[0])
  }, [])

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setBrandId('')
    setCustomMake('')
    loadBrands(cat)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const selectedBrand = brands.find((b) => b.id === brandId)
    const make = brandId === 'custom' ? customMake.trim() : selectedBrand?.brand || ''
    const brandSeries = brandId === 'custom' ? undefined : selectedBrand?.series || undefined

    if (!make || !registrationNumber.trim()) {
      setError('Make/brand and registration number are required.')
      return
    }

    setSaving(true)
    try {
      await createVehicle({
        make,
        model: model.trim() || '-',
        registration_number: registrationNumber.trim(),
        fleet_number: fleetNumber.trim() || undefined,
        category,
        brand_series: brandSeries,
        insurance_expiry: insuranceExpiry || undefined,
        road_tax_expiry: roadTaxExpiry || undefined,
      })
      setBrandId(brands.length > 0 ? brands[0].id : '')
      setCustomMake('')
      setModel('')
      setFleetNumber('')
      setRegistrationNumber('')
      setInsuranceExpiry('')
      setRoadTaxExpiry('')
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
      <h1>FleetOpti - Vehicles</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Vehicle</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Category: </label>
          <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Brand{brands.some((b) => b.series) ? ' / Series' : ''}: </label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.brand}{b.series ? ` - ${b.series}` : ''}</option>
            ))}
            <option value="custom">Other / Custom</option>
          </select>
        </div>

        {brandId === 'custom' && (
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

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Insurance expiry (optional): </label>
          <input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Road tax expiry (optional): </label>
          <input type="date" value={roadTaxExpiry} onChange={(e) => setRoadTaxExpiry(e.target.value)} />
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
              <th>Category</th>
              <th>Make</th>
              <th>Series</th>
              <th>Model</th>
              <th>Reg. No.</th>
              <th>Insurance</th>
              <th>Road Tax</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{v.fleet_number || '-'}</td>
                <td>{v.category || '-'}</td>
                <td>{v.make}</td>
                <td>{v.brand_series || '-'}</td>
                <td>{v.model}</td>
                <td>{v.registration_number}</td>
                <td>{v.insurance_expiry || '-'}</td>
                <td>{v.road_tax_expiry || '-'}</td>
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
