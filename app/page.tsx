'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Paquete } from '@/lib/types'
import paquetesData from '@/data/paquetes.json'
import Link from 'next/link'
import Resenas from '@/components/Resenas'

const DESTINOS_POPULARES = [
  { nombre: 'Termas', slug: 'termas', emoji: '♨️' },
  { nombre: 'Brasil', slug: 'brasil', emoji: '🇧🇷' },
  { nombre: 'Cancún', slug: 'canc%C3%BAn', emoji: '🌴' },
  { nombre: 'Bariloche', slug: 'bariloche', emoji: '🏔️' },
  { nombre: 'Europa', slug: 'europa', emoji: '🗺️' },
  { nombre: 'Mendoza', slug: 'mendoza', emoji: '🍷' },
  { nombre: 'Ushuaia', slug: 'ushuaia', emoji: '🧊' },
  { nombre: 'Salta', slug: 'salta', emoji: '🌄' },
]

export default function Home() {
  const [paquetes, setPaquetes] = useState<Paquete[]>(paquetesData as Paquete[])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [transporte, setTransporte] = useState('Todos')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const [moneda, setMoneda] = useState<'USD' | 'ARS'>('USD')
  const [tc, setTc] = useState(1400)

  useEffect(() => {
    fetch('/api/paquetes').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setPaquetes(data)
    }).catch(() => {})
    fetch('/api/admin/config').then(r => r.json()).then(cfg => {
      if (cfg?.tipoCambio) setTc(Number(cfg.tipoCambio))
    }).catch(() => {})
  }, [])

  const CATEGORIAS = ['Todos', ...Array.from(new Set(paquetes.map(p => p.categoria).filter(Boolean))).sort()]

  const filtrados = useMemo(() => {
    let r = paquetes.filter(p => {
      const texto = busqueda.toLowerCase()
      const coincide = !texto ||
        p.titulo.toLowerCase().includes(texto) ||
        p.destino.toLowerCase().includes(texto) ||
        p.pais.toLowerCase().includes(texto)
      const cat = categoria === 'Todos' || p.categoria === categoria
      const trans = transporte === 'Todos' || p.transporte === transporte
      return coincide && cat && trans
    })
    if (ordenPrecio) {
      r = [...r].sort((a, b) => {
        const pa = parseFloat(a.precioUSD) || parseFloat(a.precioARS) / tc || 0
        const pb = parseFloat(b.precioUSD) || parseFloat(b.precioARS) / tc || 0
        return ordenPrecio === 'asc' ? pa - pb : pb - pa
      })
    }
    return r
  }, [busqueda, categoria, transporte, ordenPrecio, paquetes, tc])

  const destacados = paquetes.filter(p => p.destacado || p.enPromocion).slice(0, 6)

  return (
    <div className="min-h-screen bg-[#f5f9fd]">

      {/* HERO */}
      <section className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=60&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur-sm">
            ✈️ Más de 327 paquetes disponibles
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
            Viajá con Euforia.<br />
            <span className="opacity-90">Tu próxima aventura te espera.</span>
          </h1>
          <p className="opacity-80 mb-10 text-base md:text-lg max-w-xl mx-auto">
            Paquetes nacionales e internacionales con salidas desde la Patagonia
          </p>

          {/* Buscador */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-2xl">
              <input
                type="text"
                placeholder="🔍 ¿A dónde querés viajar?"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-800 text-sm outline-none rounded-xl"
              />
              <button
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition"
                style={{ backgroundColor: '#00AEEF' }}
                onClick={() => document.getElementById('paquetes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Buscar →
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10 text-center">
            {[['327+', 'paquetes'], ['15+', 'años de experiencia'], ['5000+', 'viajeros']].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black">{n}</p>
                <p className="text-xs opacity-70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* DESTINOS POPULARES */}
        {!busqueda && (
          <section className="mb-10">
            <h2 className="text-xl font-black text-gray-800 mb-4">🌍 Explorá por destino</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {DESTINOS_POPULARES.map(d => (
                <button key={d.slug} onClick={() => setBusqueda(d.nombre)}
                  className="bg-white rounded-2xl shadow hover:shadow-md transition p-3 text-center group cursor-pointer border border-transparent hover:border-[#00AEEF]">
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <p className="text-[11px] font-semibold text-gray-700 leading-tight group-hover:text-[#00AEEF]">{d.nombre}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* DESTACADOS */}
        {!busqueda && destacados.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-800">🔥 Paquetes destacados</h2>
              <Link href="/salidas" className="text-sm font-semibold" style={{ color: '#00AEEF' }}>Ver todos →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destacados.map(p => (
                <Link key={p.id} href={`/paquete/${p.id}`}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden group flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {p.enPromocion && (
                      <span className="absolute top-3 left-3 bg-[#00AEEF] text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow">🔥 PROMO</span>
                    )}
                    {p.noches && (
                      <span className="absolute bottom-3 left-3 text-white text-xs font-semibold">🌙 {p.noches} noches</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#00AEEF' }}>
                      {p.categoria}{p.transporte ? ` · ${p.transporte}` : ''}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm mt-1 leading-snug line-clamp-2">{p.titulo}</h3>
                    {p.origen && <p className="text-xs text-gray-400 mt-1">📍 Desde {p.origen}</p>}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      {p.precioUSD ? (
                        <p className="font-extrabold text-xl" style={{ color: '#00AEEF' }}>USD {parseFloat(p.precioUSD).toLocaleString()}</p>
                      ) : p.precioARS ? (
                        <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')}</p>
                      ) : <p className="text-sm text-gray-400">Consultá precio</p>}
                      <span className="text-xs text-white font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#00AEEF' }}>Ver →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* POR QUÉ ELEGIRNOS */}
        {!busqueda && (
          <section className="mb-12 bg-white rounded-3xl shadow p-6 md:p-10">
            <h2 className="text-xl font-black text-gray-800 text-center mb-8">¿Por qué viajar con Euforia?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                ['🛡️', 'Viaje asegurado', 'Respaldo y atención en todo momento'],
                ['💳', 'Cuotas sin interés', 'Financiación accesible para todos'],
                ['🎯', 'Todo incluido', 'Sin sorpresas, precio final garantizado'],
                ['🤝', 'Asesoramiento', 'Te acompañamos desde la consulta hasta el regreso'],
              ].map(([emoji, titulo, desc]) => (
                <div key={titulo}>
                  <div className="text-4xl mb-3">{emoji}</div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{titulo}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILTROS */}
        <section id="paquetes" className="mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">🗂️ Todos los paquetes</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500 font-semibold mr-1">Filtrar:</span>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border transition"
                style={categoria === c
                  ? { backgroundColor: '#00AEEF', color: 'white', borderColor: '#00AEEF' }
                  : { backgroundColor: 'white', color: '#555', borderColor: '#ddd' }}>
                {c}
              </button>
            ))}
            <div className="ml-auto flex gap-2 flex-wrap">
              {['Todos', 'Aéreo', 'Bus'].map(t => (
                <button key={t} onClick={() => setTransporte(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border transition"
                  style={transporte === t
                    ? { backgroundColor: '#0090C5', color: 'white', borderColor: '#0090C5' }
                    : { backgroundColor: 'white', color: '#555', borderColor: '#ddd' }}>
                  {t === 'Aéreo' ? '✈️ ' : t === 'Bus' ? '🚌 ' : ''}{t}
                </button>
              ))}
              <select value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 bg-white text-gray-600 outline-none">
                <option value="">Precio</option>
                <option value="asc">↑ Menor precio</option>
                <option value="desc">↓ Mayor precio</option>
              </select>
              <button onClick={() => setMoneda(m => m === 'USD' ? 'ARS' : 'USD')}
                className="px-3 py-1.5 rounded-full text-xs font-bold border transition"
                style={{ backgroundColor: '#f0fafe', color: '#00AEEF', borderColor: '#00AEEF' }}>
                {moneda === 'USD' ? '💵 USD' : '🇦🇷 ARS'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtrados.length} paquete{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
        </section>

        {/* GRILLA */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(p => (
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
                <h3 className="font-bold text-gray-800 text-sm mt-1 leading-snug line-clamp-2">{p.titulo}</h3>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2 flex-1">{p.descripcion}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    {p.precioUSD ? (
                      moneda === 'ARS'
                        ? <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>$ {Math.round(parseFloat(p.precioUSD) * tc).toLocaleString('es-AR')}</p>
                        : <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>USD {parseFloat(p.precioUSD).toLocaleString()}</p>
                    ) : p.precioARS ? (
                      moneda === 'USD'
                        ? <p className="font-extrabold text-base" style={{ color: '#00AEEF' }}>USD {Math.round(parseInt(p.precioARS) / tc).toLocaleString()}</p>
                        : <p className="font-extrabold text-base" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')}</p>
                    ) : null}
                    {p.noches && <p className="text-xs text-gray-400">{p.noches} noches · desde {p.origen}</p>}
                  </div>
                  <span className="text-white text-xs font-bold px-3 py-1.5 rounded-xl" style={{ backgroundColor: '#00AEEF' }}>
                    Ver más →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {filtrados.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No encontramos paquetes para esa búsqueda.</p>
            <button onClick={() => { setBusqueda(''); setCategoria('Todos'); setTransporte('Todos') }}
              className="mt-4 underline text-sm" style={{ color: '#00AEEF' }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* RESEÑAS */}
      {!busqueda && <Resenas />}

      {/* CTA FINAL */}
      {!busqueda && (
        <section className="text-white text-center py-14 px-4" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
          <h2 className="text-2xl md:text-3xl font-black mb-3">¿Listo para tu próximo viaje?</h2>
          <p className="opacity-80 mb-8 text-sm">Hablá con nuestro equipo y armamos el paquete ideal para vos</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#1ebe57] transition">
              💬 Escribir por WhatsApp
            </a>
            <Link href="/arma-tu-viaje"
              className="inline-flex items-center gap-2 bg-white text-[#00AEEF] font-bold px-8 py-3 rounded-xl text-sm hover:bg-blue-50 transition">
              ✈️ Armá tu viaje
            </Link>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        <p className="font-bold text-base mb-1">✈️ Euforia Viajes</p>
        <p className="text-gray-400 text-xs">viajaconeuforia.com · adm@viajaconeuforia.com</p>
        <p className="text-gray-600 text-xs mt-3">© 2026 Euforia Viajes. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
