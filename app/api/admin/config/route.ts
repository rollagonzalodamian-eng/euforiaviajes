import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const DEFAULT_CONFIG = {
  senaPorc: 15,
  whatsapp: '542804321400',
  emailAdmin: 'adm@viajaconeuforia.com',
  tipoCambio: 1500,
  mensajeBienvenida: 'Encontrá los mejores paquetes de viaje con Euforia Viajes',
}

export async function GET() {
  try {
    const config = await redis.get<typeof DEFAULT_CONFIG>('config') || DEFAULT_CONFIG
    return NextResponse.json({ ...DEFAULT_CONFIG, ...config })
  } catch {
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

export async function POST(req: NextRequest) {
  const { pass, ...data } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const config = await redis.get<typeof DEFAULT_CONFIG>('config') || DEFAULT_CONFIG
    await redis.set('config', { ...config, ...data })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
