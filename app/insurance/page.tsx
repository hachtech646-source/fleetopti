'use client'

import { useEffect, useState } from 'react'
import { getVehicles } from '@/lib/vehicles'
import type { Vehicle } from '@/lib/types'

type ExpiryRow = {
  vehicle: Vehicle
  type: 'Insurance' | 'Road Tax'
  expiry: string
  daysLeft: number
}

export default function InsurancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getVehicles()
        setVehicles(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function daysUntil(dateStr: string) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  function vehicleLabel(v: Vehicle) {
    return `${v.fleet_number || v.registration_number} - ${v.make} ${v.model}`
  }

  const rows: ExpiryRow[] = []
  for (const v of vehicles) {
    if (v.insurance_expiry) {
      rows.push({ vehicle: v, type: 'Insurance', expiry: v.insurance_expiry, daysLeft: daysUntil(v.insurance_expiry) })
    }
    if (v.road_tax_expiry) {
      rows.push({ vehicle: v, type: 'Road Tax', expiry: v.road_tax_expiry, daysLeft: daysUntil(v.road_tax_expiry) })
    }
  }
  rows.sort((a, b) => a.daysLeft - b.daysLeft)

  function statusFor(daysLeft: number) {
    if (daysLeft < 0) return { text: 'Expired', color: '#dc2626', bg: '#fef2f2' }
    if (daysLeft <= 30) return { text: 'Expiring Soon', color: '#d97706', bg: '#fffbeb' }
    return { text: 'Valid', color: '#16a34a', bg: 'transparent' }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Insurance &amp; Road Tax</h1>
      <p className="text-gray-500 mb-6">Track insurance and road tax expiry across your fleet.</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No insurance or road tax dates recorded yet. Add them from the Vehicles page.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 bg-gray-50 text-gray-500">
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const status = statusFor(row.daysLeft)
                return (
                  <tr key={i} className="border-b border-gray-100 last:border-0" style={{ backgroundColor: status.bg }}>
                    <td className="px-4 py-3">{vehicleLabel(row.vehicle)}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3">{row.expiry}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: status.color }}>
                      {status.text} {row.daysLeft >= 0 ? `(${row.daysLeft}d)` : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
