import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Resend } from 'resend'

const APP_ID = 'd3b75a41-2f08-45be-9325-27af6a1c023e'
const API_URL = `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/Salidas/Action`

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WEBHOOK_SECRET) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const debug = await redis.get('webhook_debug_last')
  return NextResponse.json(debug || { mensaje: 'Ningún webhook recibido aún' })
}

export async function POST(req: NextRequest) {
  // Verificar secret para que solo AppSheet pueda llamar este endpoint
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}

  // Guardar último body recibido para debugging
  await redis.set('webhook_debug_last', body)

  const evento = body.eventType || body.event || 'UPDATE'
  const fila = body.data || body.row || {}

  // Siempre sincronizar cuando AppSheet llama
  const syncResult = await sincronizarAppSheet()

  // Detectar acciones específicas según los datos recibidos
  const promesas: Promise<any>[] = []

  // 1. Cupos bajos — avisar por Telegram
  const cupos = parseInt(fila['Cupos'] || fila['Cupo'] || '99')
  const titulo = fila['Título'] || fila['TÃ­tulo'] || fila['Titulo'] || ''
  const fecha = fila['Fecha'] || ''
  if (!isNaN(cupos) && cupos > 0 && cupos <= 5 && titulo) {
    promesas.push(alertaCuposBajos(titulo, fecha, cupos))
  }

  // 2. Nueva salida — email a todos los usuarios registrados
  const esNuevo = evento === 'ADD'
  if (esNuevo) {
    promesas.push(emailNuevaSalida(fila, syncResult.paquetes))
  }

  await Promise.allSettled(promesas)

  return NextResponse.json({ ok: true, evento, sync: syncResult.total })
}

async function sincronizarAppSheet() {
  const apiKey = process.env.APPSHEET_API_KEY
  if (!apiKey) return { total: 0, paquetes: [] }
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'ApplicationAccessKey': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Action: 'Find', Properties: {}, Rows: [] }),
    })
    const rawText = await res.text()
    if (!res.ok || !rawText.trim()) return { total: 0, paquetes: [] }
    const data = JSON.parse(rawText)
    const rows: any[] = Array.isArray(data) ? data : (data.value || data.rows || [])
    const paquetes = rows.map(mapearSalida).filter((p: any) => p.titulo)
    await redis.set('paquetes_sync', paquetes)
    await redis.set('paquetes_sync_fecha', new Date().toISOString())
    return { total: paquetes.length, paquetes }
  } catch {
    return { total: 0, paquetes: [] }
  }
}

async function alertaCuposBajos(titulo: string, fecha: string, cupos: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return
  const emoji = cupos === 1 ? '🚨' : cupos <= 3 ? '⚠️' : '🔔'
  const texto = `${emoji} <b>Cupos bajos</b>\n\n✈️ <b>${titulo}</b>${fecha ? `\n📅 ${fecha}` : ''}\n🪑 Quedan <b>${cupos} cupo${cupos !== 1 ? 's' : ''}</b>\n\n¿Cerrás la venta?`
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML' }),
  })
}

