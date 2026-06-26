import type { Metadata } from 'next'
import { redis } from '@/lib/redis'
import Link from 'next/link'
import ImgFallback from '@/components/ImgFallback'

function slugToNombre(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, ' ')
}

function formatFecha(f: string) {
  if (!f) return ''
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  let d: number, m: number, y: number
  if (/^\d{4}-\d{2}-\d{2}/.test(f)) {
    const parts = f.slice(0, 10).split('-')
    y = parseInt(parts[0]); m = parseInt(parts[1]); d = parseInt(parts[2])
  } else if (f.includes('/')) {
    const parts = f.split('/')
    const a = parseInt(parts[0]), b = parseInt(parts[1]), c = parseInt(parts[2])
    if (a > 31) { y = a; m = b; d = c }
    else if (a > 12) { d = a; m = b; y = c }
    else { d = a; m = b; y = c }
  } else return f
  if (!meses[m - 1] || isNaN(d) || isNaN(y)) return f
  return `${d} ${meses[m - 1]} ${y}`
}

async function getPaquetesPorDestino(slug: string) {
  const paquetes = await redis.get<any[]>('paquetes_sync') || []
  const nombre = slugToNombre(slug).toLowerCase()
  return paquetes
    .filter(p =>
      (p.titulo || '').toLowerCase().includes(nombre) ||
      (p.destino || '').toLowerCase().includes(nombre) ||
      (p.pais || '').toLowerCase().includes(nombre)
    )
    .sort((a, b) => {
      const parse = (f: string) => {
        if (!f) return Infinity
        const parts = f.includes('-') ? f.slice(0, 10).split('-') : f.split('/')
        if (parts.length < 3) return Infinity
        const [x, y, z] = parts.map(Number)
        const date = x > 31 ? new Date(x, y - 1, z) : new Date(z, y - 1, x)
        return isNaN(date.getTime()) ? Infinity : date.getTime()
      }
      return parse(a.fecha) - parse(b.fecha)
    })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const nombre = slugToNombre(slug)
  const paquetes = await getPaquetesPorDestino(slug)
  const precios = paquetes.filter(p => p.precioUSD).map(p => parseFloat(p.precioUSD))
  const minPrecio = precios.length ? Math.min(...precios) : 0
  return {
    title: `Viajes a ${nombre} | Euforia Viajes`,
    description: `Paquetes de viaje a ${nombre}${minPrecio ? ` desde USD ${minPrecio.toLocaleString()}` : ''}. Salidas grupales con hotelería, desayuno y seguro incluidos. Reservá online con seña del 15%.`,
    openGraph: {
      title: `Viajes a ${nombre} ✈️ | Euforia Viajes`,
      description: `${paquetes.length} paquetes a ${nombre}. Salidas grupales desde Patagonia.`,
      type: 'website',
      siteName: 'Euforia Viajes',
    },
  }
}

export default async function DestinoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const nombre = slugToNombre(slug)
  const paquetes = await getPaquetesPorDestino(slug)
  const precios = paquetes.filter(p => p.precioUSD).map(p => parseFloat(p.precioUSD))
  const minPrecio = precios.length ? Math.min(...precios) : 0

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Banner */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }} className="text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm opacity-70 mb-3">
            <Link href="/" className="hover:underline">Inicio</Link>
            {' › '}
            <Link href="/salidas" className="hover:underline">Paquetes</Link>
            {' › '}{nombre}
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">✈️ Viajes a {nombre}</h1>
          <p className="opacity-80 text-sm">
            {paquetes.length} paquete{paquetes.length !== 1 ? 's' : ''} disponible{paquetes.length !== 1 ? 's' : ''}
            {minPrecio > 0 && ` · Desde USD ${minPrecio.toLocaleString()}`}
            {' · Salidas grupales desde Patagonia'}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Beneficios */}
        <div className="bg-white rounded-2xl shadow p-5 mb-8 flex flex-wrap gap-5 text-sm text-gray-600">
          {[
            ['🛏️', 'Hotelería incluida'],
            ['☕', 'Desayuno diario'],
            ['🛡️', 'Seguro de viaje'],
            ['👤', 'Coordinador de grupo'],
            ['💳', 'Hasta 18 cuotas'],
            ['✅', 'Reservá con 15% de seña'],
          ].map(([emoji, texto]) => (
            <div key={texto as string} className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <span className="font-semibold">{texto}</span>
            </div>
          ))}
        </div>

        {paquetes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold text-lg text-gray-600">No encontramos paquetes a {nombre} en este momento.</p>
            <p className="text-sm mt-2 mb-6">Consultanos por WhatsApp y armamos el viaje ideal para vos.</p>
            <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Me interesa viajar a ${nombre}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-block bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl text-sm">
              💬 Consultar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paquetes.map(p => (
              <Link key={p.id} href={`/paquete/${p.id}`}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col group">
                <div className="h-48 overflow-hidden relative">
                  <ImgFallback src={p.foto} alt={p.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {p.enPromocion && (
                    <span className="absolute top-2 left-2 text-white text-[10px] px-2 py-1 rounded-full font-bold"
                      style={{ backgroundColor: '#00AEEF' }}>🔥 PROMO</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {p.fecha && (
                    <div className="inline-flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1 rounded-lg mb-2 w-fit"
                      style={{ backgroundColor: '#00AEEF' }}>
                      📅 {formatFecha(p.fecha)}
                    </div>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#00AEEF' }}>
                    {p.categoria}{p.transporte ? ` · ${p.transporte}` : ''}
                  </span>
                  <h2 className="font-bold text-gray-800 text-sm mt-1 leading-snug line-clamp-2">{p.titulo}</h2>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    {p.noches && <span>🌙 {p.noches} noches</span>}
                    {p.origen && <span>📍 {p.origen}</span>}
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    {p.precioUSD
                      ? <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>USD {parseInt(p.precioUSD).toLocaleString()}</p>
                      : p.precioARS
                        ? <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')}</p>
                        : null}
                    <span className="text-white text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#00AEEF' }}>Ver →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl shadow p-6 text-center">
          <p className="font-bold text-gray-800 text-lg mb-2">¿No encontrás lo que buscás?</p>
          <p className="text-gray-500 text-sm mb-5">Armamos paquetes a medida para grupos o familias.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Me interesa viajar a ${nombre}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl text-sm">
              💬 Consultar por WhatsApp
            </a>
            <Link href="/salidas"
              className="text-white font-bold px-6 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#00AEEF' }}>
              Ver todos los paquetes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
