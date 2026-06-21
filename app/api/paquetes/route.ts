import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import paquetesData from '@/data/paquetes.json'

const fotosPorId: Record<string, string> = {}
for (const p of paquetesData as any[]) {
  if (p.id && p.foto) fotosPorId[p.id] = p.foto
}

export async function GET() {
  try {
    const sync = await redis.get<any[]>('paquetes_sync')
    if (sync && sync.length > 0) {
      // Si un paquete no tiene foto en AppSheet, usa la del JSON estático
      const merged = sync.map(p => ({
        ...p,
        foto: p.foto || fotosPorId[p.id] || '',
      }))
      return NextResponse.json(merged)
    }
  } catch {}
  return NextResponse.json(paquetesData)
}
