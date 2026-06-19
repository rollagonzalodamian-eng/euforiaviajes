import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function guardarEnKV(data: object) {
  try {
    const { redis } = await import('@/lib/redis')
    const reserva = { ...data, fecha: new Date().toISOString() }
    await redis.lpush('reservas', reserva)
  } catch {
    // Redis no configurado aún, ignorar
  }
}

export async function POST(req: NextRequest) {
  const { nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId } = await req.json()

  await guardarEnKV({ nombre, email, telefono, cantPasajeros, fechaDeseada, mensaje, paqueteTitulo, paqueteId })

  // Notificacion Telegram
  try {
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: paqueteTitulo, nombre, email, telefono }),
    })
  } catch {}

  try {
    await resend.emails.send({
      from: 'Euforia Viajes App <onboarding@resend.dev>',
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
            <div style="margin-top:20px;padding:12px;background:#E0F6FF;border-radius:8px;font-size:13px;color:#0090C5">
              ⚡ Esta solicitud llegó desde la app web de Euforia Viajes. Contactar al cliente a la brevedad.
            </div>
          </div>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
