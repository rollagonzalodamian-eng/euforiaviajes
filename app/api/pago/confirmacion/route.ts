import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

async function notificarTelegram(mensaje: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'HTML' }),
  }).catch(() => {})
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const status = params.get('status')
  const paymentId = params.get('payment_id')
  const externalRef = params.get('external_reference')

  if (status === 'approved' && paymentId) {
    const pago = {
      paymentId,
      externalRef,
      status,
      fecha: new Date().toISOString(),
    }

    // Guardar en Redis
    await redis.lpush('pagos_mp', pago).catch(() => {})

    // Notificar por Telegram
    await notificarTelegram(
      `💳 <b>¡PAGO RECIBIDO!</b>\n` +
      `💰 Payment ID: ${paymentId}\n` +
      `📦 Ref: ${externalRef || '-'}\n` +
      `✅ Estado: APROBADO\n` +
      `📅 ${new Date().toLocaleString('es-AR')}`
    )
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/confirmacion?pago=${status}`)
}
