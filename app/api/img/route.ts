import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://viajaconeuforia.com',
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
      },
    })
    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      const buffer = await res.arrayBuffer()
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  } catch {}

  // Si falla, redirigir a imagen genérica de viajes
  return NextResponse.redirect('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop')
}
