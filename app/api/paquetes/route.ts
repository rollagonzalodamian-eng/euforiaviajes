import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import paquetesData from '@/data/paquetes.json'

const fotosPorId: Record<string, string> = {}
for (const p of paquetesData as any[]) {
  if (p.id && p.foto) fotosPorId[p.id] = p.foto
}

const FOTOS_DESTINO: Record<string, string> = {
  'salta': 'https://images.unsplash.com/photo-1601011625337-c5bf8ba7cff7?w=800&q=80&fit=crop',
  'jujuy': 'https://images.unsplash.com/photo-1589462437902-d4a6c7366c55?w=800&q=80&fit=crop',
  'noroeste': 'https://images.unsplash.com/photo-1589462437902-d4a6c7366c55?w=800&q=80&fit=crop',
  'mendoza': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&fit=crop',
  'san rafael': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&fit=crop',
  'bariloche': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'patagonia': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'ushuaia': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80&fit=crop',
  'calafate': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80&fit=crop',
  'san martin de los andes': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'los antiguos': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'cataratas': 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80&fit=crop',
  'iguazu': 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80&fit=crop',
  'iguazú': 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80&fit=crop',
  'misiones': 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80&fit=crop',
  'posadas': 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800&q=80&fit=crop',
  'cordoba': 'https://images.unsplash.com/photo-1601040893775-4d3f9dfc53f7?w=800&q=80&fit=crop',
  'carlos paz': 'https://images.unsplash.com/photo-1601040893775-4d3f9dfc53f7?w=800&q=80&fit=crop',
  'villa carlos paz': 'https://images.unsplash.com/photo-1601040893775-4d3f9dfc53f7?w=800&q=80&fit=crop',
  'merlo': 'https://images.unsplash.com/photo-1601040893775-4d3f9dfc53f7?w=800&q=80&fit=crop',
  'catamarca': 'https://images.unsplash.com/photo-1589462437902-d4a6c7366c55?w=800&q=80&fit=crop',
  'formosa': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&fit=crop',
  'copahue': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'termas': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&fit=crop',
  'federacion': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&fit=crop',
  'mar del plata': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&fit=crop',
  'uruguay': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'trelew': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&fit=crop',
  'puerto madryn': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&fit=crop',
  'peninsula': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&fit=crop',
  'rawson': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&fit=crop',
  'trevelin': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&fit=crop',
  'brasil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop',
  'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop',
  'buzios': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'camboriu': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'florianopolis': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'florianópolis': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'maragogi': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'salvador': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'joao pessoa': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'porto seguro': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'bombinhas': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'pipa': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'sao pablo': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop',
  'canasvieras': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'cancun': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'mexico': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'punta cana': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'caribe': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'aruba': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'jamaica': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'bayahide': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'la romana': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'san andres': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80&fit=crop',
  'colombia': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80&fit=crop',
  'cartagena': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80&fit=crop',
  'costa rica': 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800&q=80&fit=crop',
  'orlando': 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800&q=80&fit=crop',
  'miami': 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800&q=80&fit=crop',
  'estados unidos': 'https://images.unsplash.com/photo-1575408264798-b50b252663e6?w=800&q=80&fit=crop',
  'peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&fit=crop',
  'machu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&fit=crop',
  'china': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80&fit=crop',
  'japon': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80&fit=crop',
  'japón': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80&fit=crop',
  'europa': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&fit=crop',
  'paris': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&fit=crop',
  'portugal': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&fit=crop',
  'turquia': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80&fit=crop',
  'turquía': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80&fit=crop',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop',
  'santiago': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'chile': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'puerto montt': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'crucero': 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&q=80&fit=crop',
  'buceo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'san nicolas': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
  'jesus maria': 'https://images.unsplash.com/photo-1601040893775-4d3f9dfc53f7?w=800&q=80&fit=crop',
}

function getFotoFallback(p: any): string {
  const texto = ((p.destino || '') + ' ' + (p.titulo || '') + ' ' + (p.categoria || '')).toLowerCase()
  for (const [key, url] of Object.entries(FOTOS_DESTINO)) {
    if (texto.includes(key)) return url
  }
  // fallback genérico por categoría
  if (texto.includes('nacional') || texto.includes('argentin')) {
    return 'https://images.unsplash.com/photo-1589462437902-d4a6c7366c55?w=800&q=80&fit=crop'
  }
  return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&fit=crop'
}

export async function GET() {
  try {
    const sync = await redis.get<any[]>('paquetes_sync')
    if (sync && sync.length > 0) {
      const merged = sync.map(p => ({
        ...p,
        foto: p.foto || fotosPorId[p.id] || getFotoFallback(p),
      }))
      return NextResponse.json(merged)
    }
  } catch {}
  return NextResponse.json(paquetesData)
}
