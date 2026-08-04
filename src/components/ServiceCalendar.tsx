'use client'

import { useEffect, useState } from 'react'
import { getUpcomingMaintenance } from '@/lib/reports'

type VehicleRef = {
  fleet_number: string | null
  make: string
  model: string
  registration_number: string
}

type UpcomingItem = {
  next_service_date: string | null
  next_service_odometer: number | null
  vehicle_id: string | null
  vehicles: VehicleRef | VehicleRef[] | null
}

export default function ServiceCalendar() {
  const [items, setItems] = useState<UpcomingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getUpcomingMaintenance()
        setItems((data ?? []) as unknown as UpcomingItem[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service schedule')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = new Date().toISOString().split('T')[0]

  function vehicleLabel(item: UpcomingItem) {
    const v = Array.isArray(item.vehicles) ? item.vehicles[0] : item.vehicles
    if (!v) return 'Unknown vehicle'
    return `${v.fleet_number || v.registration_number} - ${v.make} ${v.model}`
  }

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: '1rem',
        marginTop: '2rem',
      }}
    >
      <h2>Vehicle Service Schedule</h2>

      {loading ? (
        <p>Loading service schedule...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : items.length === 0 ? (
        <p>No upcoming maintenance scheduled.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #333' }}>
              <th>Vehicle</th>
              <th>Next Service Date</th>
              <th>Next Service Odometer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const overdue = item.next_service_date !== null && item.next_service_date <= today
              return (
                <tr
                  key={`${item.vehicle_id}-${i}`}
                  style={{
                    borderBottom: '1px solid #eee',
                    backgroundColor: overdue ? '#fff3f3' : 'transparent',
                  }}
                >
                  <td>{vehicleLabel(item)}</td>
                  <td>{item.next_service_date ?? '-'}</td>
                  <td>{item.next_service_odometer ?? '-'}</td>
                  <td style={{ color: overdue ? '#c00' : '#2a7a2a', fontWeight: 'bold' }}>
                    {overdue ? 'Overdue' : 'Scheduled'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
