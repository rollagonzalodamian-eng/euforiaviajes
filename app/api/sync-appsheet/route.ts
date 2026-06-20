import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const APP_ID = 'd3b75a41-2f08-45be-9325-27af6a1c023e'
const API_URL = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Salidas/Action`

function mapearSalida(row: Record<string, string>, index: number) {
  return {
    id: row['_RowNumber'] || row['ID'] || row['Id'] || String(index),
    titulo: row['Título'] || row['Titulo'] || row['Title'] || row['TITULO'] || '',
    categoria: row['Categoría'] || row['Categoria'] || row['CATEGORIA'] || '',
    destacado: (row['Destacado'] || '').toLowerCase() === 'true' || row['Destacado'] === '1',
    enPromocion: (row['En Promocion'] || row['EnPromocion'] || row['Promo'] || '').toLowerCase() === 'true',
    destino: row['Destino'] || row['DESTINO'] || row['Subcategorías'] || row['Subcategorias'] || '',
    descripcion: row['Descripción'] || row['Descripcion'] || row['DESCRIPCION'] || '',
    pais: row['País'] || row['Pais'] || row['PAIS'] || 'Argentina',
    origen: row['Origen'] || row['ORIGEN'] || '',
    transporte: row['Transporte'] || row['TRANSPORTE'] || '',
    servicio: row['Servicio'] || row['SERVICIO'] || '',
    noches: row['Noches'] || row['NOCHES'] || '',
    precioUSD: row['Precio USD'] || row['PrecioUSD'] || row['Precio_USD'] || row['PRECIO USD'] || '',
    promoUSD: row['Promo USD'] || row['PromoUSD'] || row['PROMO USD'] || '',
    precioARS: row['Precio ARS'] || row['PrecioARS'] || row['Precio_ARS'] || row['PRECIO ARS'] || '',
    linkWeb: row['Link Web'] || row['LinkWeb'] || row['Link_Web'] || row['URL'] || '',
    itinerario: row['Itinerario'] || row['ITINERARIO'] || '',
    fecha: row['Fecha'] || row['FECHA'] || '',
    vendedor: row['Vendedor'] || row['VENDEDOR'] || '',
    disponible: row['Disponible'] || row['DISPONIBLE'] || '50',
    urlImagenes: row['URL Imágenes'] || row['URLImagenes'] || row['Imagenes'] || row['Fotos'] || '',
    foto: row['Foto'] || row['Imagen'] || row['URL Imagen'] || row['URLImagen'] || row['imagen'] || '',
  }
}

export async function POST(req: NextRequest) {
  // Solo admin o cron de Vercel
  const { pass, preview } = await req.json().catch(() => ({ pass: '', preview: false }))
  const isVercelCron = req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  if (!isVercelCron && pass !== process.env.ADMIN_PASS) {
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

    // Si preview=true devuelve las primeras 2 filas para ver columnas
    if (preview) {
      return NextResponse.json({ ok: true, muestra: data.slice?.(0, 2) || data })
    }

    const rows: Record<string, string>[] = Array.isArray(data) ? data : data.rows || []
    const paquetes = rows.map(mapearSalida).filter(p => p.titulo)

    await redis.set('paquetes_sync', paquetes)
    await redis.set('paquetes_sync_fecha', new Date().toISOString())

    return NextResponse.json({ ok: true, total: paquetes.length, fecha: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message })
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
