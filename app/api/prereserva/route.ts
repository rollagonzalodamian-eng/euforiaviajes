import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { buildCotizacionHtml } from '@/app/api/admin/crm/route'

const resend = new Resend(process.env.RESEND_API_KEY)

async function guardarEnKV(data: object) {
  try {
    const { redis } = await import('@/lib/redis')
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const reserva = { ...data, id, fecha: new Date().toISOString(), estado: 'en_gestion', etapa: 1 }
    await redis.lpush('reservas', reserva)
    return id
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId, precioUSD, precioARS, fecha: fechaPaquete } = body

  const id = await guardarEnKV({ nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId })

  // Buscar paquete en AppSheet sync
  let paquete: any = null
  try {
    const { redis } = await import('@/lib/redis')
    const paquetes = await redis.get<any[]>('paquetes_sync') || []
    paquete = paquetes.find(p => p.id === paqueteId || p.titulo === paqueteTitulo) || null
  } catch {}

  // Notificacion Telegram
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (botToken && chatId) {
      const encontrado = paquete ? '✅ Cotización enviada automáticamente' : '⚠️ COTIZAR MANUALMENTE'
      const mensajeTexto = mensaje ? `\n\n📋 <b>Detalle del viaje:</b>\n${mensaje}` : ''
      const texto = `🔔 <b>Nueva consulta</b>\n\n✈️ <b>${paqueteTitulo}</b>\n👤 ${nombre}\n📧 ${email}\n📱 ${telefono}\n👥 ${cantPasajeros} pasajero(s)${fechaDeseada ? `\n📅 ${fechaDeseada}` : ''}${mensajeTexto}\n\n${encontrado}`
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML' }),
      })
    }
  } catch {}

  // Email al admin
  try {
    await resend.emails.send({
      from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
      to: 'adm@viajaconeuforia.com',
      subject: `${paquete ? '✅' : '⚠️ COTIZAR'} Nueva consulta: ${paqueteTitulo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#00AEEF;padding:20px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">✈️ Nueva Consulta</h1>
            <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px">${paqueteTitulo}</p>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">

            <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
              <tr><td style="padding:6px 0;color:#666;width:140px">👤 Nombre</td><td style="font-weight:bold">${nombre}</td></tr>
              <tr><td style="padding:6px 0;color:#666">📧 Email</td><td style="font-weight:bold">${email}</td></tr>
              <tr><td style="padding:6px 0;color:#666">📱 Teléfono</td><td style="font-weight:bold">${telefono}</td></tr>
              <tr><td style="padding:6px 0;color:#666">👥 Pasajeros</td><td style="font-weight:bold">${cantPasajeros}</td></tr>
              ${fechaDeseada ? `<tr><td style="padding:6px 0;color:#666">📅 Fecha deseada</td><td style="font-weight:bold">${fechaDeseada}</td></tr>` : ''}
            </table>

            ${mensaje ? `
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:16px;margin-bottom:16px">
              <p style="margin:0 0 10px;font-weight:bold;color:#333;font-size:14px">📋 Detalle del viaje solicitado:</p>
              <p style="margin:0;color:#444;font-size:14px;line-height:1.8;white-space:pre-line">${mensaje}</p>
            </div>
            ` : ''}

            <div style="padding:14px;border-radius:8px;background:${paquete ? '#e8f5e9' : '#fff3cd'};border:1px solid ${paquete ? '#a5d6a7' : '#ffc107'}">
              <p style="margin:0;font-size:13px;font-weight:bold;color:${paquete ? '#2e7d32' : '#856404'}">
                ${paquete ? '✅ Cotización enviada automáticamente al cliente.' : '⚠️ Viaje a medida — necesita cotización manual. Toda la info del cliente está arriba.'}
              </p>
            </div>

            ${!paquete ? `
            <div style="text-align:center;margin-top:16px">
              <a href="https://wa.me/54${telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${nombre}! Recibimos tu consulta por ${paqueteTitulo}. Estamos preparando tu cotización.`)}"
                style="display:inline-block;background:#25D366;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
                💬 Responder por WhatsApp
              </a>
            </div>
            ` : ''}

          </div>
        </div>
      `,
    })
  } catch {}

  // Email al cliente
  if (paquete) {
    // Cotización completa automática
    try {
      await resend.emails.send({
        from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
        to: email,
        subject: `✈️ Tu cotización: ${paqueteTitulo}`,
        html: buildCotizacionHtml({ nombre, email, telefono, cantPasajeros, paqueteTitulo, paqueteId, fechaDeseada }, paquete),
      })
      // Actualizar etapa a 2
      if (id) {
        try {
          const { redis } = await import('@/lib/redis')
          const reservas = await redis.lrange<any>('reservas', 0, -1) || []
          const updated = reservas.map((r: any) => r.id === id ? { ...r, etapa: 2, cotizacionEnviada: new Date().toISOString() } : r)
          await redis.del('reservas')
          for (const r of [...updated].reverse()) await redis.lpush('reservas', r)
        } catch {}
      }
    } catch {}
  } else {
    // Email "te cotizamos en 24hs"
    try {
      await resend.emails.send({
        from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
        to: email,
        subject: `✈️ Recibimos tu consulta sobre ${paqueteTitulo}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
            </div>
            <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
              <h2 style="color:#333;margin-top:0">¡Hola ${nombre}! 👋</h2>
              <p style="color:#555;font-size:15px;line-height:1.6">
                Recibimos tu consulta sobre <strong style="color:#00AEEF">${paqueteTitulo}</strong>.
              </p>
              <div style="background:#f0fbff;border-left:4px solid #00AEEF;padding:16px;border-radius:0 8px 8px 0;margin:24px 0">
                <p style="margin:0;color:#0078B4;font-weight:bold;font-size:15px">⏱️ En menos de 24 horas recibís tu cotización completa</p>
                <p style="margin:8px 0 0;color:#555;font-size:13px">Nuestro equipo está preparando los detalles de precios, fechas y servicios incluidos especialmente para vos.</p>
              </div>
              <div style="background:#f9fff9;border:1px solid #c3efd0;border-radius:8px;padding:14px;margin-bottom:20px">
                <p style="margin:0;color:#2d7a3a;font-size:13px">🔒 <strong>Tu pre-reserva está guardada.</strong> Pasajeros: ${cantPasajeros}${fechaDeseada ? ` · Fecha deseada: ${fechaDeseada}` : ''}</p>
              </div>
              <p style="color:#555;font-size:14px">¿Necesitás respuesta urgente? Escribinos por WhatsApp:</p>
              <a href="https://wa.me/542804321400?text=Hola%2C+consulto+por+${encodeURIComponent(paqueteTitulo)}"
                style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
                💬 Escribir por WhatsApp
              </a>
              <p style="color:#aaa;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px;text-align:center">
                Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816
              </p>
            </div>
          </div>
        `,
      })
    } catch {}
  }

  return NextResponse.json({ ok: true })
}
