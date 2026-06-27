import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { pass, etapas, asunto, cuerpo, paqueteDestacadoId } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const reservas = await redis.get<any[]>('reservas') || []

  // Filtrar por etapas seleccionadas, deduplicar por email
  const etapasFiltro: number[] = etapas || [5]
  const vistos = new Set<string>()
  const destinatarios = reservas.filter(r => {
    const etapa = r.etapa || 1
    if (!etapasFiltro.includes(etapa)) return false
    if (vistos.has(r.email)) return false
    vistos.add(r.email)
    return true
  })

  if (destinatarios.length === 0) return NextResponse.json({ ok: false, error: 'No hay destinatarios en las etapas seleccionadas' })

  // Buscar paquete destacado si se indicó
  let paquete: any = null
  if (paqueteDestacadoId) {
    const paquetes = await redis.get<any[]>('paquetes_sync') || []
    paquete = paquetes.find(p => p.id === paqueteDestacadoId) || null
  }

  let enviados = 0
  let errores = 0

  for (const r of destinatarios) {
    try {
      const html = buildEmailHtml(r.nombre, asunto, cuerpo, paquete)
      await resend.emails.send({
        from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
        to: r.email,
        subject: asunto,
        html,
      })
      enviados++
      // Pequeña pausa para no saturar la API de Resend
      await new Promise(res => setTimeout(res, 100))
    } catch {
      errores++
    }
  }

  return NextResponse.json({ ok: true, enviados, errores, total: destinatarios.length })
}

function buildEmailHtml(nombre: string, asunto: string, cuerpo: string, paquete: any) {
  const esNacional = paquete && (paquete.categoria || '').toLowerCase().includes('nacional')
  const precio = paquete
    ? (esNacional && paquete.precioARS
        ? `$ ${parseInt(paquete.precioARS).toLocaleString('es-AR')} ARS`
        : paquete.precioUSD ? `USD ${parseInt(paquete.precioUSD).toLocaleString()}` : '')
    : ''
  const promo = paquete
    ? (esNacional && paquete.promoARS
        ? `$ ${parseInt(paquete.promoARS).toLocaleString('es-AR')}`
        : paquete.promoUSD ? `USD ${parseInt(paquete.promoUSD).toLocaleString()}` : '')
    : ''

  // Reemplazar {nombre} en el cuerpo
  const cuerpoPersonalizado = cuerpo.replace(/\{nombre\}/gi, nombre)

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f5f9fd">
      <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
      </div>
      <div style="background:white;padding:32px 24px;border-radius:0 0 16px 16px">
        <h2 style="color:#333;margin-top:0">${asunto}</h2>
        <div style="color:#555;font-size:15px;line-height:1.7;white-space:pre-line">${cuerpoPersonalizado}</div>

        ${paquete ? `
        <div style="background:#f0fbff;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #c8eaf8">
          ${paquete.foto ? `<img src="${paquete.foto}" alt="${paquete.titulo}" style="width:100%;border-radius:8px;margin-bottom:14px;object-fit:cover;max-height:200px" />` : ''}
          <h3 style="color:#00AEEF;margin:0 0 8px">${paquete.titulo}</h3>
          ${paquete.fecha ? `<p style="margin:4px 0;font-size:13px;color:#555">📅 Salida: <strong>${paquete.fecha}</strong></p>` : ''}
          ${paquete.noches ? `<p style="margin:4px 0;font-size:13px;color:#555">🌙 ${paquete.noches} noches</p>` : ''}
          ${paquete.origen ? `<p style="margin:4px 0;font-size:13px;color:#555">📍 Desde ${paquete.origen}</p>` : ''}
          ${precio ? `<p style="font-size:22px;font-weight:900;color:#00AEEF;margin:10px 0 4px">${precio}</p>` : ''}
          ${promo ? `<p style="font-size:14px;color:#e53935;font-weight:bold;margin:0">🔥 Promo efectivo: ${promo}</p>` : ''}
          <a href="https://app.viajaconeuforia.com/paquete/${paquete.id}"
            style="display:inline-block;margin-top:14px;background:#00AEEF;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
            Ver detalle y reservar →
          </a>
        </div>
        ` : ''}

        <div style="text-align:center;margin:24px 0">
          <a href="https://wa.me/542804321400"
            style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
            💬 Consultar por WhatsApp
          </a>
        </div>

        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
          Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816<br/>
          Recibiste este email porque consultaste con nosotros.
        </p>
      </div>
    </div>
  `
}
