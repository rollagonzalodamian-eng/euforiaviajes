import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass && pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({}, { status: 401 })
  }
  try {
    const [fotosBulk, fotosIds] = await Promise.all([
      redis.get<Record<string, string>>('custom_fotos').catch(() => ({})),
      redis.smembers('fotos_custom_ids').catch(() => []),
    ])
    const resultado: Record<string, string> = { ...(fotosBulk || {}) }

    // Cargar fotos base64 individuales
    if (fotosIds && fotosIds.length > 0) {
      const keys = (fotosIds as string[]).map((id: string) => `foto:${id}`)
      const vals = await redis.mget<string[]>(...keys).catch(() => [])
      ;(fotosIds as string[]).forEach((id: string, i: number) => {
        if (vals[i]) resultado[id] = vals[i]
      })
    }

    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({})
  }
}

function normalizarTitulo(titulo: string): string {
  return titulo.toLowerCase().trim().replace(/[^a-z0-9áéíóúñ]/g, '_').slice(0, 80)
}

async function getTituloPaquete(id: string): Promise<string> {
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync')
    return paquetes?.find(p => p.id === id)?.titulo || ''
  } catch { return '' }
}

export async function POST(req: NextRequest) {
  const { pass, id, url } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  if (!id || !url) return NextResponse.json({ ok: false, error: 'Faltan datos' }, { status: 400 })
  try {
    const titulo = await getTituloPaquete(id)
    if (url.startsWith('data:')) {
      await redis.set(`foto:${id}`, url)
      await redis.sadd('fotos_custom_ids', id)
      // También guardar por título como respaldo
      if (titulo) await redis.set(`foto_t:${normalizarTitulo(titulo)}`, url)
    } else {
      const fotos = await redis.get<Record<string, string>>('custom_fotos') || {}
      fotos[id] = url
      await redis.set('custom_fotos', fotos)
      // También guardar por título como respaldo
      if (titulo) {
        const fotosT = await redis.get<Record<string, string>>('custom_fotos_t') || {}
        fotosT[normalizarTitulo(titulo)] = url
        await redis.set('custom_fotos_t', fotosT)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
