"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TrendingDown, TrendingUp } from "lucide-react"

interface DashboardSummaryProps {
  indicatorId: string
}

export default function DashboardSummary({ indicatorId }: DashboardSummaryProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get last 7 days of data
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)

        const result = await getIndicatorData(
          indicatorId,
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd"),
        )

        if (!result || result.length === 0) {
          throw new Error("No se encontraron datos recientes")
        }

        // Sort by date (newest first)
        result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

        // Get latest value and calculate change
        const latestValue = result[0]
        const previousValue = result.length > 1 ? result[1] : null

        const change = previousValue ? ((latestValue.valor - previousValue.valor) / previousValue.valor) * 100 : 0

        setData({
          value: latestValue.valor,
          date: latestValue.fecha,
          change: change,
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
    return <Skeleton className="h-12 w-full" />
  }

  if (error) {
    return <p className="text-red-500 text-sm">Error: {error}</p>
  }

  if (!data) {
    return <p className="text-sm">No hay datos disponibles</p>
  }

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold">
          {new Intl.NumberFormat("es-CL", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data.value)}
        </span>

        {data.change !== 0 && (
          <div className={`flex items-center text-sm ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
            {data.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span>
              {data.change > 0 ? "+" : ""}
              {data.change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Actualizado: {format(new Date(`${data.date}`), "dd MMMM yyyy", { locale: es })}
      </p>
    </div>
  )
}
