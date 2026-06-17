import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  try {
    const reservas = await kv.lrange<any>('reservas', 0, -1) || []
    return NextResponse.json(reservas)
  } catch {
    return NextResponse.json([])
  }
}
