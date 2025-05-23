import ChartRegistry from "@/components/chart-registry"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import CarouselSection from "@/components/sections/carousel-section"
import IndicatorsSection from "@/components/sections/indicators-section"
import InfoAlert from "@/components/info-alert"

const indicators = [
  {
    id: "F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T",
    name: "PIB a precios corrientes",
    description: "Producto Interno Bruto a precios corrientes, medido en millones de pesos chilenos",
  },
  {
    id: "F073.UFF.PRE.Z.D",
    name: "Unidad de Fomento (UF)",
    description: "Unidad de cuenta reajustable de acuerdo con la inflación",
  },
  {
    id: "F073.IVP.PRE.Z.D",
    name: "Índice de valor promedio (IVP)",
    description: "Índice utilizado para reajustar algunas operaciones de crédito",
  },
  {
    id: "F073.TCO.PRE.Z.D",
    name: "Dolar observado",
    description: "Tipo de cambio del peso chileno respecto al dólar estadounidense",
  },
  {
    id: "F072.CLP.EUR.N.O.D",
    name: "Euro",
    description: "Tipo de cambio del peso chileno respecto al euro",
  },
  {
    id: "F073.TCM.IND.199502.D",
    name: "Indice Tipo de Cambio Multilateral",
    description: "Índice que mide la variación del peso chileno respecto a una canasta de monedas",
  },
]

export default function Home() {
  return (
    <ChartRegistry>
      <Header />
       <InfoAlert
            title="Información"
            description="Se añadirán más indicadores económicos con el pasar del tiempo."
          />
      {/* CarouselSection ocupa todo el ancho */}
      <div className="w-full">
        <CarouselSection title={"Indicadores Destacados"} />
      </div>

      {/* Resto del contenido centrado */}
      <main className="container mx-auto py-6">
        <div className="flex-col space-y-8">
          <IndicatorsSection title="Indicadores Económicos" indicators={indicators} />
        </div>
      </main>
      
      <Footer />
    </ChartRegistry>
  )
}