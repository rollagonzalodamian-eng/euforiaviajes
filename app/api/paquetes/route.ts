import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import paquetesData from '@/data/paquetes.json'

export async function GET() {
  try {
    const sync = await redis.get<any[]>('paquetes_sync')
    if (sync && sync.length > 0) return NextResponse.json(sync)
  } catch {}
  return NextResponse.json(paquetesData)
}
