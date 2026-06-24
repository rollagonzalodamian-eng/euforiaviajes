import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass && pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({}, { status: 401 })
  }
  try {
    const fotos = await redis.get<Record<string, string>>('custom_fotos') || {}
    return NextResponse.json(fotos)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const { pass, id, url } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  if (!id || !url) return NextResponse.json({ ok: false, error: 'Faltan datos' }, { status: 400 })
  try {
    if (url.startsWith('data:')) {
      // Base64: guardar como clave individual para no inflar el objeto bulk
      await redis.set(`foto:${id}`, url)
      // Registrar el ID en el índice para que /api/paquetes lo encuentre
      await redis.sadd('fotos_custom_ids', id)
    } else {
      // URL normal: guardar en el objeto bulk (pequeño)
      const fotos = await redis.get<Record<string, string>>('custom_fotos') || {}
      fotos[id] = url
      await redis.set('custom_fotos', fotos)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
