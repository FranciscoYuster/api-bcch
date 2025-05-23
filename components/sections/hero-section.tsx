import type React from "react"
interface HeroSectionProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function HeroSection({ title, description, children }: HeroSectionProps) {
  return (
    <section className="py-8">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}
