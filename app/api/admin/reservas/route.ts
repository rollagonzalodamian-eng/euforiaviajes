import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    const reservas = await redis.lrange<any>('reservas', 0, -1) || []
    return NextResponse.json(reservas)
  } catch {
    return NextResponse.json([])
  }
}
