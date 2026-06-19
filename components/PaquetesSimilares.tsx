'use client'
import Link from 'next/link'
import paquetes from '@/data/paquetes.json'

type Paquete = {
  id: string
  nombre: string
  destino: string
  precioUSD: string | number
  imagen: string
  noches?: string | number
}

export default function PaquetesSimilares({ idActual, destino }: { idActual: string; destino: string }) {
  const todos = paquetes as unknown as Paquete[]
  const similares = todos
    .filter(p => p.id !== idActual && p.destino?.toLowerCase().includes(destino?.split(',')[0]?.toLowerCase() || ''))
    .slice(0, 3)

  if (similares.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Paquetes similares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {similares.map(p => (
          <Link key={p.id} href={`/paquete/${p.id}`}
            className="rounded-xl overflow-hidden shadow hover:shadow-lg transition group border border-gray-100">
            <div className="relative h-40 overflow-hidden">
              <img
                src={p.imagen || '/icon.png'}
                alt={p.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="font-semibold text-gray-800 text-sm line-clamp-2">{p.nombre}</p>
              <p className="text-[#00AEEF] font-bold mt-1">USD {Number(p.precioUSD).toLocaleString()}</p>
              {p.noches && <p className="text-xs text-gray-500">{p.noches} noches</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
