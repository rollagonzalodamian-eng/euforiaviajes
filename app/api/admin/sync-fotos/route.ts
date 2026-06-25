import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

async function extraerFotoDeWooCommerce(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return ''
    const html = await res.text()
    // og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch?.[1]) return ogMatch[1]
    // woocommerce product image
    const wcMatch = html.match(/class=["'][^"']*wp-post-image[^"']*["'][^>]+src=["']([^"']+)["']/i)
      || html.match(/src=["'](https:\/\/viajaconeuforia\.com\/wp-content\/uploads\/[^"']+\.(?:jpg|jpeg|png|webp))["']/i)
    if (wcMatch?.[1]) return wcMatch[1]
    return ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { pass } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const paquetes = await redis.get<any[]>('paquetes_sync') || []
    const sinFoto = paquetes.filter(p => !p.foto && p.linkWeb)

    if (sinFoto.length === 0) return NextResponse.json({ ok: true, actualizados: 0, mensaje: 'Todos tienen foto' })

    const actualizaciones: Record<string, string> = {}

    // Procesar en lotes de 10 para no exceder timeout de Vercel
    for (let i = 0; i < sinFoto.length; i += 10) {
      const lote = sinFoto.slice(i, i + 10)
      await Promise.all(lote.map(async (p) => {
        const foto = await extraerFotoDeWooCommerce(p.linkWeb)
        if (foto) actualizaciones[p.id] = foto
      }))
    }

    const paquetesActualizados = paquetes.map(p =>
      actualizaciones[p.id] ? { ...p, foto: actualizaciones[p.id] } : p
    )
    await redis.set('paquetes_sync', paquetesActualizados)

    return NextResponse.json({ ok: true, actualizados: Object.keys(actualizaciones).length, total: sinFoto.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}

export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync') || []
    const conFoto = paquetes.filter(p => p.foto).length
    const sinFoto = paquetes.filter(p => !p.foto && p.linkWeb).length
    return NextResponse.json({ total: paquetes.length, conFoto, sinFoto })
  } catch {
    return NextResponse.json({ total: 0, conFoto: 0, sinFoto: 0 })
  }
}
