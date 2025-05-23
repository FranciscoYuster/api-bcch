"use client"

import { useState, useEffect, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { format, subMonths, subYears } from "date-fns"
import { es } from "date-fns/locale"
import { getCache, setCache, getIndicatorCacheKey } from "@/lib/cache-utils"

// Añadir después de las importaciones
import "./carousel.css"

interface CarouselIndicator {
  id: string
  name: string
  description: string
}

export default function IndicatorsCarousel() {
  const [indicators, setIndicators] = useState<CarouselIndicator[]>([
    {
      id: "F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T",
      name: "PIB a precios corrientes",
      description: "Producto Interno Bruto a precios corrientes, medido en millones de pesos chilenos",
    },
    {
      id: "F073.TCM.IND.199502.D",
      name: "Índice Tipo de Cambio Multilateral",
      description: "Índice que mide la variación del peso chileno respecto a una canasta de monedas",
    },
    {
      id: "F073.TCO.PRE.Z.D",
      name: "Dólar Observado",
      description: "Tipo de cambio del peso chileno respecto al dólar estadounidense",
    },
    {
      id: "F072.CLP.EUR.N.O.D",
      name: "Euro",
      description: "Tipo de cambio del peso chileno respecto al euro",
    },
    {
      id: "F073.UFF.PRE.Z.D",
      name: "Unidad de Fomento (UF)",
      description: "Unidad de cuenta reajustable de acuerdo con la inflación",
    },
    {
      id: "F073.IVP.PRE.Z.D",
      name: "Índice de Valor Promedio (IVP)",
      description: "Índice utilizado para reajustar algunas operaciones de crédito",
    },
  ])
  const [indicatorData, setIndicatorData] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const fetchIndicatorData = useCallback(
    async (indicatorId: string) => {
      if (indicatorData[indicatorId] || loading[indicatorId]) return

      setLoading((prev) => ({ ...prev, [indicatorId]: true }))

      try {
        const endDate = new Date()
        const startDate = new Date()
        // Obtener datos de un año atrás para poder hacer comparaciones anuales
        startDate.setFullYear(startDate.getFullYear() - 1)

        const formattedStartDate = format(startDate, "yyyy-MM-dd")
        const formattedEndDate = format(endDate, "yyyy-MM-dd")

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

        if (data && data.length > 0) {
          // Sort data by date
          data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

          // Get latest value
          const latestValue = data[data.length - 1]

          // Determinar si es PIB (comparación anual) u otro indicador (comparación mensual)
          const isPIB = indicatorId.includes("PIB")

          // Fecha para comparación
          const compareDate = isPIB
            ? subYears(new Date(latestValue.fecha), 1)
            : subMonths(new Date(latestValue.fecha), 1)

          // Encontrar el valor más cercano a la fecha de comparación
          let compareValue = null
          let minDiff = Number.POSITIVE_INFINITY

          for (const item of data) {
            const itemDate = new Date(item.fecha)
            const diff = Math.abs(itemDate.getTime() - compareDate.getTime())

            if (diff < minDiff) {
              minDiff = diff
              compareValue = item
            }
          }

          // Calcular el cambio porcentual
          const change = compareValue ? ((latestValue.valor - compareValue.valor) / compareValue.valor) * 100 : 0

          // Determinar el período de comparación
          const comparisonPeriod = isPIB ? "año" : "mes"

          setIndicatorData((prev) => ({
            ...prev,
            [indicatorId]: {
              value: latestValue.valor,
              change,
              date: latestValue.fecha,
              compareDate: compareValue ? compareValue.fecha : null,
              comparisonPeriod,
            },
          }))
        }
      } catch (error) {
        console.error("Error fetching indicator data:", error)
      } finally {
        setLoading((prev) => ({ ...prev, [indicatorId]: false }))
      }
    },
    [indicatorData, loading],
  )

  useEffect(() => {
    // Fetch data for all indicators
    indicators.forEach((indicator) => {
      fetchIndicatorData(indicator.id)
    })
  }, [indicators, fetchIndicatorData])

  return (
    <div className="relative overflow-hidden bg-background w-full rounded-lg">
      <div className="flex animate-scroll">
        {/* Duplicar los indicadores para crear el efecto de loop infinito */}
        {[...indicators, ...indicators].map((indicator, index) => {
          const data = indicatorData[indicator.id]
          const isLoading = loading[indicator.id]

          return (
            <div key={`${indicator.id}-${index}`} className="min-w-[200px] flex-shrink-0 p-3 mx-0.5">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border">
                <div className="flex flex-col space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">{indicator.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{indicator.description}</p>
                  </div>

                  <div className="flex items-baseline justify-between">
                    {isLoading || !data ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat("es-CL", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(data.value)}
                        </span>
                        {data.change !== 0 && (
                          <span className={`text-xs mt-1 ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
                            {data.change > 0 ? "+" : ""}
                            {data.change.toFixed(2)}% vs. {data.comparisonPeriod} ant.
                          </span>
                        )}
                      </div>
                    )}

                    {!isLoading && data && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(data.date), "dd/MM", { locale: es })}
                      </div>
                    )}
                  </div>

                  {!isLoading && data && data.compareDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Comparado con: {format(new Date(data.compareDate), "MMM yyyy", { locale: es })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
