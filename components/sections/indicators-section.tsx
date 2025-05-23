import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import FullIndicatorCard from "@/components/full-indicator-card"

interface Indicator {
  id: string
  name: string
  description: string
}

interface IndicatorsSectionProps {
  title: string
  indicators: Indicator[]
}

export default function IndicatorsSection({ title, indicators }: IndicatorsSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {indicators.map((indicator) => (
          <Suspense key={indicator.id} fallback={<Skeleton className="h-[400px] w-full" />}>
            <FullIndicatorCard indicatorId={indicator.id} title={indicator.name} description={indicator.description} />
          </Suspense>
        ))}
      </div>
    </section>
  )
}
