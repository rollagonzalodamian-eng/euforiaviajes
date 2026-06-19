import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { titulo, nombre, email, telefono } = await req.json()

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return NextResponse.json({ ok: false })

  const mensaje = `🔔 *Nueva pre-reserva*\n\n✈️ *${titulo}*\n👤 ${nombre}\n📧 ${email}\n📱 ${telefono}`

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' }),
  })

  return NextResponse.json({ ok: true })
}
