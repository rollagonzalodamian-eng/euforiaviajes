'use client'
import { useEffect, useState, useRef } from 'react'

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
  { id: '4', nombre: 'Roberto S.', ciudad: 'Puerto Madryn', destino: 'Europa', texto: 'Nunca pensé que podría viajar a Europa y Euforia lo hizo posible. Todo organizado, sin sorpresas. 100% recomendado.', estrellas: 5, fecha: '2025-12' },
  { id: '5', nombre: 'Claudia P.', ciudad: 'Trelew', destino: 'Bariloche', texto: 'Un viaje soñado a Bariloche. La atención personalizada fue lo que más nos gustó. Ya reservamos para el año que viene.', estrellas: 5, fecha: '2025-11' },
]

const COLORES = ['#00AEEF', '#0090C5', '#00C4A7', '#F59E0B', '#8B5CF6']

export default function Resenas() {
  const [resenas, setResenas] = useState<Resena[]>(RESENAS_DEFAULT)
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    fetch('/api/admin/resenas')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setResenas(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (pausado) return
    intervalRef.current = setInterval(() => {
      setActual(a => (a + 1) % resenas.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [resenas.length, pausado])

  const ir = (i: number) => {
    setActual(i)
    setPausado(true)
    setTimeout(() => setPausado(false), 8000)
  }

  const r = resenas[actual]

  return (
    <section className="py-10 px-4" style={{ background: 'linear-gradient(180deg, #e8f4fb 0%, #f5f9fd 100%)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header compacto */}
        <div className="text-center mb-6">
          <p className="text-[#00AEEF] font-bold text-xs uppercase tracking-widest mb-1">Testimonios</p>
          <div className="flex items-center justify-center gap-1">
            {'⭐⭐⭐⭐⭐'.split('').map((s, i) => <span key={i} className="text-base">{s}</span>)}
            <span className="ml-2 text-gray-500 text-xs font-semibold">5.0 · +6000 viajeros felices</span>
          </div>
        </div>

        {/* Card principal — carrusel */}
        <div
          className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden cursor-pointer"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <div className="absolute top-4 right-6 text-6xl font-black opacity-5 text-gray-800 leading-none select-none">"</div>

          {/* Estrellas */}
          <div className="flex gap-0.5 mb-4">
            {Array.from({ length: r.estrellas }).map((_, j) => (
              <svg key={j} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>

          <p className="text-gray-600 text-base leading-relaxed italic mb-6 min-h-[72px]">"{r.texto}"</p>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: COLORES[actual % COLORES.length] }}>
              {r.foto
                ? <img src={r.foto} alt={r.nombre} className="w-full h-full rounded-full object-cover" />
                : r.nombre.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{r.nombre}</p>
              <p className="text-xs text-gray-400">{r.ciudad}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#E0F6FF', color: '#00AEEF' }}>
              ✈️ {r.destino}
            </span>
          </div>
        </div>

        {/* Dots de navegación */}
        <div className="flex justify-center gap-2 mt-4">
          {resenas.map((_, i) => (
            <button
              key={i}
              onClick={() => ir(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === actual ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === actual ? '#00AEEF' : '#c8eaf8',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-5">
          <a href="https://wa.me/542804321400?text=Hola!%20Quiero%20dejar%20mi%20reseña%20de%20mi%20viaje"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#00AEEF] text-[#00AEEF] font-semibold px-5 py-2 rounded-xl text-sm hover:bg-[#E0F6FF] transition">
            ✍️ Dejá tu reseña
          </a>
        </div>
      </div>
    </section>
  )
}
