"use client"

interface CachedData<T> {
  data: T
  timestamp: number
  expiry: number
}

// Tiempo de expiración predeterminado: 1 hora en milisegundos
const DEFAULT_EXPIRY = 60 * 60 * 1000

/**
 * Guarda datos en localStorage con un tiempo de expiración
 */
export function setCache<T>(key: string, data: T, expiry: number = DEFAULT_EXPIRY): void {
  try {
    const item: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry,
    }
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error("Error al guardar en caché:", error)
  }
}

/**
 * Recupera datos de localStorage si existen y no han expirado
 */
export function getCache<T>(key: string): T | null {
  try {
    const cachedItem = localStorage.getItem(key)
    if (!cachedItem) return null

    const item: CachedData<T> = JSON.parse(cachedItem)
    const now = Date.now()

    // Verificar si los datos han expirado
    if (now - item.timestamp > item.expiry) {
      localStorage.removeItem(key) // Eliminar datos expirados
      return null
    }

    return item.data
  } catch (error) {
    console.error("Error al recuperar de caché:", error)
    return null
  }
}

/**
 * Elimina un elemento específico de la caché
 */
export function removeCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error al eliminar de caché:", error)
  }
}

/**
 * Limpia toda la caché relacionada con indicadores
 */
export function clearIndicatorsCache(): void {
  try {
    const keysToRemove: string[] = []

    // Buscar todas las claves que comienzan con 'indicator_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("indicator_")) {
        keysToRemove.push(key)
      }
    }

    // Eliminar las claves encontradas
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.error("Error al limpiar caché de indicadores:", error)
  }
}

/**
 * Genera una clave única para el indicador basada en sus parámetros
 */
export function getIndicatorCacheKey(indicatorId: string, startDate: string, endDate: string): string {
  return `indicator_${indicatorId}_${startDate}_${endDate}`
}
