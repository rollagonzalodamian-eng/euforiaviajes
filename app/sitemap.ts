import { redis } from '@/lib/redis'

const BASE_URL = 'https://app.viajaconeuforia.com'

export default async function sitemap() {
  const estaticas = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE_URL}/salidas`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/arma-tu-viaje`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE_URL}/nosotros`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/contacto`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE_URL}/terminos`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
  ]

  let dinamicas: any[] = []
  try {
    const paquetes = await redis.get<any[]>('paquetes_sync')
    if (Array.isArray(paquetes)) {
      dinamicas = paquetes.map(p => ({
        url: `${BASE_URL}/paquete/${p.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {}

  return [...estaticas, ...dinamicas]
}
