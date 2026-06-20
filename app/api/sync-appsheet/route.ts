import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const APP_ID = 'd3b75a41-2f08-45be-9325-27af6a1c023e'
const API_URL = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Salidas/Action`

function fixEncoding(str: string): string {
  if (!str) return ''
  try {
    return decodeURIComponent(escape(str))
  } catch {
    return str
  }
}

function extraerUrl(campo: string): string {
  if (!campo) return ''
  try {
    const obj = JSON.parse(campo)
    return obj.Url || obj.url || ''
  } catch {
    return campo.startsWith('http') ? campo : ''
  }
}

function mapearSalida(row: Record<string, string>, index: number) {
  return {
    id: row['Row ID'] || String(index),
    titulo: fixEncoding(row['TÃ­tulo'] || row['Título'] || row['Titulo'] || ''),
    categoria: fixEncoding(row['CategorÃ­a'] || row['Categoría'] || row['Categoria'] || ''),
    destacado: row['Destacado'] === 'Si' || row['Destacado'] === 'Yes' || row['Destacado'] === 'TRUE',
    enPromocion: row['En PromociÃ³n'] === 'Si' || row['En Promoción'] === 'Si',
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
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Action: 'Find', Properties: {}, Rows: [] }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ ok: false, error: `AppSheet error ${res.status}: ${err}` })
    }

    const data = await res.json()
    const rows: Record<string, string>[] = Array.isArray(data) ? data : (data.value || data.rows || [])
    const paquetes = rows.map(mapearSalida).filter(p => p.titulo)

    await redis.set('paquetes_sync', paquetes)
    await redis.set('paquetes_sync_fecha', new Date().toISOString())

    return NextResponse.json({ ok: true, total: paquetes.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
  }
}
