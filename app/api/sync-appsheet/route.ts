import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const maxDuration = 60

const APP_ID = 'd3b75a41-2f08-45be-9325-27af6a1c023e'
const API_URL = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Salidas/Action`

function fixEncoding(str: string): string {
  if (!str) return ''
  try {
    return decodeURIComponent(
      str.split('').map(c => {
        const code = c.charCodeAt(0)
        return code > 127 ? '%' + code.toString(16).toUpperCase().padStart(2, '0') : c
      }).join('')
    )
  } catch {
    return str
  }
}

function extraerUrl(campo: any): string {
  if (!campo) return ''
  if (typeof campo === 'object') return campo.Url || campo.url || ''
  if (typeof campo === 'string') {
    if (campo.startsWith('http')) return campo
    try { const obj = JSON.parse(campo); return obj.Url || obj.url || '' } catch {}
  }
  return ''
}

function mapearSalida(row: Record<string, string>, index: number) {
  return {
    id: row['Row ID'] || String(index),
    titulo: fixEncoding(row['TÃ­tulo'] || row['Título'] || row['Titulo'] || ''),
    categoria: fixEncoding(row['CategorÃ­a'] || row['Categoría'] || row['Categoria'] || ''),
    destacado: ['Si', 'Yes', 'TRUE', 'true', '1'].includes(row['Destacado'] || ''),
    enPromocion: ['Si', 'Yes', 'TRUE', 'true', '1'].includes(row['En PromociÃ³n'] || row['En Promoción'] || row['En Promocion'] || ''),
    destino: fixEncoding(row['Destino'] || row['SubcategorÃ­as'] || ''),
    descripcion: fixEncoding(row['DescripciÃ³n'] || row['Descripción'] || row['Descripcion'] || ''),
    pais: fixEncoding(row['PaÃ­s'] || row['País'] || row['Pais'] || 'Argentina'),
    origen: fixEncoding(row['Origen'] || ''),
    transporte: fixEncoding(row['Transporte'] || ''),
    servicio: fixEncoding(row['Servicio'] || ''),
    noches: row['Noches'] || '',
    precioUSD: row['Precio Lista USD'] || '',
    promoUSD: row['Promo Efectivo USD'] || '',
    precioARS: row['Precio Lista ARS'] || '',
    promoARS: row['Promo Efectivo ARS'] || '',
    linkWeb: extraerUrl(row['Enlace WooCoommerce'] || row['Enlace WooCommerce'] || ''),
    itinerario: extraerUrl(row['Itinerario'] || ''),
    fecha: row['Fecha'] || '',
    vendedor: row['Vendedor'] || '',
    disponible: row['Estado'] || 'Disponible',
    urlImagenes: extraerUrl(row['URL Imagenes'] || row['ImÃ¡genes y Videos'] || row['Imágenes y Videos'] || ''),
    foto: extraerUrl(row['URL Imagenes'] || row['ImÃ¡genes y Videos'] || ''),
  }
}

export async function GET() {
  try {
    const fecha = await redis.get<string>('paquetes_sync_fecha')
    const paquetes = await redis.get<any[]>('paquetes_sync')
    return NextResponse.json({ fecha, total: paquetes?.length || 0 })
  } catch {
    return NextResponse.json({ fecha: null, total: 0 })
  }
}

export async function POST(req: NextRequest) {
  const { pass } = await req.json().catch(() => ({ pass: '' }))
  if (pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  const apiKey = process.env.APPSHEET_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'APPSHEET_API_KEY no configurada' })

  try {
    // Traer todas las filas con paginación (AppSheet limita por defecto)
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Action: 'Find', Properties: {}, Rows: [] }),
    })

    const rawText = await res.text()

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `AppSheet error ${res.status}: ${rawText.slice(0, 300)}` })
    }

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ ok: false, error: 'AppSheet devolvió respuesta vacía. Verificá la API Key.' })
    }

    let parsed: any
    try {
      parsed = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ ok: false, error: `AppSheet respuesta inválida: ${rawText.slice(0, 200)}` })
    }

    const allRows: Record<string, string>[] = Array.isArray(parsed) ? parsed : (parsed.value || parsed.rows || [])

    const mapped = allRows.map(mapearSalida).filter(p => p.titulo)
    // Deduplicar: mismo título + misma fecha = mismo paquete
    const vistos = new Set<string>()
    const paquetes = mapped.filter(p => {
      const key = `${p.titulo.toLowerCase().trim()}|${p.fecha}`
      if (vistos.has(key)) return false
      vistos.add(key)
      return true
    })

    await redis.set('paquetes_sync', paquetes)
    await redis.set('paquetes_sync_fecha', new Date().toISOString())

    return NextResponse.json({ ok: true, total: paquetes.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}
