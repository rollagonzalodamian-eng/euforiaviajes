import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass && pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({}, { status: 401 })
  }
  try {
    const fotos = await redis.get<Record<string, string>>('custom_fotos') || {}
    return NextResponse.json(fotos)
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(req: NextRequest) {
  const { pass, id, url } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    const fotos = await redis.get<Record<string, string>>('custom_fotos') || {}
    fotos[id] = url
    await redis.set('custom_fotos', fotos)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
