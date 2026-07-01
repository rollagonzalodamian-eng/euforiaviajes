import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const { pass } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })

  try {
    const [bulk, bulkT] = await Promise.all([
      redis.get<Record<string, string>>('custom_fotos').catch(() => null),
      redis.get<Record<string, string>>('custom_fotos_t').catch(() => null),
    ])

    const migradosUrl: string[] = []
    const migradosT: string[] = []

    if (bulk && Object.keys(bulk).length > 0) {
      for (const [id, url] of Object.entries(bulk)) {
        await redis.set(`foto_url:${id}`, url)
        await redis.sadd('foto_url_ids', id)
        migradosUrl.push(id)
      }
    }

    if (bulkT && Object.keys(bulkT).length > 0) {
      for (const [tKey, url] of Object.entries(bulkT)) {
        await redis.set(`foto_url_t:${tKey}`, url)
        migradosT.push(tKey)
      }
    }

    return NextResponse.json({
      ok: true,
      migradosUrl: migradosUrl.length,
      migradosT: migradosT.length,
      ids: migradosUrl,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
