"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface BarChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  color?: string
  title?: string
}

export function CustomBarChart({
  data,
  dataKey,
  xAxisKey,
  color = "#34D399", // vert fluo stylé
  title,
}: BarChartProps) {
  return (
    <div className="w-full h-64 bg-gray-900 rounded-xl p-4 shadow-lg">
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-white text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis
  dataKey={xAxisKey}
  stroke="#9CA3AF"
  tick={{ fill: "#9CA3AF", fontSize: 12 }}
/>
<YAxis
  stroke="#9CA3AF"
  tick={{ fill: "#9CA3AF", fontSize: 12 }}
/>
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F9FAFB",
              fontSize: "14px",
            }}
            cursor={{ fill: "#1F2937" }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
