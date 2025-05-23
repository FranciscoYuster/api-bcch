"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getIndicatorData } from "@/lib/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getCache, setCache, getIndicatorCacheKey } from "@/lib/cache-utils"

interface IndicatorTableProps {
  indicatorId: string
}

export default function IndicatorTable({ indicatorId }: IndicatorTableProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

        // Sort data by date (newest first)
        result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        setData(result)
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

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full">
        <p>No hay datos disponibles</p>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
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
                <TableCell>{format(new Date(`${item.fecha}`), "dd MMMM yyyy", { locale: es })}</TableCell>
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
        <Pagination>
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
    </div>
  )
}
