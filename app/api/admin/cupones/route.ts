import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export type Cupon = {
  codigo: string
  descuento: number
  tipo: 'porcentaje' | 'fijo'
  activo: boolean
  usos: number
  maxUsos: number
}

export async function GET() {
  try {
    const cupones = await redis.get<Cupon[]>('cupones') || []
    return NextResponse.json(cupones)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { pass, accion, cupon } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const cupones = await redis.get<Cupon[]>('cupones') || []
    if (accion === 'agregar') {
      const nuevo = { ...cupon, usos: 0, codigo: cupon.codigo.toUpperCase() }
      await redis.set('cupones', [...cupones, nuevo])
    } else if (accion === 'eliminar') {
      await redis.set('cupones', cupones.filter((c: Cupon) => c.codigo !== cupon.codigo))
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
