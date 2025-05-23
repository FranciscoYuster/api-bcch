"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { Line } from "react-chartjs-2"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getCache, setCache, getIndicatorCacheKey } from "@/lib/cache-utils"

interface IndicatorChartProps {
  indicatorId: string
}

export default function IndicatorChart({ indicatorId }: IndicatorChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)

        const formattedStartDate = format(startDate, "yyyy-MM-dd")
        const formattedEndDate = format(new Date(), "yyyy-MM-dd")

        // Generar clave para caché
        const cacheKey = getIndicatorCacheKey(indicatorId, formattedStartDate, formattedEndDate)

        // Intentar obtener datos de la caché
        const cachedData = getCache<any[]>(cacheKey)

        let data
        if (cachedData) {
          console.log(`Usando datos en caché para ${indicatorId}`)
          data = cachedData
        } else {
          // Si no hay datos en caché, obtenerlos de la API
          console.log(`Obteniendo datos frescos para ${indicatorId}`)
          data = await getIndicatorData(indicatorId, formattedStartDate, formattedEndDate)

          // Guardar en caché si hay datos
          if (data && data.length > 0) {
            setCache(cacheKey, data)
          }
        }

        if (!data || data.length === 0) {
          throw new Error("No se encontraron datos para este indicador")
        }

        // Sort data by date
        data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

        // Ajustar para zona horaria de Chile
        const formattedDates = data.map((item) => {
          // Crear fecha con hora específica para evitar problemas de zona horaria
          const date = new Date(item.fecha)
          return format(date, "MMM yyyy", { locale: es })
        })

        setChartData({
          labels: formattedDates,
          datasets: [
            {
              label: "Valor",
              data: data.map((item) => item.valor),
              borderColor: "rgb(99, 102, 241)",
              backgroundColor: "rgba(99, 102, 241, 0.5)",
              tension: 0.2,
            },
          ],
        })
      } catch (err) {
        console.error("Error fetching indicator data:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [indicatorId])

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full">
        <p>No hay datos disponibles</p>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
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
    <div className="h-[350px] w-full p-4">
      <Line data={chartData} options={options} />
    </div>
  )
}
