import type { Metadata } from 'next'
import PaquetePageClient from './PaquetePageClient'
import paquetesData from '@/data/paquetes.json'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = (paquetesData as any[]).find(pkg => pkg.id === id)
  if (!p) return { title: 'Paquete | Euforia Viajes' }
  const desc = p.descripcion?.replace(/[^\w\s,.!?áéíóúÁÉÍÓÚñÑ]/g, ' ').slice(0, 160) || ''
  return {
    title: `${p.titulo} | Euforia Viajes`,
    description: desc,
    openGraph: {
      title: p.titulo,
      description: desc,
      images: p.foto ? [{ url: p.foto }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: p.titulo,
      description: desc,
      images: p.foto ? [p.foto] : [],
    },
  }
}

export default function PaquetePage({ params }: { params: Promise<{ id: string }> }) {
  return <PaquetePageClient params={params} />
}
