import type { Metadata } from 'next'
import { getPaquete } from '@/lib/paquetes'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = getPaquete(id)
  if (!p) return { title: 'Paquete no encontrado - Euforia Viajes' }

  const precio = p.precioUSD
    ? `Desde USD ${parseFloat(p.precioUSD).toLocaleString()}`
    : p.precioARS
      ? `Desde $ ${parseInt(p.precioARS).toLocaleString('es-AR')}`
      : ''

  const description = `${p.titulo} — ${precio}. ${p.descripcion?.slice(0, 140) || ''}. Reservá online con Euforia Viajes.`

  return {
    title: `${p.titulo} | Euforia Viajes`,
    description,
    openGraph: {
      title: p.titulo,
      description,
      url: `https://euforiaviajes.vercel.app/paquete/${id}`,
      siteName: 'Euforia Viajes',
      locale: 'es_AR',
      type: 'website',
    },
  }
}

export default function PaqueteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
