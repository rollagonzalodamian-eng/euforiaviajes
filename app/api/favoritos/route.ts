import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redis } from '@/lib/redis'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ favoritos: [] })
  const perfil = await redis.get<any>(`perfil:${session.user.email}`)
  return NextResponse.json({ favoritos: perfil?.favoritos || [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { paqueteId } = await req.json()
  const perfil = await redis.get<any>(`perfil:${session.user.email}`) || {}
  const favoritos: string[] = perfil.favoritos || []
  const idx = favoritos.indexOf(paqueteId)
  const updated = idx >= 0 ? favoritos.filter(id => id !== paqueteId) : [...favoritos, paqueteId]
  await redis.set(`perfil:${session.user.email}`, { ...perfil, favoritos: updated })
  return NextResponse.json({ favoritos: updated, agregado: idx < 0 })
}
