'use client'

import { useEffect, useState } from 'react'
import { getSpareParts, getSparePartCategories, createSparePart, deleteSparePart, setPartCompatibility } from '@/lib/spareParts'
import { getVehicleBrands } from '@/lib/vehicles'
import type { SparePartWithCategory, SparePartCategory, VehicleBrand } from '@/lib/types'

export default function SparePartsPage() {
  const [parts, setParts] = useState<SparePartWithCategory[]>([])
  const [categories, setCategories] = useState<SparePartCategory[]>([])
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [partCode, setPartCode] = useState('')
  const [partName, setPartName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brand, setBrand] = useState('')
  const [compatibleVehicle, setCompatibleVehicle] = useState('')
  const [supplier, setSupplier] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [minimumStock, setMinimumStock] = useState('')
  const [storageLocation, setStorageLocation] = useState('')
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])

  async function loadAll() {
    setLoading(true)
    try {
      const [partsData, categoriesData, brandsData] = await Promise.all([
        getSpareParts(),
        getSparePartCategories(),
        getVehicleBrands(),
      ])
      setParts(partsData)
      setCategories(categoriesData)
      setVehicleBrands(brandsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function toggleBrand(id: string) {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!partCode.trim() || !partName.trim()) {
      setError('Part code and part name are required.')
      return
    }

    setSaving(true)
    try {
      const newPart = await createSparePart({
        part_code: partCode.trim(),
        part_name: partName.trim(),
        category_id: categoryId || undefined,
        brand: brand.trim() || undefined,
        compatible_vehicle: compatibleVehicle.trim() || undefined,
        supplier: supplier.trim() || undefined,
        cost_price: costPrice ? Number(costPrice) : undefined,
        selling_price: sellingPrice ? Number(sellingPrice) : undefined,
        stock_quantity: stockQuantity ? Number(stockQuantity) : undefined,
        minimum_stock: minimumStock ? Number(minimumStock) : undefined,
        storage_location: storageLocation.trim() || undefined,
      })

      if (selectedBrandIds.length > 0) {
        await setPartCompatibility(newPart.id, selectedBrandIds)
      }

      setPartCode('')
      setPartName('')
      setCategoryId('')
      setBrand('')
      setCompatibleVehicle('')
      setSupplier('')
      setCostPrice('')
      setSellingPrice('')
      setStockQuantity('')
      setMinimumStock('')
      setStorageLocation('')
      setSelectedBrandIds([])
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save spare part')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this spare part?')) return
    try {
      await deleteSparePart(id)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete part')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>FleetOpti — Spare Parts</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: 8 }}>
        <h2>Add Spare Part</h2>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Part code: </label>
          <input value={partCode} onChange={(e) => setPartCode(e.target.value)} placeholder="e.g. OIL-FLT-001" />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Part name: </label>
          <input value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="e.g. Oil Filter" />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Category: </label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">-- None --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Brand: </label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Compatible vehicle (free text note): </label>
          <input value={compatibleVehicle} onChange={(e) => setCompatibleVehicle(e.target.value)} placeholder="e.g. Scania R Series" />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Compatible vehicle brands (searchable): </label>
          <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: '0.5rem', maxHeight: 160, overflowY: 'auto' }}>
            {vehicleBrands.length === 0 ? (
              <p style={{ margin: 0, color: '#888' }}>No vehicle brands found.</p>
            ) : (
              vehicleBrands.map((vb) => (
                <label key={vb.id} style={{ display: 'block', fontSize: '0.9rem', marginBottom: 2 }}>
                  <input
                    type="checkbox"
                    checked={selectedBrandIds.includes(vb.id)}
                    onChange={() => toggleBrand(vb.id)}
                  />
                  {' '}{vb.category} — {vb.brand}{vb.series ? ` (${vb.series})` : ''}
                </label>
              ))
            )}
          </div>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Supplier: </label>
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Cost price: </label>
          <input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Selling price: </label>
          <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Stock quantity: </label>
          <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Minimum stock: </label>
          <input type="number" value={minimumStock} onChange={(e) => setMinimumStock(e.target.value)} />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>Storage location: </label>
          <input value={storageLocation} onChange={(e) => setStorageLocation(e.target.value)} placeholder="e.g. Shelf A3" />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add Part'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h2>Spare Parts Inventory</h2>
      {loading ? (
        <p>Loading...</p>
      ) : parts.length === 0 ? (
        <p>No spare parts yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Compatible Brands</th>
              <th>Stock</th>
              <th>Min</th>
              <th>Cost</th>
              <th>Sell</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: p.stock_quantity <= p.minimum_stock ? '#fff3f3' : undefined,
                }}
              >
                <td>{p.part_code}</td>
                <td>{p.part_name}</td>
                <td>{p.spare_part_categories?.category_name || '-'}</td>
                <td>
                  {p.part_compatibility && p.part_compatibility.length > 0
                    ? p.part_compatibility.map((pc) => pc.vehicle_brands.brand + (pc.vehicle_brands.series ? ` (${pc.vehicle_brands.series})` : '')).join(', ')
                    : '-'}
                </td>
                <td>{p.stock_quantity}</td>
                <td>{p.minimum_stock}</td>
                <td>{p.cost_price}</td>
                <td>{p.selling_price}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}