async function emailNuevaSalida(fila: any, paquetes: any[]) {
  // AppSheet envía _THISROW con todos los campos — buscar por cualquier clave que tenga el ID
  const rowId = fila['Row ID'] || fila['RowId'] || fila['row_id'] || fila['id'] || ''
  // Buscar por ID, o por cualquier campo que parezca título
  const tituloFila = Object.values(fila).find((v: any) =>
    typeof v === 'string' && v.length > 3 && v.length < 100 &&
    paquetes.some((p: any) => p.titulo === v || p.titulo === fixEncoding(v))
  ) as string || ''
  const paquete = (rowId ? paquetes.find((p: any) => p.id === rowId) : null)
    || (tituloFila ? paquetes.find((p: any) => p.titulo === tituloFila || p.titulo === fixEncoding(tituloFila)) : null)
    || paquetes[paquetes.length - 1]  // AppSheet devuelve filas en orden de creación, el último es el más nuevo
  if (!paquete?.titulo) return

  // Obtener todos los usuarios registrados
  const keys = await redis.keys('perfil:*')
  if (!keys.length) return
  const perfiles = await Promise.all(keys.map(async k => {
    const p = await redis.get<any>(k)
    return { email: k.replace('perfil:', ''), nombre: p?.nombre || p?.name || '', ...p }
  }))
  const destinatarios = perfiles.filter(p => p.email)
  if (destinatarios.length === 0) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const esNacional = (paquete.categoria || '').toLowerCase().includes('nacional')
  const precio = esNacional && paquete.precioARS
    ? `$ ${parseInt(paquete.precioARS).toLocaleString('es-AR')} ARS`
    : paquete.precioUSD ? `USD ${parseInt(paquete.precioUSD).toLocaleString()}` : ''

  for (const r of destinatarios) {
    try {
      await resend.emails.send({
        from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
        to: r.email,
        subject: `✈️ Nueva salida disponible: ${paquete.titulo}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f5f9fd">
            <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
              <p style="color:white;margin:0 0 4px;font-size:13px;opacity:.8">🆕 NUEVA SALIDA</p>
              <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
            </div>
            <div style="background:white;padding:32px 24px;border-radius:0 0 16px 16px">
              <h2 style="color:#333;margin-top:0">¡Hola ${r.nombre}! Tenemos una nueva salida para vos 👋</h2>
              <div style="background:#f0fbff;border-radius:12px;padding:20px;margin:16px 0;border:1px solid #c8eaf8">
                ${paquete.foto ? `<img src="${paquete.foto}" alt="${paquete.titulo}" style="width:100%;border-radius:8px;margin-bottom:14px;object-fit:cover;max-height:220px"/>` : ''}
                <h3 style="color:#00AEEF;margin:0 0 10px">${paquete.titulo}</h3>
                ${paquete.fecha ? `<p style="margin:4px 0;font-size:13px;color:#555">📅 Salida: <strong>${paquete.fecha}</strong></p>` : ''}
                ${paquete.noches ? `<p style="margin:4px 0;font-size:13px;color:#555">🌙 ${paquete.noches} noches</p>` : ''}
                ${paquete.origen ? `<p style="margin:4px 0;font-size:13px;color:#555">📍 Desde ${paquete.origen}</p>` : ''}
                ${precio ? `<p style="font-size:24px;font-weight:900;color:#00AEEF;margin:12px 0 4px">${precio}</p>` : ''}
                <a href="https://app.viajaconeuforia.com/paquete/${paquete.id}"
                  style="display:inline-block;margin-top:14px;background:#00AEEF;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold">
                  Ver detalle y reservar →
                </a>
              </div>
              <div style="text-align:center;margin-top:20px">
                <a href="https://wa.me/542804321400"
                  style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold">
                  💬 Consultar por WhatsApp
                </a>
              </div>
              <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
                Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816
              </p>
            </div>
          </div>
        `,
      })
      await new Promise(r => setTimeout(r, 100))
    } catch {}
  }
}

function fixEncoding(str: string): string {
  if (!str) return ''
  try {
    return decodeURIComponent(str.split('').map(c => {
      const code = c.charCodeAt(0)
      return code > 127 ? '%' + code.toString(16).toUpperCase().padStart(2, '0') : c
    }).join(''))
  } catch { return str }
}

function extraerUrl(campo: any): string {
  if (!campo) return ''
  if (typeof campo === 'object') return campo.Url || campo.url || ''
  if (typeof campo === 'string') {
    if (campo.startsWith('http')) return campo
    try { return JSON.parse(campo).Url || '' } catch {}
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
    destino: fixEncoding(row['Destino'] || ''),
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
    cupos: row['Cupos'] || row['Cupo'] || row['Cupos Disponibles'] || '',
    urlImagenes: extraerUrl(row['URL Imagenes'] || row['ImÃ¡genes y Videos'] || ''),
    foto: extraerUrl(row['URL Imagenes'] || row['ImÃ¡genes y Videos'] || ''),
  }
}
