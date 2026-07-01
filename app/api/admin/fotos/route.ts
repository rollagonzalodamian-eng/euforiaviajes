import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

function normalizarTitulo(titulo: string): string {
  return titulo.toLowerCase().trim().replace(/[^a-z0-9áéíóúñ]/g, '_').slice(0, 80)
}

async function getTituloPaquete(id: string): Promise<string> {
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync')
    return paquetes?.find(p => p.id === id)?.titulo || ''
  } catch { return '' }
}

// Migra custom_fotos (objeto bulk) a claves individuales foto_url:{id}
async function migrarCustomFotos() {
  try {
    const bulk = await redis.get<Record<string, string>>('custom_fotos')
    if (!bulk || Object.keys(bulk).length === 0) return
    const ids = await redis.smembers('foto_url_ids').catch(() => [] as string[])
    const migrados: string[] = []
    for (const [id, url] of Object.entries(bulk)) {
      if (ids.includes(id)) continue // ya migrado
      await redis.set(`foto_url:${id}`, url)
      await redis.sadd('foto_url_ids', id)
      migrados.push(id)
    }
    // Migrar también custom_fotos_t
    const bulkT = await redis.get<Record<string, string>>('custom_fotos_t')
    if (bulkT) {
      for (const [tKey, url] of Object.entries(bulkT)) {
        await redis.set(`foto_url_t:${tKey}`, url)
      }
    }
    if (migrados.length > 0) {
      console.log(`[fotos] Migradas ${migrados.length} fotos de custom_fotos a claves individuales`)
    }
  } catch (e) {
    console.error('[fotos] Error en migración:', e)
  }
}

export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass && pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({}, { status: 401 })
  }
  try {
    // Migrar automáticamente si hay datos en el formato viejo
    await migrarCustomFotos()

    const [urlIds, base64Ids] = await Promise.all([
      redis.smembers('foto_url_ids').catch(() => [] as string[]),
      redis.smembers('fotos_custom_ids').catch(() => [] as string[]),
    ])

    const resultado: Record<string, string> = {}

    // Cargar fotos URL individuales
    if (urlIds.length > 0) {
      const keys = (urlIds as string[]).map(id => `foto_url:${id}`)
      const vals = await redis.mget<string[]>(...keys).catch(() => [])
      ;(urlIds as string[]).forEach((id, i) => {
        if (vals[i]) resultado[id] = vals[i]
      })
    }

    // Cargar fotos base64 individuales (mayor prioridad)
    if (base64Ids.length > 0) {
      const keys = (base64Ids as string[]).map(id => `foto:${id}`)
      const vals = await redis.mget<string[]>(...keys).catch(() => [])
      ;(base64Ids as string[]).forEach((id, i) => {
        if (vals[i]) resultado[id] = vals[i]
      })
    }

    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const { pass, id, url } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  if (!id || !url) return NextResponse.json({ ok: false, error: 'Faltan datos' }, { status: 400 })
  try {
    const titulo = await getTituloPaquete(id)
    if (url.startsWith('data:')) {
      // Base64: clave individual
      await redis.set(`foto:${id}`, url)
      await redis.sadd('fotos_custom_ids', id)
      if (titulo) await redis.set(`foto_t:${normalizarTitulo(titulo)}`, url)
    } else {
      // URL: clave individual (ya no usa el objeto bulk custom_fotos)
      await redis.set(`foto_url:${id}`, url)
      await redis.sadd('foto_url_ids', id)
      if (titulo) await redis.set(`foto_url_t:${normalizarTitulo(titulo)}`, url)
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
