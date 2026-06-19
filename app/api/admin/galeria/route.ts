import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json([])
  try {
    const fotos = await redis.get<string[]>(`galeria:${id}`) || []
    return NextResponse.json(fotos)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { pass, id, fotos } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    await redis.set(`galeria:${id}`, fotos)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
