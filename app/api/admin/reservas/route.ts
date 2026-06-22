import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    const reservas = await redis.lrange<any>('reservas', 0, -1) || []
    return NextResponse.json(reservas)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { pass, email, paqueteId, estado } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const reservas = await redis.lrange<any>('reservas', 0, -1) || []
    const updated = reservas.map((r: any) =>
      r.email === email && r.paqueteId === paqueteId ? { ...r, estado } : r
    )
    await redis.del('reservas')
    if (updated.length > 0) {
      for (const r of [...updated].reverse()) {
        await redis.lpush('reservas', r)
      }
    }

    // Notificar al cliente por email si cambia el estado
    if (estado === 'confirmada' || estado === 'cancelada') {
      const reserva = reservas.find((r: any) => r.email === email && r.paqueteId === paqueteId)
      if (reserva) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const esConfirmada = estado === 'confirmada'
        await resend.emails.send({
          from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
          to: email,
          subject: esConfirmada ? `✅ ¡Tu viaje está confirmado! ${reserva.paqueteTitulo}` : `ℹ️ Actualización sobre tu reserva`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:${esConfirmada ? '#00AEEF' : '#888'};padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:22px">${esConfirmada ? '✅ ¡Viaje Confirmado!' : 'ℹ️ Actualización de reserva'}</h1>
              </div>
              <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee">
                <h2 style="color:#333;margin-top:0">Hola ${reserva.nombre} 👋</h2>
                ${esConfirmada
                  ? `<p style="color:#555;font-size:15px">¡Tu viaje a <strong style="color:#00AEEF">${reserva.paqueteTitulo}</strong> está <strong>confirmado</strong>! Pronto te enviaremos los detalles del itinerario.</p>`
                  : `<p style="color:#555;font-size:15px">Lamentablemente tu reserva para <strong>${reserva.paqueteTitulo}</strong> no pudo concretarse. Contactanos para buscar alternativas.</p>`
                }
                <a href="https://wa.me/542804321400" style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin-top:16px">
                  💬 Contactar por WhatsApp
                </a>
              </div>
            </div>
          `,
        }).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
