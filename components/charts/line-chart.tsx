"use client"

import { Line } from "react-chartjs-2"

interface LineChartProps {
  data: any
  height?: number
  showLegend?: boolean
}

export default function LineChart({ data, height = 300, showLegend = false }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("es-CL", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
      },
      y: {
        type: "linear" as const,
        ticks: {
          callback: (value: any) =>
            new Intl.NumberFormat("es-CL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value),
        },
      },
    },
  }

  return (
    <div className={`w-full`} style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  )
}
