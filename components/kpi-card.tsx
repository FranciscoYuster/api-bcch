"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Line } from "react-chartjs-2"
import { getCache, setCache, getIndicatorCacheKey } from "@/lib/cache-utils"

interface KpiCardProps {
  indicatorId: string
  title: string
  timeframe?: "day" | "month" | "year"
}

export default function KpiCard({ indicatorId, title, timeframe = "day" }: KpiCardProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Determinar el rango de fechas según el timeframe
        const endDate = new Date()
        const startDate = new Date()

        switch (timeframe) {
          case "day":
            startDate.setDate(startDate.getDate() - 30) // Últimos 30 días para tener suficientes datos
            break
          case "month":
            startDate.setMonth(startDate.getMonth() - 6) // Últimos 6 meses
            break
          case "year":
            startDate.setFullYear(startDate.getFullYear() - 2) // Últimos 2 años
            break
        }

        const formattedStartDate = format(startDate, "yyyy-MM-dd")
        const formattedEndDate = format(endDate, "yyyy-MM-dd")

        // Generar clave para caché
        const cacheKey = getIndicatorCacheKey(indicatorId, formattedStartDate, formattedEndDate)

        // Intentar obtener datos de la caché
        const cachedData = getCache<any[]>(cacheKey)

        let result
        if (cachedData) {
          console.log(`Usando datos en caché para ${indicatorId}`)
          result = cachedData
        } else {
          // Si no hay datos en caché, obtenerlos de la API
          console.log(`Obteniendo datos frescos para ${indicatorId}`)
          result = await getIndicatorData(indicatorId, formattedStartDate, formattedEndDate)

          // Guardar en caché si hay datos
          if (result && result.length > 0) {
            setCache(cacheKey, result)
          }
        }

        if (!result || result.length === 0) {
          throw new Error("No se encontraron datos recientes")
        }

        // Sort by date (newest first for calculations, oldest first for chart)
        const sortedForCalc = [...result].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        const sortedForChart = [...result].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

        // Get latest value
        const latestValue = sortedForCalc[0]

        // Determine previous value based on timeframe
        let previousValue

        if (timeframe === "day" && sortedForCalc.length > 1) {
          previousValue = sortedForCalc[1]
        } else if (timeframe === "month" && sortedForCalc.length > 20) {
          // ~20 business days in a month
          previousValue = sortedForCalc[20]
        } else if (timeframe === "year" && sortedForCalc.length > 240) {
          // ~240 business days in a year
          previousValue = sortedForCalc[240]
        } else {
          previousValue = sortedForCalc.length > 1 ? sortedForCalc[1] : null
        }

        const change = previousValue ? ((latestValue.valor - previousValue.valor) / previousValue.valor) * 100 : 0

        // Prepare sparkline data (last 20 points)
        const sparklineData = {
          labels: sortedForChart.slice(-20).map(() => ""),
          datasets: [
            {
              data: sortedForChart.slice(-20).map((item) => item.valor),
              borderColor: change >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
              backgroundColor: change >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 1.5,
              fill: true,
            },
          ],
        }

        setData({
          value: latestValue.valor,
          date: latestValue.fecha,
          change: change,
          sparklineData,
          timeframe,
        })
      } catch (err) {
        console.error("Error fetching indicator data:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [indicatorId, timeframe])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  }

  const getTimeframeText = () => {
    switch (timeframe) {
      case "day":
        return "día anterior"
      case "month":
        return "mes anterior"
      case "year":
        return "año anterior"
      default:
        return "período anterior"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">Error: {error}</p>
        ) : data ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">
                {new Intl.NumberFormat("es-CL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(data.value)}
              </span>

              {data.change !== 0 && (
                <div className={`flex items-center text-sm ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.change > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {data.change > 0 ? "+" : ""}
                    {data.change.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground flex justify-between">
              <span>vs. {getTimeframeText()}</span>
              <span>{format(new Date(data.date), "dd MMM yyyy", { locale: es })}</span>
            </p>

            <div className="h-16 mt-2">
              <Line data={data.sparklineData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <p className="text-sm">No hay datos disponibles</p>
        )}
      </CardContent>
    </Card>
  )
}
