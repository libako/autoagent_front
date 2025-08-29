import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formateo de fechas
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'N/A'
  }
  
  try {
    const dateObj = new Date(date)
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida'
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    console.warn('Error formatting date:', date, error)
    return 'Error de fecha'
  }
}

// Formateo de duración
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || isNaN(ms)) {
    return '0s'
  }
  
  try {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  } catch (error) {
    console.warn('Error formatting duration:', ms, error)
    return '0s'
  }
}

// Formateo de costes
export function formatCost(cost: number | null | undefined): string {
  if (cost == null || isNaN(cost)) {
    return '$0.0000'
  }
  
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
    }).format(cost)
  } catch (error) {
    console.warn('Error formatting cost:', cost, error)
    return '$0.0000'
  }
}

// Sanitizar JSON para renderizado seguro
export function sanitizeJson(json: any): string {
  try {
    return JSON.stringify(json, null, 2)
  } catch {
    return String(json)
  }
}

// Debounce para optimizar re-renders
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generar IDs únicos
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
