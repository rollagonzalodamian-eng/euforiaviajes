import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const APP_ID = 'd3b75a41-2f08-45be-9325-27af6a1c023e'
const API_URL = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Salidas/Action`

function fixEncoding(str: string): string {
  if (!str) return ''
  try { return decodeURIComponent(escape(str)) } catch { return str }
}

function extraerUrl(campo: string): string {
  if (!campo) return ''
  try { const obj = JSON.parse(campo); return obj.Url || obj.url || '' } catch {
    return campo.startsWith('http') ? campo : ''
  }
}

function mapearSalida(row: Record<string, string>, index: number) {
  return {
    id: row['Row ID'] || String(index),
    titulo: fixEncoding(row['TÃ­tulo'] || row['Título'] || ''),
    categoria: fixEncoding(row['CategorÃ­a'] || row['Categoría'] || ''),
    destacado: row['Destacado'] === 'Si',
    enPromocion: row['En PromociÃ³n'] === 'Si' || row['En Promoción'] === 'Si',
    destino: fixEncoding(row['Destino'] || ''),
    descripcion: fixEncoding(row['DescripciÃ³n'] || row['Descripción'] || ''),
    pais: fixEncoding(row['PaÃ­s'] || row['País'] || 'Argentina'),
    origen: fixEncoding(row['Origen'] || ''),
    transporte: fixEncoding(row['Transporte'] || ''),
    servicio: fixEncoding(row['Servicio'] || ''),
    noches: row['Noches'] || '',
    precioUSD: row['Precio Lista USD'] || '',
    promoUSD: row['Promo Efectivo USD'] || '',
    precioARS: row['Precio Lista ARS'] || '',
    promoARS: row['Promo Efectivo ARS'] || '',
    linkWeb: extraerUrl(row['Enlace WooCoommerce'] || ''),
    itinerario: extraerUrl(row['Itinerario'] || ''),
    fecha: row['Fecha'] || '',
    vendedor: row['Vendedor'] || '',
    disponible: row['Estado'] || 'Disponible',
    foto: extraerUrl(row['URL Imagenes'] || row['ImÃ¡genes y Videos'] || ''),
    urlImagenes: extraerUrl(row['URL Imagenes'] || ''),
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const apiKey = process.env.APPSHEET_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false })
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'ApplicationAccessKey': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Action: 'Find', Properties: {}, Rows: [] }),
    })
    if (!res.ok) return NextResponse.json({ ok: false, error: res.status })
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
