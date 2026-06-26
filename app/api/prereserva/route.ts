import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function guardarEnKV(data: object) {
  try {
    const { redis } = await import('@/lib/redis')
    const reserva = { ...data, fecha: new Date().toISOString(), estado: 'en_gestion' }
    await redis.lpush('reservas', reserva)
  } catch {}
}

export async function POST(req: NextRequest) {
  const { nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId, precioUSD, precioARS, fecha: fechaPaquete } = await req.json()

  await guardarEnKV({ nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId })

  // Notificacion Telegram
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: paqueteTitulo, nombre, email, telefono }),
    })
  } catch {}

  // Email al admin
  try {
    await resend.emails.send({
      from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
      to: 'adm@viajaconeuforia.com',
      subject: `Nueva pre-reserva: ${paqueteTitulo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#00AEEF;padding:20px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">✈️ Nueva Pre-Reserva</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="color:#00AEEF;margin-top:0">${paqueteTitulo}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#666;width:140px">👤 Nombre</td><td style="font-weight:bold">${nombre}</td></tr>
              <tr><td style="padding:6px 0;color:#666">📧 Email</td><td style="font-weight:bold">${email}</td></tr>
              <tr><td style="padding:6px 0;color:#666">📱 Teléfono</td><td style="font-weight:bold">${telefono}</td></tr>
              <tr><td style="padding:6px 0;color:#666">👥 Pasajeros</td><td style="font-weight:bold">${cantPasajeros}</td></tr>
              ${fechaDeseada ? `<tr><td style="padding:6px 0;color:#666">📅 Fecha deseada</td><td style="font-weight:bold">${fechaDeseada}</td></tr>` : ''}
              ${mensaje ? `<tr><td style="padding:6px 0;color:#666">💬 Consulta</td><td>${mensaje}</td></tr>` : ''}
            </table>
          </div>
        </div>
      `,
    })
  } catch {}

  // Email de confirmación al cliente
  try {
    await resend.emails.send({
      from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
      to: email,
      subject: `✈️ Recibimos tu consulta sobre ${paqueteTitulo}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#00AEEF;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
          </div>
          <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <h2 style="color:#333;margin-top:0">¡Hola ${nombre}! 👋</h2>
            <p style="color:#555;font-size:15px;line-height:1.6">
              Recibimos tu consulta sobre <strong style="color:#00AEEF">${paqueteTitulo}</strong>.<br/>
              Nuestro equipo va a contactarte en las próximas <strong>24 horas</strong> para confirmar los detalles.
            </p>
            <div style="background:#f0fbff;border-left:4px solid #00AEEF;padding:16px;border-radius:0 8px 8px 0;margin:24px 0">
              <p style="margin:0;color:#0090C5;font-size:14px"><strong>Resumen de tu consulta:</strong></p>
              <p style="margin:8px 0 0;color:#333;font-size:14px">📦 ${paqueteTitulo}</p>
              <p style="margin:4px 0 0;color:#333;font-size:14px">👥 ${cantPasajeros} pasajero${parseInt(cantPasajeros) > 1 ? 's' : ''}</p>
              ${fechaPaquete ? `<p style="margin:4px 0 0;color:#333;font-size:14px">🗓️ Fecha de salida: <strong>${fechaPaquete}</strong></p>` : ''}
              ${fechaDeseada ? `<p style="margin:4px 0 0;color:#333;font-size:14px">📅 Fecha deseada: ${fechaDeseada}</p>` : ''}
              ${precioUSD ? `<p style="margin:4px 0 0;color:#00AEEF;font-size:16px;font-weight:bold">💵 USD ${parseInt(precioUSD).toLocaleString()} por persona</p>` : precioARS ? `<p style="margin:4px 0 0;color:#00AEEF;font-size:16px;font-weight:bold">💵 $ ${parseInt(precioARS).toLocaleString()} por persona</p>` : ''}
            </div>
            <div style="background:#f9fff9;border:1px solid #c3efd0;border-radius:8px;padding:14px;margin-bottom:20px">
              <p style="margin:0;color:#2d7a3a;font-size:13px">🔒 <strong>Tu pre-reserva está guardada.</strong> Un asesor te va a contactar en menos de 24 hs para confirmar disponibilidad y coordinar el pago.</p>
            </div>
            <p style="color:#555;font-size:14px">
              ¿Necesitás respuesta urgente? Escribinos por WhatsApp:
            </p>
            <a href="https://wa.me/542804321400" style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
              💬 Escribir por WhatsApp
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:32px">
              Euforia Viajes · viajaconeuforia.com
            </p>
          </div>
        </div>
      `,
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
