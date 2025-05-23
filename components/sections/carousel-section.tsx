"use client"

import { useState, useEffect } from "react"
import IndicatorsCarousel from "@/components/indicators-carousel"
import { Loader2 } from "lucide-react"

interface CarouselSectionProps {
  title: string
}

export default function CarouselSection({ title }: CarouselSectionProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simular tiempo de carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="bg-background">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Cargando indicadores...</span>
        </div>
      ) : (
        <IndicatorsCarousel />
      )}
    </section>
  )
}
