'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Oferta = {
  activo: boolean
  titulo: string
  descripcion: string
  linkId: string
  fechaFin: string
}

export default function BannerOferta() {
  const [oferta, setOferta] = useState<Oferta | null>(null)
  const [tiempo, setTiempo] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [cerrado, setCerrado] = useState(false)

  useEffect(() => {
    fetch('/api/admin/oferta')
      .then(r => r.json())
      .then(data => { if (data?.activo) setOferta(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!oferta?.fechaFin) return
    const calcular = () => {
      const diff = new Date(oferta.fechaFin).getTime() - Date.now()
      if (diff <= 0) return
      setTiempo({
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff % 86400000) / 3600000),
        minutos: Math.floor((diff % 3600000) / 60000),
        segundos: Math.floor((diff % 60000) / 1000),
      })
    }
    calcular()
    const t = setInterval(calcular, 1000)
    return () => clearInterval(t)
  }, [oferta])

  if (!oferta || cerrado) return null

  const vence = new Date(oferta.fechaFin).getTime() > Date.now()

  return (
    <div className="relative text-white px-4 py-3" style={{ background: 'linear-gradient(90deg, #ff6b35, #ff3d71)' }}>
      <button onClick={() => setCerrado(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 text-lg">✕</button>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
        <div className="flex-1">
          <span className="font-black text-sm">🔥 {oferta.titulo}</span>
          {oferta.descripcion && <span className="text-xs opacity-90 ml-2">{oferta.descripcion}</span>}
        </div>
        {vence && (
          <div className="flex items-center gap-1 text-xs font-bold">
            <span>Termina en:</span>
            {tiempo.dias > 0 && <span className="bg-white/20 px-2 py-1 rounded">{tiempo.dias}d</span>}
            <span className="bg-white/20 px-2 py-1 rounded">{String(tiempo.horas).padStart(2,'0')}h</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(tiempo.minutos).padStart(2,'0')}m</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(tiempo.segundos).padStart(2,'0')}s</span>
          </div>
        )}
        {oferta.linkId && (
          <Link href={`/paquete/${oferta.linkId}`}
            className="bg-white text-red-500 font-bold text-xs px-4 py-2 rounded-full whitespace-nowrap">
            Ver oferta →
          </Link>
        )}
      </div>
    </div>
  )
}
