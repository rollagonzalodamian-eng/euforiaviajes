'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Paquete } from '@/lib/types'
import { emojiDestino } from '@/lib/paquetes'
import paquetesData from '@/data/paquetes.json'
import Link from 'next/link'
import Resenas from '@/components/Resenas'

const DESTINOS_POPULARES = [
  { nombre: 'Termas de Río Hondo', slug: 'termas-de-r%C3%ADo-hondo', emoji: '♨️' },
  { nombre: 'Brasil', slug: 'brasil', emoji: '🇧🇷' },
  { nombre: 'Cancún', slug: 'canc%C3%BAn', emoji: '🌴' },
  { nombre: 'Bariloche', slug: 'bariloche', emoji: '🏔️' },
  { nombre: 'Europa', slug: 'europa', emoji: '🗺️' },
  { nombre: 'Mendoza', slug: 'mendoza', emoji: '🍷' },
]

export default function Home() {
  const [paquetes, setPaquetes] = useState<Paquete[]>(paquetesData as Paquete[])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [transporte, setTransporte] = useState('Todos')
  const [ordenPrecio, setOrdenPrecio] = useState('')
  const [moneda, setMoneda] = useState<'USD' | 'ARS'>('USD')

  useEffect(() => {
    fetch('/api/paquetes').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setPaquetes(data)
    }).catch(() => {})
  }, [])

  const CATEGORIAS = ['Todos', ...Array.from(new Set(paquetes.map(p => p.categoria).filter(Boolean))).sort()]
  const TC = 1050


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
        const pa = parseFloat(a.precioUSD) || parseFloat(a.precioARS) / TC || 0
        const pb = parseFloat(b.precioUSD) || parseFloat(b.precioARS) / TC || 0
        return ordenPrecio === 'asc' ? pa - pb : pb - pa
      })
    }
    return r
  }, [busqueda, categoria, transporte, ordenPrecio])

  const destacados = paquetes.filter(p => p.destacado || p.enPromocion).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0090C5 100%)' }} className="text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-2">¿A dónde querés viajar?</h2>
          <p className="opacity-80 mb-8 text-sm">Paquetes nacionales e internacionales con todo incluido</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Buscar destino, país o paquete..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm outline-none shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* DESTINOS POPULARES */}
        {!busqueda && (
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🌍 Explorá por destino</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {DESTINOS_POPULARES.map(d => (
                <Link key={d.slug} href={`/destino/${d.slug}`}
                  className="bg-white rounded-xl shadow hover:shadow-md transition p-3 text-center group">
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <p className="text-xs font-semibold text-gray-700 leading-tight group-hover:text-[#00AEEF]">{d.nombre}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* DESTACADOS */}
        {!busqueda && destacados.length > 0 && (
          <section className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⭐ Paquetes destacados</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {destacados.map(p => (
                <Link key={p.id} href={`/paquete/${p.id}`}
                  className="bg-white rounded-2xl shadow hover:shadow-md transition overflow-hidden group">
                  <div className="h-24 overflow-hidden">
                    <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">{p.titulo}</p>
                    {p.precioUSD && (
                      <p className="font-extrabold text-sm mt-1" style={{ color: '#00AEEF' }}>
                        USD {parseFloat(p.precioUSD).toLocaleString()}
                      </p>
                    )}
                    {p.enPromocion && (
                      <span className="text-white text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#00AEEF' }}>PROMO</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FILTROS */}
        <section id="paquetes" className="mb-6">
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

        {/* GRILLA DE PAQUETES */}
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
                <p className="text-gray-500 text-xs mt-2 line-clamp-3 flex-1">{p.descripcion}</p>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    {p.precioUSD ? (
                      moneda === 'ARS'
                        ? <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>$ {Math.round(parseFloat(p.precioUSD) * TC).toLocaleString('es-AR')}</p>
                        : <p className="font-extrabold text-lg" style={{ color: '#00AEEF' }}>USD {parseFloat(p.precioUSD).toLocaleString()}</p>
                    ) : p.precioARS ? (
                      moneda === 'USD'
                        ? <p className="font-extrabold text-base" style={{ color: '#00AEEF' }}>USD {Math.round(parseInt(p.precioARS) / TC).toLocaleString()}</p>
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

      {/* FOOTER */}
      <footer className="text-white mt-12 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes</p>
        <p className="opacity-70 text-xs mt-1">viajaconeuforia.com · adm@viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
