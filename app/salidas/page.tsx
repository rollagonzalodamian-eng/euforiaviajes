'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { Paquete } from '@/lib/types'
import ImgFallback from '@/components/ImgFallback'

function formatFecha(f: string) {
  if (!f) return ''
  const [d, m, y] = f.split('/')
  const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} ${meses[parseInt(m)]} ${y}`
}

export default function SalidasPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [cargando, setCargando] = useState(true)
  const [categoria, setCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch('/api/paquetes').then(r => r.json()).then((data: Paquete[]) => {
      setPaquetes(data)
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [])

  const categorias = useMemo(() => ['Todas', ...Array.from(new Set(paquetes.map(p => p.categoria).filter(Boolean))).sort()], [paquetes])

  const filtrados = useMemo(() => paquetes.filter(p => {
    const cat = categoria === 'Todas' || p.categoria === categoria
    const texto = busqueda.toLowerCase()
    const match = !texto || p.titulo.toLowerCase().includes(texto) || p.destino.toLowerCase().includes(texto)
    return cat && match
  }), [categoria, busqueda, paquetes])

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0090C5 100%)' }} className="text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black mb-1">🗓️ Salidas Grupales Euforia</h1>
          <p className="opacity-80 text-sm mb-6">Viajá acompañado con coordinador y todo incluido</p>
          <div className="flex gap-3 flex-wrap">
            <input type="text" placeholder="Buscar destino..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="px-4 py-2 rounded-xl text-gray-800 text-sm outline-none w-64 shadow" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categorias.map(c => (
            <button key={c} onClick={() => setCategoria(c)}
              className="px-3 py-1.5 rounded-full text-xs font-bold border transition"
              style={categoria === c
                ? { backgroundColor: '#00AEEF', color: 'white', borderColor: '#00AEEF' }
                : { backgroundColor: 'white', color: '#555', borderColor: '#ddd' }}>
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-4">{filtrados.length} salidas disponibles</p>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrados.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <ImgFallback src={p.foto} alt={p.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  {p.enPromocion && (
                    <span className="absolute top-2 left-2 text-white text-[10px] px-2 py-1 rounded-full font-bold"
                      style={{ backgroundColor: '#00AEEF' }}>🔥 PROMO</span>
                  )}
                  {p.categoria && (
                    <span className="absolute top-2 right-2 bg-white/90 text-gray-700 text-[10px] px-2 py-1 rounded-full font-bold">
                      {p.categoria}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{p.titulo}</h3>

                  <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                    {p.fecha && <span>📅 {formatFecha(p.fecha)}</span>}
                    {p.noches && <span>🌙 {p.noches} noches</span>}
                    {p.origen && <span>📍 Desde {p.origen}</span>}
                    {p.transporte && <span>{p.transporte === 'Aéreo' ? '✈️' : '🚌'} {p.transporte}</span>}
                  </div>

                  <div className="mt-3 flex-1">
                    {p.precioUSD
                      ? <p className="font-extrabold text-xl" style={{ color: '#00AEEF' }}>USD {parseInt(p.precioUSD).toLocaleString()}</p>
                      : p.precioARS
                        ? <p className="font-extrabold text-xl" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')}</p>
                        : null}
                    {p.precioUSD && (
                      <p className="text-xs text-gray-400 mt-0.5">Hasta 12 cuotas · Consultá financiación</p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/paquete/${p.id}`}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition"
                      style={{ backgroundColor: '#00AEEF' }}>
                      Ver detalle
                    </Link>
                    <a href={`https://wa.me/542804321400?text=Hola%2C%20me%20interesa%20el%20paquete%3A%20${encodeURIComponent(p.titulo)}`}
                      target="_blank"
                      className="px-3 py-2.5 rounded-xl text-sm font-bold bg-[#25D366] text-white flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-white mt-12 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
