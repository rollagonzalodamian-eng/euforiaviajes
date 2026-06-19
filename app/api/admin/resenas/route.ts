import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export type Resena = {
  id: string
  nombre: string
  ciudad: string
  destino: string
  texto: string
  estrellas: number
  foto?: string
  fecha: string
}

export async function GET() {
  try {
    const resenas = await redis.get<Resena[]>('resenas') || []
    return NextResponse.json(resenas)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { pass, accion, resena } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const resenas = await redis.get<Resena[]>('resenas') || []
    if (accion === 'agregar') {
      const nueva = { ...resena, id: Date.now().toString() }
      await redis.set('resenas', [...resenas, nueva])
    } else if (accion === 'eliminar') {
      await redis.set('resenas', resenas.filter((r: Resena) => r.id !== resena.id))
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
