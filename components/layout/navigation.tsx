"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Info } from "lucide-react"

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

export default function Navigation() {
  const pathname = usePathname()

  return (
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
  )
}
