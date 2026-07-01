import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { PerfilUsuario } from '@/app/api/auth/perfil/route'

export async function GET(req: NextRequest) {
  const pass = req.nextUrl.searchParams.get('pass')
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const keys = await redis.keys('perfil:*')
  if (!keys.length) return NextResponse.json([])
  const perfiles = await Promise.all(
    keys.map(async k => {
      const p = await redis.get<PerfilUsuario>(k)
      return { email: k.replace('perfil:', ''), ...p }
    })
  )
  return NextResponse.json(perfiles)
}

export async function POST(req: NextRequest) {
  const { pass, email, rol, viajes, viajeAsignado, puntos } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const existing = await redis.get<PerfilUsuario>(`perfil:${email}`)
  if (!existing) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const viajeAnterior = (existing as any).viajeAsignado
  const updated = {
    ...existing,
    ...(rol && { rol }),
    ...(viajes && { viajes }),
    ...(viajeAsignado !== undefined && { viajeAsignado }),
    ...(puntos !== undefined && { puntos }),
  }
  await redis.set(`perfil:${email}`, updated)

  // Notificar al pasajero si se asignó un viaje nuevo
  if (viajeAsignado && JSON.stringify(viajeAsignado) !== JSON.stringify(viajeAnterior)) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const nombre = (existing as any).nombre || email.split('@')[0]
      const titulo = viajeAsignado.paqueteTitulo || viajeAsignado.titulo || 'Tu viaje'
      const fecha = viajeAsignado.fechaSalida || ''
      const estado = viajeAsignado.estado || 'pendiente'
      await resend.emails.send({
        from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
        to: email,
        subject: `✈️ ¡Tu viaje está listo! — ${titulo}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:24px">✈️ ¡Tu viaje está confirmado!</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Euforia Viajes</p>
            </div>
            <div style="background:white;padding:32px 24px;border:1px solid #eee;border-radius:0 0 16px 16px">
              <h2 style="color:#333;margin-top:0">¡Hola${nombre ? `, ${nombre.split(' ')[0]}` : ''}! 🎉</h2>
              <p style="color:#555;font-size:15px;line-height:1.7">
                Ya tenés tu viaje asignado en tu cuenta de Euforia Viajes.
              </p>
              <div style="background:#f0fbff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #c8eaf8">
                <h3 style="color:#00AEEF;margin:0 0 14px">${titulo}</h3>
                ${fecha ? `<p style="margin:4px 0;color:#555;font-size:14px">📅 Fecha de salida: <strong>${fecha}</strong></p>` : ''}
                <p style="margin:4px 0;color:#555;font-size:14px">Estado: <strong style="color:${estado === 'confirmado' ? '#2e7d32' : estado === 'pagado' ? '#1565c0' : '#e65100'}">${estado}</strong></p>
              </div>
              <p style="color:#555;font-size:14px;line-height:1.6">
                Encontrás tu <strong>voucher e itinerario</strong> completo en tu cuenta:
              </p>
              <div style="text-align:center;margin:24px 0">
                <a href="https://app.viajaconeuforia.com/mi-cuenta"
                  style="display:inline-block;background:#00AEEF;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px">
                  Ver mi viaje →
                </a>
              </div>
              <p style="color:#555;font-size:13px">¿Tenés dudas? Escribinos por WhatsApp al <a href="https://wa.me/542804321400" style="color:#00AEEF">+54 280 432-1400</a></p>
              <p style="color:#aaa;font-size:12px;text-align:center;border-top:1px solid #eee;padding-top:16px;margin-top:20px">
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
