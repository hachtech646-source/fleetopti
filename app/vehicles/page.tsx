'use client'

import { useEffect, useMemo, useState } from 'react'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleBrands } from '@/lib/vehicles'
import type { Vehicle, VehicleBrand } from '@/lib/types'

const CATEGORIES = ['Small Vehicle', 'Commercial', 'Heavy Duty'] as const

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)

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
      if (!editingId) {
        setBrandId(data.length > 0 ? data[0].id : '')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle brands')
    }
  }

  useEffect(() => {
    loadVehicles()
    loadBrands(CATEGORIES[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setEditingId(null)
    setCategory(CATEGORIES[0])
    setBrandId(brands.length > 0 ? brands[0].id : '')
    setCustomMake('')
    setModel('')
    setFleetNumber('')
    setRegistrationNumber('')
    setInsuranceExpiry('')
    setRoadTaxExpiry('')
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setBrandId('')
    setCustomMake('')
    loadBrands(cat)
  }

  function startEdit(v: Vehicle) {
    setEditingId(v.id)
    setCategory(v.category || CATEGORIES[0])
    setModel(v.model)
    setFleetNumber(v.fleet_number || '')
    setRegistrationNumber(v.registration_number)
    setInsuranceExpiry(v.insurance_expiry || '')
    setRoadTaxExpiry(v.road_tax_expiry || '')
    setCustomMake(v.make)
    setBrandId('custom')
    loadBrands(v.category || CATEGORIES[0])
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      if (editingId) {
        await updateVehicle(editingId, {
          make,
          model: model.trim() || '-',
          registration_number: registrationNumber.trim(),
          fleet_number: fleetNumber.trim() || undefined,
          category,
          brand_series: brandSeries,
          insurance_expiry: insuranceExpiry || undefined,
          road_tax_expiry: roadTaxExpiry || undefined,
        })
      } else {
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
      }
      resetForm()
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
      if (editingId === id) resetForm()
      await loadVehicles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle')
    }
  }

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return vehicles
    return vehicles.filter((v) => {
      return (
        (v.fleet_number || '').toLowerCase().includes(term) ||
        v.registration_number.toLowerCase().includes(term) ||
        v.make.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        (v.category || '').toLowerCase().includes(term) ||
        (v.brand_series || '').toLowerCase().includes(term)
      )
    })
  }, [vehicles, search])

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti - Vehicles</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>

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
          {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vehicle'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>
            Cancel
          </button>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Vehicle List</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by fleet #, reg. no, make, model, category..."
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredVehicles.length === 0 ? (
        <p>{vehicles.length === 0 ? 'No vehicles yet.' : 'No vehicles match your search.'}</p>
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
            {filteredVehicles.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee', backgroundColor: editingId === v.id ? '#eef6ff' : undefined }}>
                <td>{v.fleet_number || '-'}</td>
                <td>{v.category || '-'}</td>
                <td>{v.make}</td>
                <td>{v.brand_series || '-'}</td>
                <td>{v.model}</td>
                <td>{v.registration_number}</td>
                <td>{v.insurance_expiry || '-'}</td>
                <td>{v.road_tax_expiry || '-'}</td>
                <td>{v.status}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button onClick={() => startEdit(v)}>Edit</button>{' '}
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
