'use client'

import { useEffect, useState } from 'react'
import { getFuelRecords } from '@/lib/fuel'
import type { FuelRecordWithVehicle } from '@/lib/types'

type VehicleTotal = {
  label: string
  liters: number
  cost: number
}

export default function FuelAnalytics() {
  const [records, setRecords] = useState<FuelRecordWithVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getFuelRecords()
        setRecords(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fuel data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalLiters = records.reduce((sum, r) => sum + Number(r.liters), 0)
  const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0)

  const totalsByVehicle = new Map<string, VehicleTotal>()
  for (const r of records) {
    const label = r.vehicles
      ? (r.vehicles.fleet_number || r.vehicles.registration_number) + ' - ' + r.vehicles.make + ' ' + r.vehicles.model
      : 'Unknown vehicle'
    const existing = totalsByVehicle.get(label) || { label, liters: 0, cost: 0 }
    existing.liters += Number(r.liters)
    existing.cost += Number(r.cost)
    totalsByVehicle.set(label, existing)
  }

  const vehicleTotals = Array.from(totalsByVehicle.values()).sort((a, b) => b.cost - a.cost)
  const maxCost = vehicleTotals.length > 0 ? Math.max(...vehicleTotals.map((v) => v.cost)) : 0

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: '1rem',
        marginTop: '2rem',
      }}
    >
      <h2>Fuel Analytics</h2>

      {loading ? (
        <p>Loading fuel analytics...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : records.length === 0 ? (
        <p>No fuel records found.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalLiters.toFixed(1)} L</div>
              <div style={{ color: '#666' }}>Total Liters</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCost.toFixed(2)}</div>
              <div style={{ color: '#666' }}>Total Fuel Cost</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{records.length}</div>
              <div style={{ color: '#666' }}>Fuel Records</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Cost by Vehicle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {vehicleTotals.map((v) => (
              <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 220, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.label}
                </div>
                <div style={{ flex: 1, backgroundColor: '#eee', borderRadius: 4, height: 18, position: 'relative' }}>
                  <div
                    style={{
                      width: maxCost > 0 ? (v.cost / maxCost) * 100 + '%' : '0%',
                      backgroundColor: '#3b82f6',
                      height: '100%',
                      borderRadius: 4,
                    }}
                  />
                </div>
                <div style={{ width: 90, fontSize: '0.85rem', textAlign: 'right' }}>
                  {v.cost.toFixed(2)} / {v.liters.toFixed(1)}L
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
