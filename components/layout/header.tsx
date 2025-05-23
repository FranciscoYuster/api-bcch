"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Navigation from "./navigation"

export default function Header() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    // Actualizar la fecha/hora cada minuto
    const interval = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Indicadores Banco Central de Chile</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
              <span>Última actualización: {format(currentDateTime, "dd MMMM yyyy, HH:mm", { locale: es })}</span>
            </div>
            <ModeToggle />
          </div>
        </div>
        <Navigation />
        <div className="md:hidden flex items-center justify-end text-xs text-muted-foreground mt-1">
          <span>Actualizado: {format(currentDateTime, "dd/MM/yyyy, HH:mm", { locale: es })}</span>
        </div>
      </div>
    </header>
  )
}
