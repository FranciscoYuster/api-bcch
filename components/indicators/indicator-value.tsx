import { TrendingDown, TrendingUp } from "lucide-react"

interface IndicatorValueProps {
  value: number
  change?: number
  showChange?: boolean
  size?: "sm" | "md" | "lg"
}

export default function IndicatorValue({ value, change, showChange = true, size = "md" }: IndicatorValueProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div className="flex items-baseline gap-3">
      <span className={`font-bold ${sizeClasses[size]}`}>
        {new Intl.NumberFormat("es-CL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)}
      </span>

      {showChange && change !== undefined && change !== 0 && (
        <div className={`flex items-center text-sm ${change > 0 ? "text-green-600" : "text-red-600"}`}>
          {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          <span>
            {change > 0 ? "+" : ""}
            {change.toFixed(2)}% vs. año anterior
          </span>
        </div>
      )}
    </div>
  )
}
