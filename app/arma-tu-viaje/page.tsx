'use client'
import { useState } from 'react'
import Link from 'next/link'

const DESTINOS_POPULARES = [
  { nombre: 'Termas de Río Hondo', emoji: '♨️', pais: 'Argentina' },
  { nombre: 'Cancún', emoji: '🏖️', pais: 'México' },
  { nombre: 'Camboriú', emoji: '🌊', pais: 'Brasil' },
  { nombre: 'Bariloche', emoji: '🏔️', pais: 'Argentina' },
  { nombre: 'Punta Cana', emoji: '🌴', pais: 'República Dominicana' },
  { nombre: 'Europa', emoji: '🏰', pais: 'Europa' },
  { nombre: 'Miami', emoji: '🌆', pais: 'Estados Unidos' },
  { nombre: 'Mendoza', emoji: '🍷', pais: 'Argentina' },
]

export default function ArmatTuViajePage() {
  const [form, setForm] = useState({
    destino: '',
    origen: 'Patagonia',
    fechaSalida: '',
    fechaRegreso: '',
    pasajeros: '2',
    tipoViaje: '',
    presupuesto: '',
    nombre: '',
    email: '',
    telefono: '',
    comentarios: '',
  })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const mensaje = `Destino: ${form.destino} | Desde: ${form.origen} | Salida: ${form.fechaSalida} | Regreso: ${form.fechaRegreso} | Pasajeros: ${form.pasajeros} | Tipo: ${form.tipoViaje} | Presupuesto: ${form.presupuesto} | Comentarios: ${form.comentarios}`
    const res = await fetch('/api/prereserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        cantPasajeros: form.pasajeros,
        mensaje,
        paqueteTitulo: `Viaje a medida: ${form.destino}`,
        paqueteId: 'arma-tu-viaje',
      }),
    })
    setEstado(res.ok ? 'ok' : 'error')
  }

  if (estado === 'ok') {
    return (
      <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">¡Solicitud enviada!</h1>
          <p className="text-gray-500 mb-6">Recibimos tu consulta de viaje a medida. Te contactamos en menos de 24 horas.</p>
          <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Consulto por un viaje a medida a ${form.destino} para ${form.pasajeros} personas`)}`}
            target="_blank" rel="noopener noreferrer"
            className="block w-full bg-green-500 text-white font-bold py-3 rounded-xl mb-3">
            Hablar por WhatsApp ahora
          </a>
          <Link href="/" className="block text-sm underline" style={{ color: '#00AEEF' }}>Ver paquetes disponibles</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0090C5 100%)' }} className="text-white py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Armá tu viaje ideal</h1>
        <p className="opacity-80 text-sm max-w-md mx-auto">Contanos a dónde querés ir y nosotros armamos el paquete perfecto para vos.</p>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Destinos populares */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Destinos populares</h2>
          <div className="grid grid-cols-4 gap-2">
            {DESTINOS_POPULARES.map(d => (
              <button key={d.nombre} onClick={() => setForm(f => ({ ...f, destino: d.nombre }))}
                className={`p-3 rounded-xl text-center transition border-2 ${form.destino === d.nombre ? 'border-[#00AEEF] bg-[#E0F6FF]' : 'border-gray-100 bg-white hover:border-[#00AEEF]'}`}>
                <div className="text-2xl mb-1">{d.emoji}</div>
                <div className="text-xs font-semibold text-gray-700 leading-tight">{d.nombre}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <h3 className="font-bold text-gray-800">¿A dónde querés ir?</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Destino</label>
              <input type="text" required value={form.destino}
                onChange={e => setForm(f => ({ ...f, destino: e.target.value }))}
                placeholder="Ej: Cancún, Europa, Bariloche..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de salida</label>
                <input type="date" value={form.fechaSalida}
                  onChange={e => setForm(f => ({ ...f, fechaSalida: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de regreso</label>
                <input type="date" value={form.fechaRegreso}
                  onChange={e => setForm(f => ({ ...f, fechaRegreso: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad de pasajeros</label>
              <select value={form.pasajeros} onChange={e => setForm(f => ({ ...f, pasajeros: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <h3 className="font-bold text-gray-800">¿Qué tipo de viaje buscás?</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Todo incluido', 'Solo vuelo + hotel', 'Solo hotel', 'Crucero'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipoViaje: t }))}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition ${form.tipoViaje === t ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Presupuesto aproximado por persona</label>
              <select value={form.presupuesto} onChange={e => setForm(f => ({ ...f, presupuesto: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]">
                <option value="">Seleccioná...</option>
                <option value="Hasta USD 500">Hasta USD 500</option>
                <option value="USD 500 - 1000">USD 500 - 1.000</option>
                <option value="USD 1000 - 2000">USD 1.000 - 2.000</option>
                <option value="USD 2000 - 3000">USD 2.000 - 3.000</option>
                <option value="Más de USD 3000">Más de USD 3.000</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Comentarios adicionales (opcional)</label>
              <textarea rows={3} value={form.comentarios}
                onChange={e => setForm(f => ({ ...f, comentarios: e.target.value }))}
                placeholder="Ej: viaje de luna de miel, necesito habitación accesible, quiero playa..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF] resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <h3 className="font-bold text-gray-800">Tus datos</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
              <input type="text" required value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp</label>
                <input type="tel" required value={form.telefono}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
            </div>
          </div>

          {estado === 'error' && <p className="text-red-500 text-sm text-center">Hubo un error. Intentá de nuevo.</p>}
          <button type="submit" disabled={estado === 'enviando'}
            className="w-full text-white font-bold py-4 rounded-2xl text-lg transition disabled:opacity-60"
            style={{ backgroundColor: '#00AEEF' }}>
            {estado === 'enviando' ? 'Enviando...' : '✈️ Quiero este viaje'}
          </button>
          <p className="text-xs text-gray-400 text-center">Sin compromiso · Te respondemos en menos de 24hs</p>
        </form>
      </div>
    </div>
  )
}
