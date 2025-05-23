"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
}

export function DatePickerWithRange({ className }: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    // Crear fechas con hora específica para evitar problemas de zona horaria
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Establecer mediodía para evitar problemas de zona horaria

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    oneYearAgo.setHours(12, 0, 0, 0)

    return {
      from: oneYearAgo,
      to: today,
    }
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} - {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
            // Añadir configuración para zona horaria de Chile
            fromDate={new Date(2018, 0, 1)} // Fecha mínima desde 2018
            toDate={new Date()} // Fecha máxima hasta hoy
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
