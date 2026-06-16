import paquetesData from '@/data/paquetes.json'
import type { Paquete } from './types'

export function getPaquetes(): Paquete[] {
  return paquetesData as Paquete[]
}

export function getPaquete(id: string): Paquete | undefined {
  return (paquetesData as Paquete[]).find(p => p.id === id)
}

export function getCategorias(): string[] {
  const cats = new Set((paquetesData as Paquete[]).map(p => p.categoria).filter(Boolean))
  return Array.from(cats).sort()
}

export function getDestinos(): string[] {
  const dests = new Set((paquetesData as Paquete[]).map(p => p.destino).filter(Boolean))
  return Array.from(dests).sort()
}

export function emojiDestino(destino: string, pais: string): string {
  const d = (destino + pais).toLowerCase()
  if (d.includes('peru') || d.includes('machu')) return '🏔️'
  if (d.includes('rio') || d.includes('brasil') || d.includes('buzios') || d.includes('camboriu')) return '🇧🇷'
  if (d.includes('cancun') || d.includes('mexico')) return '🌴'
  if (d.includes('aruba')) return '🏝️'
  if (d.includes('europa') || d.includes('paris') || d.includes('madrid') || d.includes('roma')) return '🗺️'
  if (d.includes('bariloche') || d.includes('patagonia')) return '🏔️'
  if (d.includes('salta') || d.includes('norte') || d.includes('formosa')) return '🌄'
  if (d.includes('mendoza')) return '🍷'
  if (d.includes('cordoba')) return '🏛️'
  if (d.includes('ballenas') || d.includes('avistaje')) return '🐋'
  if (d.includes('maldivas')) return '🏖️'
  return '✈️'
}
