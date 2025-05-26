"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TrendingDown, TrendingUp, Calendar, TableIcon, Download, FileSpreadsheet } from "lucide-react"
import { Line } from "react-chartjs-2"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getCache, setCache, getIndicatorCacheKey } from "@/lib/cache-utils"
import { Button } from "@/components/ui/button"

interface FullIndicatorCardProps {
  indicatorId: string
  title: string
  description?: string
}

export default function FullIndicatorCard({ indicatorId, title, description }: FullIndicatorCardProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart")

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
          throw new Error("No se encontraron datos para este indicador")
        }

        // Sort data by date (newest first for table, oldest first for chart)
        const sortedData = [...result]
        setData(sortedData)
      } catch (err) {
        console.error("Error fetching indicator data:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    setCurrentPage(1) // Reset to first page when indicator changes
  }, [indicatorId])

  // Prepare chart data
  const prepareChartData = () => {
    if (!data || data.length === 0) return null

    // Sort data by date for chart (oldest first)
    const sortedForChart = [...data].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    // Determinar si los datos son mensuales o de otra frecuencia
    const isPIB = indicatorId.includes("PIB")

    // Para el PIB, mostrar trimestres con el año completo
    if (isPIB) {
      return {
        labels: sortedForChart.map((item) => {
          const date = new Date(item.fecha)
          const quarter = Math.floor(date.getMonth() / 3) + 1
          return `T${quarter} ${date.getFullYear()}`
        }),
        datasets: [
          {
            label: title,
            data: sortedForChart.map((item) => item.valor),
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            tension: 0.2,
          },
        ],
      }
    }

    // Para otros indicadores, mostrar meses y año
    return {
      labels: sortedForChart.map((item) => format(new Date(item.fecha), "MMM yyyy", { locale: es })),
      datasets: [
        {
          label: title,
          data: sortedForChart.map((item) => item.valor),
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.5)",
          tension: 0.2,
        },
      ],
    }
  }

  // Calculate latest value and change
  const getLatestInfo = () => {
    if (!data || data.length === 0) return null

    // Sort by date (newest first)
    const sortedForCalc = [...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    // Get latest value
    const latestValue = sortedForCalc[0]

    // Buscar el valor de hace aproximadamente un año
    const oneYearAgo = new Date(latestValue.fecha)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Encontrar el valor más cercano a hace un año
    let previousValue = null
    let minDiff = Number.POSITIVE_INFINITY

    for (const item of sortedForCalc) {
      const itemDate = new Date(item.fecha)
      const diff = Math.abs(itemDate.getTime() - oneYearAgo.getTime())

      if (diff < minDiff) {
        minDiff = diff
        previousValue = item
      }
    }

    const change = previousValue ? ((latestValue.valor - previousValue.valor) / previousValue.valor) * 100 : 0

    return {
      value: latestValue.valor,
      date: latestValue.fecha,
      change,
      previousDate: previousValue ? previousValue.fecha : null,
    }
  }

  // Función para descargar CSV
  const downloadCSV = async () => {
    try {
      const response = await fetch(
        `/api/download?seriesId=${indicatorId}&description=${encodeURIComponent(title)}&format=csv`,
      )
      if (!response.ok) throw new Error("Error al descargar")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error descargando CSV:", error)
    }
  }

  // Función para descargar Excel
  const downloadExcel = async () => {
    try {
      const response = await fetch(
        `/api/download?seriesId=${indicatorId}&description=${encodeURIComponent(title)}&format=excel`,
      )
      if (!response.ok) throw new Error("Error al descargar")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error descargando Excel:", error)
    }
  }

  const chartData = prepareChartData()
  const latestInfo = getLatestInfo()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any[]) => {
            const index = context[0].dataIndex
            const sortedForChart = [...data].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
            const date = new Date(sortedForChart[index].fecha)

            // Formato diferente para PIB
            if (indicatorId.includes("PIB")) {
              const quarter = Math.floor(date.getMonth() / 3) + 1
              return `Trimestre ${quarter}, ${date.getFullYear()}`
            }

            // Formato normal para otros indicadores
            return format(date, "MMMM yyyy", { locale: es })
          },
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
        griid: {
          display: false,
        },
        ticks: {
          maxRotation: 45, // etiquetas más largas
          autoSkip: true,
          maxTicksLimit: 8,
        }
      },
      y: {
        type: "linear" as const,
        beginAtZero: false,
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

  // Prepare table data
  const prepareTableData = () => {
    if (!data || data.length === 0) return []

    // Sort by date (newest first)
    return [...data].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }

  const tableData = prepareTableData()
  const totalPages = Math.ceil(tableData.length / itemsPerPage)
  const paginatedData = tableData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : latestInfo && chartData ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  {new Intl.NumberFormat("es-CL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(latestInfo.value)}
                </span>

                {latestInfo.change !== 0 && (
                  <div
                    className={`flex items-center text-sm ${latestInfo.change > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {latestInfo.change > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {latestInfo.change > 0 ? "+" : ""}
                      {latestInfo.change.toFixed(2)}% vs. año anterior
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Actualizado: {format(new Date(latestInfo.date), "dd MMMM yyyy", { locale: es })}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadExcel} className="flex items-center gap-1">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
            </div>

            <Tabs
              defaultValue="chart"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "chart" | "table")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Gráfico</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-1">
                  <TableIcon className="h-4 w-4" />
                  <span>Tabla</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="mt-4">
                <div className="h-[300px] w-full">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            title: (context) => {
                              // Mostrar el mes y año completo en el tooltip
                              const index = context[0].dataIndex
                              const sortedForChart = [...data].sort(
                                (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
                              )
                              const date = new Date(sortedForChart[index].fecha)
                              return format(date, "MMMM yyyy", { locale: es })
                            },
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
                          grid: {
                            display: false,
                          },
                          ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 12, // Mostrar más meses
                          },
                        },
                        y: {
                          beginAtZero: false,
                          ticks: {
                            callback: (value: any) =>
                              new Intl.NumberFormat("es-CL", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(value),
                          },
                          grid: ({
                            borderDash: [5, 5],
                          } as any),
                        },
                      },
                      elements: {
                        line: {
                          tension: 0.3,
                          borderWidth: 2,
                        },
                        point: {
                          radius: 0,
                          hitRadius: 10,
                          hoverRadius: 4,
                        },
                      },
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="table" className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(item.fecha), "dd MMMM yyyy", { locale: es })}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("es-CL", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(item.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
            </Tabs>
            {indicatorId.includes("PIB") && (
              <div className="text-xs text-muted-foreground mt-2">
                <p>Nota: El PIB se publica con frecuencia trimestral, no mensual.</p>
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>Comparado con: {format(new Date(latestInfo.previousDate), "MMMM yyyy", { locale: es })}</span>
            </div>
          </div>
        ) : (
          <p>No hay datos disponibles</p>
        )}
      </CardContent>
    </Card>
  )
}
