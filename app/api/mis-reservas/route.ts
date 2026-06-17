import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
  if (!email) return NextResponse.json([])
  try {
    const todas = await redis.lrange<any>('reservas', 0, -1) || []
    const mias = todas.filter((r: any) => r.email?.toLowerCase().trim() === email)
    return NextResponse.json(mias)
  } catch {
    return NextResponse.json([])
  }
}
