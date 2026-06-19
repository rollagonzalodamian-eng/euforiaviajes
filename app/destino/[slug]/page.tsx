import { getPaquetes, emojiDestino } from '@/lib/paquetes'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function slugToDestino(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, ' ')
}

function destinoToSlug(destino: string) {
  return encodeURIComponent(destino.toLowerCase().replace(/\s+/g, '-'))
}

export async function generateStaticParams() {
  const paquetes = getPaquetes()
  const destinos = [...new Set(paquetes.map(p => p.destino).filter(Boolean))]
  return destinos.map(d => ({ slug: destinoToSlug(d) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const destino = slugToDestino(slug)
  const paquetes = getPaquetes().filter(p => p.destino?.toLowerCase() === destino.toLowerCase())
  if (!paquetes.length) return { title: 'Destino no encontrado' }
  const desde = paquetes.filter(p => p.precioUSD).map(p => parseFloat(p.precioUSD))
  const minPrecio = desde.length ? Math.min(...desde) : 0
  return {
    title: `Viajes a ${destino} | Euforia Viajes`,
    description: `Paquetes de viaje a ${destino}${minPrecio ? ` desde USD ${minPrecio.toLocaleString()}` : ''}. ${paquetes.length} opciones disponibles. Reservá online con seña del 15%.`,
    openGraph: {
      title: `Viajes a ${destino} - Euforia Viajes`,
      description: `${paquetes.length} paquetes a ${destino}. Reservá online con seña del 15%.`,
    }
  }
}

export default async function DestinoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const destino = slugToDestino(slug)
  const todos = getPaquetes()
  const paquetes = todos.filter(p => p.destino?.toLowerCase() === destino.toLowerCase())

  if (!paquetes.length) notFound()

  const emoji = emojiDestino(destino, paquetes[0]?.pais || '')
  const precios = paquetes.filter(p => p.precioUSD).map(p => parseFloat(p.precioUSD))
  const minPrecio = precios.length ? Math.min(...precios) : 0

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0090C5 100%)' }} className="text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/70 text-sm hover:text-white mb-4 inline-block">← Volver</Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{emoji}</span>
            <h1 className="text-3xl md:text-4xl font-black">Viajes a {destino}</h1>
          </div>
          <p className="opacity-80 text-sm">
            {paquetes.length} paquete{paquetes.length > 1 ? 's' : ''} disponible{paquetes.length > 1 ? 's' : ''}
            {minPrecio > 0 && ` · Desde USD ${minPrecio.toLocaleString()}`}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info destino */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span>{paquetes[0]?.pais || destino}</span>
          </div>
          {paquetes[0]?.transporte && (
            <div className="flex items-center gap-2">
              <span>{paquetes[0].transporte === 'Aéreo' ? '✈️' : '🚌'}</span>
              <span>{paquetes[0].transporte}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span>{paquetes.length} paquetes</span>
          </div>
          {minPrecio > 0 && (
            <div className="flex items-center gap-2 font-bold" style={{ color: '#00AEEF' }}>
              <span>💵</span>
              <span>Desde USD {minPrecio.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Paquetes */}
        <div className="grid sm:grid-cols-2 gap-4">
          {paquetes.map(p => (
            <Link key={p.id} href={`/paquete/${p.id}`}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition group flex flex-col overflow-hidden">
              <div className="h-44 overflow-hidden relative">
                <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {p.enPromocion && (
                  <span className="absolute top-2 right-2 text-white text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: '#00AEEF' }}>PROMO</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#00AEEF' }}>
                  {p.categoria}{p.transporte ? ` · ${p.transporte}` : ''}
                </span>
                <h2 className="font-bold text-gray-800 text-sm mt-1 leading-snug line-clamp-2">{p.titulo}</h2>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2 flex-1">{p.descripcion}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    {p.precioUSD
                      ? <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>USD {parseFloat(p.precioUSD).toLocaleString()}</p>
                      : p.precioARS
                        ? <p className="font-extrabold text-base" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')}</p>
                        : null}
                    {p.noches && <p className="text-xs text-gray-400">{p.noches} noches</p>}
                  </div>
                  <span className="text-white text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#00AEEF' }}>
                    Ver →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA WhatsApp */}
        <div className="mt-8 bg-white rounded-2xl shadow p-6 text-center">
          <p className="font-bold text-gray-800 mb-1">¿No encontrás lo que buscás?</p>
          <p className="text-gray-500 text-sm mb-4">Armamos el viaje a medida para vos</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Me interesa viajar a ${destino}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-green-500 text-white font-bold px-6 py-3 rounded-xl text-sm">
              Consultar por WhatsApp
            </a>
            <Link href="/arma-tu-viaje"
              className="text-white font-bold px-6 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#00AEEF' }}>
              Armá tu viaje
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
