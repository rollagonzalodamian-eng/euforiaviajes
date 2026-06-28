'use client'
import { useState, useEffect } from 'react'

export default function GaleriaFotos({ paqueteId, fotoPortada }: { paqueteId: string; fotoPortada: string }) {
  const [fotos, setFotos] = useState<string[]>([])
  const [activa, setActiva] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/galeria?id=${paqueteId}`)
      .then(r => r.json())
      .then((data: string[]) => {
        // Solo mostrar galería si el admin subió fotos — no usar fotos por defecto de AppSheet
        setFotos(data.length > 0 ? data : fotoPortada ? [fotoPortada] : [])
      })
      .catch(() => setFotos(fotoPortada ? [fotoPortada] : []))
  }, [paqueteId, fotoPortada])

  if (fotos.length === 0) return (
    <div className="h-64 bg-gray-100 rounded-t-2xl flex items-center justify-center text-gray-400">Sin foto</div>
  )

  return (
    <div>
      {/* Foto principal */}
      <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => setLightbox(true)}>
        <img src={fotos[activa]} alt="foto paquete" className="w-full h-full object-cover" />
        {fotos.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setActiva(a => (a - 1 + fotos.length) % fotos.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-black/60"
            >‹</button>
            <button
              onClick={e => { e.stopPropagation(); setActiva(a => (a + 1) % fotos.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-black/60"
            >›</button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activa + 1} / {fotos.length}
            </div>
          </>
        )}
        <div className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">🔍 Ver en grande</div>
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
          {fotos.map((f, i) => (
            <button key={i} onClick={() => setActiva(i)}
              className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === activa ? 'border-[#00AEEF]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={f} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
          <button onClick={e => { e.stopPropagation(); setActiva(a => (a - 1 + fotos.length) % fotos.length) }}
            className="absolute left-4 text-white text-4xl font-bold px-4">‹</button>
          <img src={fotos[activa]} alt="" className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setActiva(a => (a + 1) % fotos.length) }}
            className="absolute right-4 text-white text-4xl font-bold px-4">›</button>
          <div className="absolute bottom-4 text-white text-sm">{activa + 1} / {fotos.length}</div>
        </div>
      )}
    </div>
  )
}
