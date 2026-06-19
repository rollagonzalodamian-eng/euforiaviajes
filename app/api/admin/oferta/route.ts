import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const DEFAULT: any = { activo: false, titulo: '', descripcion: '', linkId: '', fechaFin: '' }

export async function GET() {
  try {
    const oferta = await redis.get('oferta') || DEFAULT
    return NextResponse.json(oferta)
  } catch {
    return NextResponse.json(DEFAULT)
  }
}

export async function POST(req: NextRequest) {
  const { pass, ...data } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    await redis.set('oferta', data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
