"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface LineChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  color?: string
  title?: string
}

export function CustomLineChart({
  data,
  dataKey,
  xAxisKey,
  color = "#60A5FA", // bleu moderne
  title,
}: LineChartProps) {
  return (
    <div className="w-full h-64 bg-gray-900 rounded-xl p-4 shadow-lg">
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-white text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
            cursor={{ stroke: "#6B7280", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
