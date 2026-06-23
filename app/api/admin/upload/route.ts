import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const pass = req.headers.get('x-admin-pass')
  if (pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ ok: false, error: 'No se recibió archivo' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'jpg'
    const nombre = `fotos/${Date.now()}.${ext}`

    const blob = await put(nombre, file, { access: 'public' })
    return NextResponse.json({ ok: true, url: blob.url })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
