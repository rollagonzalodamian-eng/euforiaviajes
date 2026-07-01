import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Fotos Unsplash por destino (paisaje, hotel, gastronomía, actividad)
const FOTOS_DESTINO: Record<string, string[]> = {
  cancun: [
    'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=900&q=80&fit=crop',
  ],
  brasil: [
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1544989164-31c3ebebbe97?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1602867741746-6df80f40b3f6?w=900&q=80&fit=crop',
  ],
  bariloche: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1601541894029-f9a4d3e4c3f9?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571408599890-7b09d3ab57fd?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=900&q=80&fit=crop',
  ],
  ushuaia: [
    'https://images.unsplash.com/photo-1531761535209-83f6d4ee4fe6?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1580289143078-6b5b1571b9cf?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=900&q=80&fit=crop',
  ],
  mendoza: [
    'https://images.unsplash.com/photo-1585208798174-6cedd4454e5d?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=900&q=80&fit=crop',
  ],
  salta: [
    'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1565802704074-f97fa6d0d6ac?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80&fit=crop',
  ],
  cataratas: [
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1563557162083-74db2dbdc57a?w=900&q=80&fit=crop',
  ],
  termas: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1620733723572-11c53fc73a69?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&q=80&fit=crop',
  ],
  europa: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=900&q=80&fit=crop',
  ],
  caribe: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=900&q=80&fit=crop',
  ],
  patagonia: [
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=900&q=80&fit=crop',
  ],
}

function getFotosFallback(paquete: any): string[] {
  const texto = `${paquete.titulo} ${paquete.destino} ${paquete.pais}`.toLowerCase()
  for (const [clave, fotos] of Object.entries(FOTOS_DESTINO)) {
    if (texto.includes(clave)) return fotos
  }
  // fallback genérico
  return [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80&fit=crop',
  ]
}

function normalizarTitulo(titulo: string): string {
  return titulo.toLowerCase().trim().replace(/[^a-z0-9áéíóúñ]/g, '_').slice(0, 80)
}

async function getPaqueteTitulo(id: string): Promise<string> {
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync')
    return paquetes?.find(p => p.id === id)?.titulo || ''
  } catch { return '' }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  const pass = req.nextUrl.searchParams.get('pass')
  const listar = req.nextUrl.searchParams.get('listar')

  // Diagnóstico: listar todas las claves galeria
  if (listar && pass === process.env.ADMIN_PASS) {
    try {
      const keys = await redis.keys('galeria:*')
      const result: Record<string, number> = {}
      for (const k of keys) {
        const fotos = await redis.get<string[]>(k)
        result[k] = fotos?.length || 0
      }
      return NextResponse.json({ total: keys.length, claves: result })
    } catch (e: any) {
      return NextResponse.json({ error: e.message })
    }
  }

  if (!id) return NextResponse.json([])
  try {
    // Primero buscar por ID
    const fotosPorId = await redis.get<string[]>(`galeria:${id}`)
    if (fotosPorId && fotosPorId.length > 0) return NextResponse.json(fotosPorId)

    // Fallback: buscar por título normalizado (sobrevive cambios de Row ID)
    const titulo = await getPaqueteTitulo(id)
    if (titulo) {
      const fotosPorTitulo = await redis.get<string[]>(`galeria_t:${normalizarTitulo(titulo)}`)
      if (fotosPorTitulo && fotosPorTitulo.length > 0) return NextResponse.json(fotosPorTitulo)
    }
    return NextResponse.json([])
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { pass, id, fotos } = await req.json()
  if (pass !== process.env.ADMIN_PASS) return NextResponse.json({ ok: false }, { status: 401 })
  try {
    // Guardar por ID
    await redis.set(`galeria:${id}`, fotos)
    // También guardar por título normalizado como backup
    const titulo = await getPaqueteTitulo(id)
    if (titulo) {
      await redis.set(`galeria_t:${normalizarTitulo(titulo)}`, fotos)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
