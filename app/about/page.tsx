import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import HeroSection from "@/components/sections/hero-section"
import { Github, Linkedin } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto py-8">
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
          <HeroSection title="Acerca de" description="Información sobre esta aplicación y el Banco Central de Chile" />

   {/*        <Card>
            <CardHeader>
              <CardTitle>Desarrollador</CardTitle>
              <CardDescription>Información sobre el creador de esta aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Esta aplicación fue desarrollada por <strong>Francisco Yuste</strong>, especialista en desarrollo web y
                visualización de datos.
              </p>

              <div className="flex space-x-4 mt-2">
                <Link
                  href="https://www.linkedin.com/in/francisco-yuste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com/franciscoyuste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </Link>
              </div>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Sobre la Aplicación</CardTitle>
              <CardDescription>Detalles técnicos y funcionalidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Esta aplicación web proporciona acceso a indicadores económicos del Banco Central de Chile a través de
                su API oficial. Permite visualizar y analizar datos históricos de diversos indicadores económicos como
                el PIB, UF, dólar, euro, entre otros.
              </p>

        
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Banco Central de Chile</CardTitle>
              <CardDescription>Información sobre la fuente de datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <p>
                La API del Banco Central de Chile proporciona acceso a series de tiempo de indicadores económicos y
                financieros. Para utilizar esta API, es necesario registrarse en el sitio web del Banco Central y
                obtener credenciales de acceso.
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">Enlaces útiles:</h3>
                <ul className="list-disc pl-6 space-y-1">
                 
                  <li>
                    <Link
                      href="https://si3.bcentral.cl/estadisticas/Principal1/Web_Services/index.htm"
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Documentación de la API
                    </Link>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Requisitos para ejecutar la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Para utilizar esta aplicación, es necesario configurar las siguientes variables de entorno:</p>

              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <p>BCCH_USER=tu_usuario</p>
                <p>BCCH_PASS=tu_contraseña</p>
              </div>

              <p>
                Estas credenciales se pueden obtener registrándose en el sitio web del Banco Central de Chile y
                solicitando acceso a la API.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
