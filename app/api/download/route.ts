import { type NextRequest, NextResponse } from "next/server"
import { downloadIndicatorData } from "@/lib/actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const seriesId = searchParams.get("seriesId")
    const description = searchParams.get("description") || "indicador"
    const format = searchParams.get("format") || "csv" // Añadir soporte para formato

    if (!seriesId) {
      return NextResponse.json({ error: "Se requiere el parámetro seriesId" }, { status: 400 })
    }

    const { content, mimeType, extension } = await downloadIndicatorData(seriesId, description, format)

    // Crear un nombre de archivo seguro
    const safeDescription = description.replace(/[^a-z0-9]/gi, "_").toLowerCase()
    const filename = `${safeDescription}_${new Date().toISOString().split("T")[0]}.${extension}`

    return new NextResponse(content, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error en la ruta de descarga:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
