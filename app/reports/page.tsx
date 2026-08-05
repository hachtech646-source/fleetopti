'use client'

import { useState } from 'react'
import {
  exportMonthlyReport,
  exportTotalVehicles,
  exportActiveVehicles,
  exportAllStock,
  exportAllMaintenance,
  exportAllFuel,
} from '@/lib/exportReport'

type ReportCard = {
  title: string
  description: string
  action: () => Promise<void>
}

export default function ReportsPage() {
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1)
  const [reportYear, setReportYear] = useState(new Date().getFullYear())
  const [runningKey, setRunningKey] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function run(key: string, fn: () => Promise<void>) {
    setRunningKey(key)
    setMessage('')
    try {
      await fn()
      setMessage(`${key} report downloaded.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setRunningKey(null)
    }
  }

  const cards: ReportCard[] = [
    {
      title: 'All Vehicles',
      description: 'Full list of every vehicle in the fleet.',
      action: exportTotalVehicles,
    },
    {
      title: 'Active Vehicles',
      description: 'Only vehicles currently marked Active.',
      action: exportActiveVehicles,
    },
    {
      title: 'Stock / Parts Inventory',
      description: 'Current spare parts stock levels and value.',
      action: exportAllStock,
    },
    {
      title: 'Maintenance Records',
      description: 'Full maintenance history across the fleet.',
      action: exportAllMaintenance,
    },
    {
      title: 'Fuel Records',
      description: 'Full fuel purchase history across the fleet.',
      action: exportAllFuel,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Reports</h1>
      <p className="text-gray-500 mb-6">Download Excel reports for any part of your fleet.</p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Monthly Summary Report</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">Month</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            value={reportMonth}
            onChange={(e) => setReportMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <label className="text-sm text-gray-600">Year</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-24"
            value={reportYear}
            onChange={(e) => setReportYear(Number(e.target.value))}
          />
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-md disabled:opacity-50"
            disabled={runningKey === 'Monthly Summary'}
            onClick={() => run('Monthly Summary', () => exportMonthlyReport(reportYear, reportMonth))}
          >
            {runningKey === 'Monthly Summary' ? 'Generating...' : 'Download Monthly Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-1 flex-1">{card.description}</p>
            <button
              className="mt-4 self-start border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded-md disabled:opacity-50"
              disabled={runningKey === card.title}
              onClick={() => run(card.title, card.action)}
            >
              {runningKey === card.title ? 'Generating...' : 'Download'}
            </button>
          </div>
        ))}
      </div>

      {message && <p className="mt-6 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
