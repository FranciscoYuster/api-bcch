import IndicatorsCarousel from "@/components/indicators-carousel"

interface CarouselSectionProps {
  title: string
}

export default function CarouselSection({ title }: CarouselSectionProps) {
  return (
    <section className="w-screen px-6 py-4">
      
      <h2 className="text-2xl font-semibold mb-4 px-5">{title}</h2>
      <IndicatorsCarousel />
    </section>
  )
}
