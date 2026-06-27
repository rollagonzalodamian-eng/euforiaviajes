'use client'

import { useEffect, useState } from 'react'

interface Paquete {
  id: string
  titulo: string
  categoria: string
  destino: string
  origen: string
  fecha: string
  noches: string
  precioUSD: string
  promoUSD: string
  precioARS: string
  promoARS: string
  transporte: string
  servicio: string
  cupos: string
  enPromocion: boolean
  destacado: boolean
  descripcion: string
}

export default function SalidasPDF() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [loading, setLoading] = useState(true)
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    fetch('/api/paquetes')
      .then(r => r.json())
      .then(data => {
        setPaquetes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const now = new Date()
    setFecha(now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }))
  }, [])

  const categorias = Array.from(new Set(paquetes.map(p => p.categoria).filter(Boolean))).sort()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Cargando paquetes...</p>
    </div>
  )

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
        @page { margin: 1.5cm; size: A4; }
        body { font-family: Arial, sans-serif; }
      `}</style>

      {/* Botón imprimir */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700"
        >
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 text-gray-800">

        {/* Portada */}
        <div className="text-center mb-10 pb-8 border-b-4 border-blue-500">
          <div className="text-5xl mb-3">✈️</div>
          <h1 className="text-4xl font-black text-blue-600 mb-1">EUFORIA VIAJES</h1>
          <p className="text-gray-500 text-sm mb-2">Fontana 243, Trelew, Patagonia · Leg. LADEVI 16816</p>
          <h2 className="text-2xl font-bold text-gray-700 mt-4">Catálogo de Salidas 2026</h2>
          <p className="text-gray-400 text-sm mt-1">Actualizado al {fecha} · {paquetes.length} paquetes disponibles</p>
          <p className="text-blue-500 text-sm mt-2 font-medium">🌐 app.viajaconeuforia.com</p>
        </div>

        {/* Índice de categorías */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-700 mb-3">Categorías disponibles:</h3>
          <div className="grid grid-cols-2 gap-1">
            {categorias.map(cat => (
              <div key={cat} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-400 rounded-full inline-block" />
                {cat} ({paquetes.filter(p => p.categoria === cat).length} paquetes)
              </div>
            ))}
          </div>
        </div>

        {/* Paquetes por categoría */}
        {categorias.map((cat, catIdx) => {
          const psCat = paquetes.filter(p => p.categoria === cat)
          return (
            <div key={cat} className={catIdx > 0 ? 'page-break' : ''}>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 mt-6">
                <h2 className="text-lg font-black">{cat}</h2>
                <p className="text-blue-200 text-xs">{psCat.length} paquetes disponibles</p>
              </div>

              <table className="w-full text-sm border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                    <th className="text-left px-3 py-2 border border-gray-200">Destino / Paquete</th>
                    <th className="text-left px-3 py-2 border border-gray-200">Fecha</th>
                    <th className="text-left px-3 py-2 border border-gray-200">Noches</th>
                    <th className="text-left px-3 py-2 border border-gray-200">Transporte</th>
                    <th className="text-right px-3 py-2 border border-gray-200">Precio</th>
                    <th className="text-right px-3 py-2 border border-gray-200">Cupos</th>
                  </tr>
                </thead>
                <tbody>
                  {psCat.map((p, i) => {
                    const esNacional = cat.toLowerCase().includes('nacional') || cat.toLowerCase().includes('chubut') || cat.toLowerCase().includes('patagonia')
                    const precio = esNacional && p.precioARS
                      ? `$ ${parseInt(p.precioARS).toLocaleString('es-AR')} ARS`
                      : p.precioUSD ? `USD ${parseInt(p.precioUSD).toLocaleString()}` : '-'
                    const promo = esNacional && p.promoARS
                      ? `$ ${parseInt(p.promoARS).toLocaleString('es-AR')}`
                      : p.promoUSD ? `USD ${parseInt(p.promoUSD).toLocaleString()}` : ''

                    return (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 border border-gray-200">
                          <div className="font-semibold text-gray-800 leading-tight">
                            {p.titulo}
                            {p.enPromocion && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">PROMO</span>}
                            {p.destacado && <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">⭐</span>}
                          </div>
                          {p.origen && <div className="text-xs text-gray-400">Desde {p.origen}</div>}
                        </td>
                        <td className="px-3 py-2 border border-gray-200 text-gray-600 text-xs">{p.fecha || '-'}</td>
                        <td className="px-3 py-2 border border-gray-200 text-center text-gray-600">{p.noches || '-'}</td>
                        <td className="px-3 py-2 border border-gray-200 text-gray-600 text-xs">{p.transporte || '-'}</td>
                        <td className="px-3 py-2 border border-gray-200 text-right">
                          <div className="font-bold text-blue-600 text-xs">{precio}</div>
                          {promo && <div className="text-red-500 text-xs">🔥 {promo}</div>}
                        </td>
                        <td className="px-3 py-2 border border-gray-200 text-center text-xs">
                          {p.cupos
                            ? <span className={parseInt(p.cupos) <= 5 ? 'text-red-500 font-bold' : 'text-green-600'}>{p.cupos}</span>
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}

        {/* Pie de página */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p className="font-bold text-gray-600 mb-1">✈️ Euforia Viajes</p>
          <p>Fontana 243, Trelew, Patagonia · Leg. LADEVI 16816</p>
          <p className="mt-1">🌐 app.viajaconeuforia.com</p>
          <p className="mt-2 text-gray-300">Precios orientativos sujetos a disponibilidad. Válido al {fecha}.</p>
        </div>

      </div>
    </>
  )
}
