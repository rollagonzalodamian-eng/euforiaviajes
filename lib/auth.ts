import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 365 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true
      try {
        const { redis } = await import('@/lib/redis')
        const existing = await redis.get(`perfil:${user.email}`)
        if (!existing) {
          await redis.set(`perfil:${user.email}`, {
            nombre: user.name || '',
            telefono: '',
            rol: 'visitante',
            viajes: [],
            favoritos: [],
            creadoEn: new Date().toISOString(),
          })
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'Euforia Viajes <noreply@viajaconeuforia.com>',
            to: user.email,
            subject: '¡Bienvenido/a a Euforia Viajes! ✈️',
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                <div style="background:linear-gradient(135deg,#00AEEF,#0078B4);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center">
                  <h1 style="color:white;margin:0;font-size:26px">✈️ Euforia Viajes</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px">Tu agencia de viajes en la Patagonia</p>
                </div>
                <div style="background:white;padding:32px 24px;border:1px solid #eee;border-radius:0 0 16px 16px">
                  <h2 style="color:#333;margin-top:0">¡Hola${user.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋</h2>
                  <p style="color:#555;font-size:15px;line-height:1.7">
                    Ya sos parte de la familia de Euforia Viajes. Ahora podés:
                  </p>
                  <ul style="color:#555;font-size:14px;line-height:2;padding-left:20px">
                    <li>📋 Ver tu viaje asignado y voucher</li>
                    <li>❤️ Guardar paquetes en favoritos</li>
                    <li>🗺️ Descargar el catálogo completo de salidas</li>
                  </ul>
                  <div style="text-align:center;margin:28px 0">
                    <a href="https://app.viajaconeuforia.com/mi-cuenta"
                      style="display:inline-block;background:#00AEEF;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px">
                      Ver mi cuenta →
                    </a>
                  </div>
                  <p style="color:#aaa;font-size:12px;text-align:center;border-top:1px solid #eee;padding-top:16px">
                    Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816<br/>
                    viajaconeuforia.com · +54 280 432-1400
                  </p>
                </div>
              </div>
            `,
          })
        }
      } catch {}
      return true
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
}
