import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import paquetesData from '@/data/paquetes.json'

const fotosPorId: Record<string, string> = {}
for (const p of paquetesData as any[]) {
  if (p.id && p.foto) fotosPorId[p.id] = p.foto
}

const FOTOS_DESTINO: Record<string, string> = {
  'salta': 'https://images.unsplash.com/photo-1599094792743-7df3e8870800?w=800&q=80&fit=crop',
  'jujuy': 'https://images.unsplash.com/photo-1599094792743-7df3e8870800?w=800&q=80&fit=crop',
  'noroeste': 'https://images.unsplash.com/photo-1599094792743-7df3e8870800?w=800&q=80&fit=crop',
  'catamarca': 'https://images.unsplash.com/photo-1599094792743-7df3e8870800?w=800&q=80&fit=crop',
  'mendoza': 'https://images.unsplash.com/photo-1665254369274-4b459f3ce48c?w=800&q=80&fit=crop',
  'san rafael': 'https://images.unsplash.com/photo-1665254369274-4b459f3ce48c?w=800&q=80&fit=crop',
  'bariloche': 'https://images.unsplash.com/photo-1575393476573-6cdacd2e8c88?w=800&q=80&fit=crop',
  'san martin de los andes': 'https://images.unsplash.com/photo-1575393476573-6cdacd2e8c88?w=800&q=80&fit=crop',
  'tulipanes': 'https://images.unsplash.com/photo-1490750967868-88df5691cc10?w=800&q=80&fit=crop',
  'patagonia': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
  'ushuaia': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
  'calafate': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
  'los antiguos': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop',
  'trevelin': 'https://images.unsplash.com/photo-1490750967868-88df5691cc10?w=800&q=80&fit=crop',
  'cataratas': 'https://images.unsplash.com/photo-1538703012804-b74999aa11b9?w=800&q=80&fit=crop',
  'iguazu': 'https://images.unsplash.com/photo-1538703012804-b74999aa11b9?w=800&q=80&fit=crop',
  'iguazú': 'https://images.unsplash.com/photo-1538703012804-b74999aa11b9?w=800&q=80&fit=crop',
  'misiones': 'https://images.unsplash.com/photo-1538703012804-b74999aa11b9?w=800&q=80&fit=crop',
  'posadas': 'https://images.unsplash.com/photo-1538703012804-b74999aa11b9?w=800&q=80&fit=crop',
  'ballenas': 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80&fit=crop',
  'delfines': 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80&fit=crop',
  'avistaje': 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&q=80&fit=crop',
  'punta tombo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'velero': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'buceo': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'trelew': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'puerto madryn': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'peninsula': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'rawson': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop',
  'cordoba': 'https://images.unsplash.com/photo-1632885565031-bf3412fd486d?w=800&q=80&fit=crop',
  'carlos paz': 'https://images.unsplash.com/photo-1632885565031-bf3412fd486d?w=800&q=80&fit=crop',
  'villa carlos paz': 'https://images.unsplash.com/photo-1632885565031-bf3412fd486d?w=800&q=80&fit=crop',
  'merlo': 'https://images.unsplash.com/photo-1632885565031-bf3412fd486d?w=800&q=80&fit=crop',
  'jesus maria': 'https://images.unsplash.com/photo-1632885565031-bf3412fd486d?w=800&q=80&fit=crop',
  'formosa': 'https://images.unsplash.com/photo-1599094792743-7df3e8870800?w=800&q=80&fit=crop',
  'copahue': 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?w=800&q=80&fit=crop',
  'termas': 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?w=800&q=80&fit=crop',
  'federacion': 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?w=800&q=80&fit=crop',
  'rio hondo': 'https://images.unsplash.com/photo-1535530992830-e25d07cfa780?w=800&q=80&fit=crop',
  'mar del plata': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&fit=crop',
  'uruguay': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop',
  'sao pablo': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80&fit=crop',
  'buzios': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'camboriu': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'florianopolis': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'florianópolis': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'maragogi': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'salvador': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'joao pessoa': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'porto seguro': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'bombinhas': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'pipa': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'canasvieras': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'brasil': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'cancun': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'mexico': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'punta cana': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'caribe': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'aruba': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'jamaica': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'bayahide': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'la romana': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'san andres': 'https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80&fit=crop',
  'colombia': 'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?w=800&q=80&fit=crop',
  'cartagena': 'https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?w=800&q=80&fit=crop',
  'costa rica': 'https://images.unsplash.com/photo-1657092663605-a60d9bd2cfaa?w=800&q=80&fit=crop',
  'orlando': 'https://images.unsplash.com/photo-1693712942041-9136d5675ade?w=800&q=80&fit=crop',
  'miami': 'https://images.unsplash.com/photo-1693712942041-9136d5675ade?w=800&q=80&fit=crop',
  'estados unidos': 'https://images.unsplash.com/photo-1693712942041-9136d5675ade?w=800&q=80&fit=crop',
  'peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&fit=crop',
  'machu': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&fit=crop',
  'china': 'https://images.unsplash.com/photo-1608037521277-154cd1b89191?w=800&q=80&fit=crop',
  'japon': 'https://images.unsplash.com/photo-1608037521277-154cd1b89191?w=800&q=80&fit=crop',
  'japón': 'https://images.unsplash.com/photo-1608037521277-154cd1b89191?w=800&q=80&fit=crop',
  'europa': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80&fit=crop',
  'paris': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80&fit=crop',
  'portugal': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80&fit=crop',
  'turquia': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80&fit=crop',
  'turquía': 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80&fit=crop',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&fit=crop',
  'santiago': 'https://images.unsplash.com/photo-1575393476573-6cdacd2e8c88?w=800&q=80&fit=crop',
  'chile': 'https://images.unsplash.com/photo-1575393476573-6cdacd2e8c88?w=800&q=80&fit=crop',
  'puerto montt': 'https://images.unsplash.com/photo-1575393476573-6cdacd2e8c88?w=800&q=80&fit=crop',
  'crucero': 'https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5?w=800&q=80&fit=crop',
  'buceo': 'https://images.unsplash.com/photo-1622411945833-40319ff4e2ad?w=800&q=80&fit=crop',
  'san nicolas': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80&fit=crop',
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
  // Fallback genérico: playa/mar (no ventana de avión)
  return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop'
}

export async function GET() {
  try {
    const sync = await redis.get<any[]>('paquetes_sync')
    if (sync && sync.length > 0) {
      // Leer fotos custom: URLs normales (objeto bulk) + base64 individuales
      const [customFotos, fotosIds] = await Promise.all([
        redis.get<Record<string, string>>('custom_fotos').catch(() => ({})),
        redis.smembers('fotos_custom_ids').catch(() => []),
      ])
      const fotosBulk: Record<string, string> = customFotos || {}

      // Leer claves individuales (foto:{id}) para los que tienen base64
      let fotosBase64: Record<string, string> = {}
      if (fotosIds && fotosIds.length > 0) {
        const keys = (fotosIds as string[]).map((id: string) => `foto:${id}`)
        const vals = await redis.mget<string[]>(...keys).catch(() => [])
        ;(fotosIds as string[]).forEach((id: string, i: number) => {
          if (vals[i]) fotosBase64[id] = vals[i]
        })
      }

      const merged = sync.map(p => {
        // Solo usar foto subida manualmente desde el admin
        const fotoCustom = fotosBase64[p.id] || fotosBulk[p.id]
        return { ...p, foto: fotoCustom || '' }
      })
      return NextResponse.json(merged)
    }
  } catch {}
  return NextResponse.json(paquetesData)
}
