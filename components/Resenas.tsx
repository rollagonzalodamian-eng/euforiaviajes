'use client'
import { useEffect, useState } from 'react'

type Resena = {
  id: string
  nombre: string
  ciudad: string
  destino: string
  texto: string
  estrellas: number
  foto?: string
  fecha: string
}

const RESENAS_DEFAULT: Resena[] = [
  { id: '1', nombre: 'María G.', ciudad: 'Neuquén', destino: 'Termas de Río Hondo', texto: 'Una experiencia increíble. El hotel era hermoso y la atención de Euforia Viajes fue excelente desde el primer momento. ¡Ya estamos planeando el próximo!', estrellas: 5, fecha: '2026-03' },
  { id: '2', nombre: 'Carlos R.', ciudad: 'Comodoro Rivadavia', destino: 'Cancún', texto: 'Viajamos en familia a Cancún y todo salió perfecto. El paquete incluía todo y no tuvimos que preocuparnos por nada. Muy recomendables.', estrellas: 5, fecha: '2026-02' },
  { id: '3', nombre: 'Laura M.', ciudad: 'Trelew', destino: 'Brasil', texto: 'Ya es la tercera vez que viajamos con Euforia y siempre superan las expectativas. Camboriú fue un sueño. Gracias!', estrellas: 5, fecha: '2026-01' },
]

const COLORES = ['#00AEEF', '#0090C5', '#00C4A7', '#F59E0B', '#8B5CF6']

export default function Resenas() {
  const [resenas, setResenas] = useState<Resena[]>(RESENAS_DEFAULT)

  useEffect(() => {
    fetch('/api/admin/resenas')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setResenas(data) })
      .catch(() => {})
  }, [])

  return (
    <section className="py-14 px-4" style={{ background: 'linear-gradient(180deg, #f5f9fd 0%, #e8f4fb 100%)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#00AEEF] font-bold text-sm uppercase tracking-widest mb-2">Testimonios</p>
          <h2 className="text-3xl font-black text-gray-800 mb-3">Lo que dicen nuestros viajeros</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {'⭐'.repeat(5).split('').map((s, i) => <span key={i} className="text-xl">{s}</span>)}
            <span className="ml-2 text-gray-500 text-sm font-semibold">5.0 · +5000 viajeros felices</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resenas.map((r, i) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col relative overflow-hidden">
              {/* Comilla decorativa */}
              <div className="absolute top-4 right-5 text-6xl font-black opacity-5 text-gray-800 leading-none select-none">"</div>

              {/* Estrellas */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: r.estrellas }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <p className="text-gray-600 text-sm flex-1 leading-relaxed italic">"{r.texto}"</p>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: COLORES[i % COLORES.length] }}>
                  {r.foto
                    ? <img src={r.foto} alt={r.nombre} className="w-full h-full rounded-full object-cover" />
                    : r.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{r.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">{r.ciudad}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#E0F6FF', color: '#00AEEF' }}>
                  ✈️ {r.destino}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA reseña */}
        <div className="text-center mt-10">
          <a href="https://wa.me/542804321400?text=Hola!%20Quiero%20dejar%20mi%20reseña%20de%20mi%20viaje"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#00AEEF] text-[#00AEEF] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#E0F6FF] transition">
            ✍️ Dejá tu reseña
          </a>
        </div>
      </div>
    </section>
  )
}
