import EmailProvider from 'next-auth/providers/email'
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter'
import { Redis } from '@upstash/redis'
import type { NextAuthOptions } from 'next-auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: 'Euforia Viajes <onboarding@resend.dev>',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'Euforia Viajes <onboarding@resend.dev>',
          to: email,
          subject: '🔑 Tu link para ingresar a Euforia Viajes',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
              <div style="background:#00AEEF;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:22px">✈️ Euforia Viajes</h1>
              </div>
              <div style="background:#f9f9f9;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;text-align:center">
                <p style="color:#333;font-size:16px;margin-bottom:24px">
                  Hacé clic en el botón para ingresar a tu cuenta. El link vence en 24 horas.
                </p>
                <a href="${url}" style="background:#00AEEF;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
                  Ingresar a mi cuenta →
                </a>
                <p style="color:#999;font-size:12px;margin-top:24px">
                  Si no pediste este link, ignorá este email.
                </p>
              </div>
            </div>
          `,
        })
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id
      }
      return session
    },
  },
}
