"use server"

interface IndicatorData {
  fecha: string
  valor: number
}

// Función para obtener datos del indicador, con soporte para caché en localStorage
export async function getIndicatorData(seriesId: string, startDate: string, endDate: string): Promise<IndicatorData[]> {
  try {
    // Verificar que las credenciales estén disponibles
    const user = process.env.BCCH_USER
    const password = process.env.BCCH_PASS

    if (!user || !password) {
      throw new Error("Credenciales no configuradas. Configure BCCH_USER y BCCH_PASS en las variables de entorno.")
    }

    // URL base de la API
    const baseUrl = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx"

    // Parámetros para la consulta
    const params = new URLSearchParams({
      user,
      pass: password,
      function: "GetSeries",
      timeseries: seriesId,
      firstdate: startDate,
      lastdate: endDate,
    })

    // Realizar la consulta a la API
    const response = await fetch(`${baseUrl}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()

    // Verificar si la respuesta contiene un código de error
    if (data.Codigo !== 0) {
      throw new Error(`Error API: ${data.Descripcion || "Error desconocido"}`)
    }

    // Procesar los datos
    if (!data.Series || !data.Series.Obs) {
      return []
    }

    const result: IndicatorData[] = []

    for (const obs of data.Series.Obs) {
      try {
        // Convertir formato de fecha DD-MM-YYYY a YYYY-MM-DD para JavaScript
        const dateParts = obs.indexDateString.split("-")

        // Crear la fecha con la zona horaria de Chile (UTC-4 o UTC-3 dependiendo de horario de verano)
        // Usamos el formato YYYY-MM-DD y añadimos T12:00:00 para asegurar que esté en el día correcto en Chile
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T12:00:00`

        result.push({
          fecha: formattedDate,
          valor: Number.parseFloat(obs.value),
        })
      } catch (error) {
        console.error("Error procesando observación:", error)
        // Continuar con la siguiente observación
      }
    }

    return result
  } catch (error) {
    console.error("Error obteniendo datos del indicador:", error)
    throw error
  }
}

export async function downloadIndicatorData(
  seriesId: string,
  description: string,
  format = "csv",
): Promise<{
  content: Buffer | string
  mimeType: string
  extension: string
}> {
  try {
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5) // 5 años de datos

    const data = await getIndicatorData(
      seriesId,
      startDate.toISOString().split("T")[0],
      new Date().toISOString().split("T")[0],
    )

    if (!data || data.length === 0) {
      throw new Error("No hay datos disponibles para descargar")
    }

    if (format === "excel" || format === "xlsx") {
      // Generar archivo Excel
      const XLSX = await import("xlsx")

      // Preparar los datos para Excel
      const worksheetData = data.map((item) => ({
        Fecha: new Date(item.fecha).toLocaleDateString("es-CL"),
        Valor: item.valor,
      }))

      // Crear workbook y worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      // Añadir el worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, description.substring(0, 31)) // Excel limita nombres a 31 caracteres

      // Generar el buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return {
        content: excelBuffer,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        extension: "xlsx",
      }
    } else {
      // Generar archivo CSV (comportamiento original)
      let csvContent = "Fecha,Valor\n"

      for (const item of data) {
        const formattedDate = new Date(item.fecha).toLocaleDateString("es-CL")
        csvContent += `${formattedDate},${item.valor}\n`
      }

      return {
        content: csvContent,
        mimeType: "text/csv; charset=utf-8",
        extension: "csv",
      }
    }
  } catch (error) {
    console.error("Error descargando datos:", error)
    throw error
  }
}
