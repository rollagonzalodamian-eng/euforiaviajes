import type { Metadata } from 'next'
import PaquetePageClient from './PaquetePageClient'
import { redis } from '@/lib/redis'

async function getPaqueteFromRedis(id: string) {
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync')
    return paquetes?.find(p => p.id === id) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await getPaqueteFromRedis(id)
  if (!p) return { title: 'Paquete | Euforia Viajes' }

  const desc = p.descripcion
    ? p.descripcion.replace(/[^\w\s,.!?áéíóúÁÉÍÓÚñÑ]/g, ' ').slice(0, 160)
    : `Viajá con Euforia Viajes. ${p.categoria || 'Paquete'} desde ${p.origen || 'Patagonia'}.`

  const precio = p.precioUSD
    ? `Desde USD ${parseInt(p.precioUSD).toLocaleString()} · `
    : p.precioARS
      ? `Desde $ ${parseInt(p.precioARS).toLocaleString('es-AR')} · `
      : ''

  const imgUrl = p.foto
    ? `https://app.viajaconeuforia.com/api/img?url=${encodeURIComponent(p.foto)}`
    : 'https://app.viajaconeuforia.com/icon.png'

  return {
    title: `${p.titulo} | Euforia Viajes`,
    description: `${precio}${desc}`,
    openGraph: {
      title: `${p.titulo} ✈️`,
      description: `${precio}${desc}`,
      images: [{ url: imgUrl, width: 1200, height: 630 }],
      type: 'website',
      siteName: 'Euforia Viajes',
      locale: 'es_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.titulo} ✈️`,
      description: `${precio}${desc}`,
      images: [imgUrl],
    },
  }
}

export default function PaquetePage({ params }: { params: Promise<{ id: string }> }) {
  return <PaquetePageClient params={params} />
}
