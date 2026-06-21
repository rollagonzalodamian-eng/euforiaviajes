import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redis } from '@/lib/redis'

export type PerfilUsuario = {
  nombre: string
  telefono: string
  rol: 'visitante' | 'pasajero'
  viajes: string[]
  creadoEn: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const perfil = await redis.get<PerfilUsuario>(`perfil:${session.user.email}`)
  return NextResponse.json(perfil || null)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const data = await req.json()
  const existing = await redis.get<PerfilUsuario>(`perfil:${session.user.email}`) || {
    nombre: '', telefono: '', rol: 'visitante', viajes: [], creadoEn: new Date().toISOString()
  }
  const updated = { ...existing, ...data, rol: existing.rol }
  await redis.set(`perfil:${session.user.email}`, updated)
  return NextResponse.json({ ok: true })
}
