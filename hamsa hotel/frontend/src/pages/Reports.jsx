import { useEffect, useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])

  useEffect(() => {
    axios.get('/api/reports/summary').then(({ data }) => setSummary(data))
    axios.get('/api/reports/trends/revenue').then(({ data }) => setTrends(data))
  }, [])

  const exportExcel = () => window.open('/api/reports/summary/export/excel', '_blank')
  const exportPDF = () => window.open('/api/reports/summary/export/pdf', '_blank')

  if (!summary) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reports</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel}>Export Excel</button>
          <button onClick={exportPDF} className="bg-gray-700 hover:bg-gray-800">Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded bg-white">Total Rooms: {summary.totalRooms}</div>
        <div className="p-4 border rounded bg-white">Occupancy: {summary.occupancy}%</div>
        <div className="p-4 border rounded bg-white">Today Revenue: ₹{summary.todaysRevenue}</div>
        <div className="p-4 border rounded bg-white">Today Profit: ₹{summary.todaysProfit}</div>
      </div>

      <div className="h-72 p-4 border rounded bg-white">
        <div className="mb-2 font-medium">Revenue Trend (14 days)</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

