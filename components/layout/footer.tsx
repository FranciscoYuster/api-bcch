import Link from "next/link"
import { Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold">Indicadores BCCh</h3>
            <p className="text-sm text-muted-foreground">
              Visualización de indicadores económicos del Banco Central de Chile
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Enlaces</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Inicio
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                Acerca de
              </Link>
              <Link
                href="https://www.bcentral.cl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Banco Central de Chile
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Desarrollado por</h3>
            <p className="text-sm text-muted-foreground">Francisco Yuste</p>
            <div className="flex space-x-4">
              <Link
                href="https://www.linkedin.com/in/francisco-yuste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/franciscoyuste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
