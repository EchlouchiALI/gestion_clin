"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PieChartProps {
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
  title?: string
}

const DEFAULT_COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5A2B"]

export function CustomPieChart({ data, dataKey, nameKey, colors = DEFAULT_COLORS, title }: PieChartProps) {
  return (
    <div className="w-full h-64">
      {title && <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey={dataKey} nameKey={nameKey}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
            }}
          />
          <Legend wrapperStyle={{ color: "#F9FAFB" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
