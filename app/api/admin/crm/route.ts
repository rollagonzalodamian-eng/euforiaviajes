import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

async function getReservas() {
  return await redis.lrange<any>('reservas', 0, -1) || []
}

async function saveReservas(reservas: any[]) {
  await redis.del('reservas')
  for (const r of [...reservas].reverse()) await redis.lpush('reservas', r)
}

// PATCH: cambiar etapa de una prereserva
export async function PATCH(req: NextRequest) {
  const { pass, id, etapa } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const reservas = await getReservas()
  const updated = reservas.map((r: any) => r.id === id ? { ...r, etapa } : r)
  await saveReservas(updated)
  return NextResponse.json({ ok: true })
}

// POST: enviar cotización manual a una prereserva
export async function POST(req: NextRequest) {
  const { pass, id, textoCotizacion } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const reservas = await getReservas()
  const reserva = reservas.find((r: any) => r.id === id)
  if (!reserva) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  // Idempotencia: no reenviar si ya se mandó en los últimos 2 minutos
  if (reserva.cotizacionEnviada) {
    const hace = Date.now() - new Date(reserva.cotizacionEnviada).getTime()
    if (hace < 2 * 60 * 1000) return NextResponse.json({ error: 'Ya se envió una cotización hace menos de 2 minutos' }, { status: 429 })
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Si viene texto manual, mandarlo como email simple
  if (textoCotizacion) {
    await resend.emails.send({
      from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
      to: reserva.email,
      subject: `✈️ Tu cotización: ${reserva.paqueteTitulo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
            <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px">Tu cotización personalizada</p>
          </div>
          <div style="background:white;padding:28px 24px;border:1px solid #eee;border-radius:0 0 12px 12px">
            <p style="font-size:15px;color:#333;white-space:pre-line;line-height:1.8">${textoCotizacion.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="color:#aaa;font-size:12px;text-align:center">
              Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816<br/>
              viajaconeuforia.com · +54 280 432-1400
            </p>
          </div>
        </div>
      `,
    })
  } else {
    const paquetes = await redis.get<any[]>('paquetes_sync') || []
    const paquete = paquetes.find((p: any) => p.id === reserva.paqueteId || p.titulo === reserva.paqueteTitulo)
    await resend.emails.send({
      from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
      to: reserva.email,
      subject: `✈️ Tu cotización: ${reserva.paqueteTitulo}`,
      html: buildCotizacionHtml(reserva, paquete),
    })
  }

  // Marcar como etapa 2
  const updated = reservas.map((r: any) => r.id === id ? { ...r, etapa: 2, cotizacionEnviada: new Date().toISOString() } : r)
  await saveReservas(updated)

  return NextResponse.json({ ok: true })
}

export function buildCotizacionHtml(reserva: any, paquete: any) {
  const tienePrecio = paquete && (paquete.precioUSD || paquete.precioARS)
  const esNacional = paquete && (paquete.categoria || '').toLowerCase().includes('nacional')
  const precio = paquete
    ? (esNacional && paquete.precioARS
        ? `$ ${parseInt(paquete.precioARS).toLocaleString('es-AR')} ARS por persona`
        : paquete.precioUSD
        ? `USD ${parseInt(paquete.precioUSD).toLocaleString()} por persona`
        : '')
    : ''
  const promo = paquete
    ? (esNacional && paquete.promoARS
        ? `$ ${parseInt(paquete.promoARS).toLocaleString('es-AR')} ARS`
        : paquete.promoUSD
        ? `USD ${parseInt(paquete.promoUSD).toLocaleString()}`
        : '')
    : ''

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f5f9fd">
      <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">✈️ Euforia Viajes</h1>
        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Tu cotización personalizada</p>
      </div>

      <div style="background:white;padding:32px 24px">
        <h2 style="color:#333;margin-top:0">¡Hola ${reserva.nombre}! 👋</h2>
        <p style="color:#555;font-size:15px;line-height:1.6">
          Preparamos tu cotización para <strong style="color:#00AEEF">${reserva.paqueteTitulo}</strong>.
          A continuación encontrás todos los detalles:
        </p>

        ${paquete ? `
        <!-- Detalle del paquete -->
        <div style="background:#f0fbff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #c8eaf8">
          <h3 style="color:#00AEEF;margin:0 0 14px">${paquete.titulo}</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${paquete.destino ? `<tr><td style="padding:5px 0;color:#777;width:140px">📍 Destino</td><td style="font-weight:bold;color:#333">${paquete.destino}</td></tr>` : ''}
            ${paquete.origen ? `<tr><td style="padding:5px 0;color:#777">🚌 Salida desde</td><td style="font-weight:bold;color:#333">${paquete.origen}</td></tr>` : ''}
            ${paquete.noches ? `<tr><td style="padding:5px 0;color:#777">🌙 Duración</td><td style="font-weight:bold;color:#333">${paquete.noches} noches</td></tr>` : ''}
            ${paquete.fecha ? `<tr><td style="padding:5px 0;color:#777">📅 Fecha de salida</td><td style="font-weight:bold;color:#333">${paquete.fecha}</td></tr>` : ''}
            ${paquete.transporte ? `<tr><td style="padding:5px 0;color:#777">🚌 Transporte</td><td style="font-weight:bold;color:#333">${paquete.transporte}</td></tr>` : ''}
            ${paquete.servicio ? `<tr><td style="padding:5px 0;color:#777">🍳 Régimen</td><td style="font-weight:bold;color:#333">${paquete.servicio}</td></tr>` : ''}
            <tr><td style="padding:5px 0;color:#777">👥 Pasajeros</td><td style="font-weight:bold;color:#333">${reserva.cantPasajeros}</td></tr>
          </table>
        </div>

        <!-- Precio -->
        ${tienePrecio ? `
        <div style="background:#fff8e1;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #ffe082">
          <h3 style="color:#333;margin:0 0 12px">💰 Precio</h3>
          <p style="font-size:26px;font-weight:900;color:#00AEEF;margin:0">${precio}</p>
          ${promo ? `<p style="font-size:16px;color:#e53935;font-weight:bold;margin:4px 0 0">🔥 Promo efectivo: ${promo}</p>` : ''}
          ${reserva.cantPasajeros > 1 && paquete.precioUSD ? `
          <p style="font-size:13px;color:#777;margin:8px 0 0">
            Total ${reserva.cantPasajeros} pasajeros: <strong>USD ${(parseInt(paquete.precioUSD) * parseInt(reserva.cantPasajeros)).toLocaleString()}</strong>
          </p>` : ''}
        </div>
        ` : ''}

        ${paquete.descripcion ? `
        <div style="margin:20px 0">
          <h3 style="color:#333;font-size:15px">📋 Descripción</h3>
          <p style="color:#555;font-size:14px;line-height:1.7">${paquete.descripcion}</p>
        </div>
        ` : ''}
        ` : `
        <!-- Paquete no en sistema -->
        <div style="background:#fff3cd;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #ffc107">
          <p style="margin:0;color:#856404;font-size:14px">
            📋 Estamos preparando los detalles específicos de tu consulta.
            Te contactamos en menos de 24 horas con la cotización completa.
          </p>
        </div>
        `}

        <!-- Formas de pago -->
        <div style="background:#f8f8f8;border-radius:12px;padding:20px;margin:20px 0">
          <h3 style="color:#333;margin:0 0 12px;font-size:15px">💳 Formas de pago</h3>
          <ul style="margin:0;padding-left:18px;color:#555;font-size:14px;line-height:2">
            <li>Seña del <strong>15%</strong> para reservar tu lugar</li>
            <li>Hasta <strong>12 cuotas</strong> con tarjeta de crédito</li>
            <li>Transferencia bancaria o efectivo (sin recargo)</li>
            <li>Mercado Pago</li>
          </ul>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:28px 0">
          <p style="color:#555;font-size:14px;margin-bottom:16px">¿Listo para reservar? Escribinos y coordinamos el pago de la seña.</p>
          <a href="https://wa.me/542804321400?text=Hola%2C+quiero+confirmar+mi+reserva+para+${encodeURIComponent(reserva.paqueteTitulo)}"
            style="display:inline-block;background:#25D366;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:10px">
            💬 Confirmar por WhatsApp
          </a>
          <br/>
          <a href="mailto:adm@viajaconeuforia.com"
            style="display:inline-block;color:#00AEEF;font-size:13px;margin-top:8px">
            o escribinos a adm@viajaconeuforia.com
          </a>
        </div>

        <p style="color:#aaa;font-size:12px;text-align:center;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
          Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816<br/>
          viajaconeuforia.com · +54 280 432-1400
        </p>
      </div>
    </div>
  `
}
