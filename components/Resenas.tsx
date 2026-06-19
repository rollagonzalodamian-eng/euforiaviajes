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

export default function Resenas() {
  const [resenas, setResenas] = useState<Resena[]>(RESENAS_DEFAULT)

  useEffect(() => {
    fetch('/api/admin/resenas')
      .then(r => r.json())
      .then(data => { if (data.length > 0) setResenas(data) })
      .catch(() => {})
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-800">⭐ Lo que dicen nuestros viajeros</h2>
        <a href="https://wa.me/542804321400?text=Hola!%20Quiero%20dejar%20mi%20reseña%20de%20mi%20viaje"
          target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold underline hidden sm:block" style={{ color: '#00AEEF' }}>
          Dejá tu reseña →
        </a>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resenas.map(r => (
          <div key={r.id} className="bg-white rounded-2xl shadow p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: '#00AEEF' }}>
                {r.foto
                  ? <img src={r.foto} alt={r.nombre} className="w-full h-full rounded-full object-cover" />
                  : r.nombre.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{r.nombre}</p>
                <p className="text-xs text-gray-400">{r.ciudad}</p>
              </div>
              <div className="ml-auto text-yellow-400 text-sm">
                {'⭐'.repeat(r.estrellas)}
              </div>
            </div>
            <p className="text-gray-600 text-sm flex-1 leading-relaxed">"{r.texto}"</p>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: '#00AEEF' }}>✈️ {r.destino}</span>
              <span className="text-xs text-gray-400">{r.fecha}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
