import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import IndicatorValue from "./indicator-value"

interface IndicatorCardProps {
  title: string
  description?: string
  value: number
  change?: number
  date: string
  children?: React.ReactNode
}

export default function IndicatorCard({ title, description, value, change, date, children }: IndicatorCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <IndicatorValue value={value} change={change} size="lg" />
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Actualizado: {format(new Date(date), "dd MMMM yyyy", { locale: es })}</span>
            </div>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
