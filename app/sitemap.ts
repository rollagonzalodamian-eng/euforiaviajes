import type { MetadataRoute } from 'next'
import paquetesData from '@/data/paquetes.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://euforiaviajes.vercel.app'

  const paquetes = (paquetesData as any[]).map(p => ({
    url: `${base}/paquete/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/salidas`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/mi-cuenta`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ...paquetes,
  ]
}
