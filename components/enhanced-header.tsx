"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home, Info, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EnhancedHeader() {
  const pathname = usePathname()
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState(false)

  const navItems = [
    {
      name: "Inicio",
      href: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Acerca de",
      href: "/about",
      icon: <Info className="h-4 w-4 mr-2" />,
    },
  ]

  useEffect(() => {
    // Actualizar la fecha/hora cada minuto
    const interval = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsUpdating(true)
    // Simular actualización de datos
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setCurrentDateTime(new Date())
    setIsUpdating(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Indicadores BCCh</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
              <span>Última actualización: {format(currentDateTime, "dd MMMM yyyy, HH:mm", { locale: es })}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-6 w-6"
                onClick={handleRefresh}
                disabled={isUpdating}
              >
                <RefreshCw className={cn("h-4 w-4", isUpdating && "animate-spin")} />
                <span className="sr-only">Actualizar</span>
              </Button>
            </div>
            <ModeToggle />
          </div>
        </div>
        <nav className="flex items-center space-x-2 lg:space-x-6 mt-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-foreground" : "text-muted-foreground",
              )}
              asChild
            >
              <Link href={item.href} className="flex items-center">
                {item.icon}
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="md:hidden flex items-center justify-end text-xs text-muted-foreground mt-1">
          <span>Actualizado: {format(currentDateTime, "dd/MM/yyyy, HH:mm", { locale: es })}</span>
          <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={handleRefresh} disabled={isUpdating}>
            <RefreshCw className={cn("h-3 w-3", isUpdating && "animate-spin")} />
          </Button>
        </div>
      </div>
    </header>
  )
}
