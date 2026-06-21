import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { PerfilUsuario } from '@/app/api/auth/perfil/route'

export async function GET(req: NextRequest) {
  const pass = req.nextUrl.searchParams.get('pass')
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const keys = await redis.keys('perfil:*')
  if (!keys.length) return NextResponse.json([])
  const perfiles = await Promise.all(
    keys.map(async k => {
      const p = await redis.get<PerfilUsuario>(k)
      return { email: k.replace('perfil:', ''), ...p }
    })
  )
  return NextResponse.json(perfiles)
}

export async function POST(req: NextRequest) {
  const { pass, email, rol, viajes } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const existing = await redis.get<PerfilUsuario>(`perfil:${email}`)
  if (!existing) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  const updated = { ...existing, ...(rol && { rol }), ...(viajes && { viajes }) }
  await redis.set(`perfil:${email}`, updated)
  return NextResponse.json({ ok: true })
}
