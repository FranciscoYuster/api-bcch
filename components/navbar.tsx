"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart3, Home, Info } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Inicio",
      href: "/",
      icon: <Home className="h-4 w-4 mr-2" />,
    },
    {
      name: "Panel",
      href: "/dashboard",
      icon: <BarChart3 className="h-4 w-4 mr-2" />,
    },
    {
      name: "Acerca de",
      href: "/about",
      icon: <Info className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">Indicadores BCCH</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-2 lg:space-x-6 mx-6">
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
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
