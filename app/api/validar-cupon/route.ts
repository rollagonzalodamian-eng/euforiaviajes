import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { Cupon } from '@/app/api/admin/cupones/route'

export async function POST(req: NextRequest) {
  const { codigo, precioUSD } = await req.json()
  try {
    const cupones = await redis.get<Cupon[]>('cupones') || []
    const cupon = cupones.find((c: Cupon) => c.codigo === codigo.toUpperCase() && c.activo)
    if (!cupon) return NextResponse.json({ ok: false, error: 'Cupón inválido o expirado' })
    if (cupon.usos >= cupon.maxUsos) return NextResponse.json({ ok: false, error: 'Cupón agotado' })

    const descuento = cupon.tipo === 'porcentaje'
      ? parseFloat(precioUSD) * cupon.descuento / 100
      : cupon.descuento

    // Incrementar usos
    const nuevos = cupones.map((c: Cupon) => c.codigo === cupon.codigo ? { ...c, usos: c.usos + 1 } : c)
    await redis.set('cupones', nuevos)

    return NextResponse.json({ ok: true, descuento, tipo: cupon.tipo, valor: cupon.descuento })
  } catch {
    return NextResponse.json({ ok: false, error: 'Error al validar' })
  }
}
