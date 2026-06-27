'use client'
import { useState } from 'react'
import Link from 'next/link'

const DESTINOS = [
  { nombre: 'Termas de Río Hondo', emoji: '♨️' },
  { nombre: 'Cancún', emoji: '🏖️' },
  { nombre: 'Brasil', emoji: '🇧🇷' },
  { nombre: 'Bariloche', emoji: '🏔️' },
  { nombre: 'Punta Cana', emoji: '🌴' },
  { nombre: 'Europa', emoji: '🏰' },
  { nombre: 'Miami', emoji: '🌆' },
  { nombre: 'Mendoza', emoji: '🍷' },
  { nombre: 'Salta', emoji: '🌄' },
  { nombre: 'Ushuaia', emoji: '🧊' },
  { nombre: 'Cataratas', emoji: '💧' },
  { nombre: 'Otro destino', emoji: '🌍' },
]

const ACTIVIDADES = [
  { id: 'playa', label: '🏖️ Playa y sol' },
  { id: 'aventura', label: '🧗 Aventura' },
  { id: 'cultura', label: '🏛️ Cultura y museos' },
  { id: 'gastronomia', label: '🍽️ Gastronomía' },
  { id: 'relax', label: '🧖 Relax y spa' },
  { id: 'naturaleza', label: '🌿 Naturaleza' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'familia', label: '👨‍👩‍👧 Actividades familiares' },
]

const PASOS = ['Destino', 'Fechas y grupo', 'Preferencias', 'Tus datos']

type Form = {
  destino: string
  destinoCustom: string
  fechaSalida: string
  fechaRegreso: string
  flexible: boolean
  adultos: string
  menores: string
  tipoHabitacion: string
  tipoViaje: string
  presupuesto: string
  actividades: string[]
  ocasion: string
  comentarios: string
  nombre: string
  email: string
  telefono: string
}

export default function ArmatTuViajePage() {
  const [paso, setPaso] = useState(0)
  const [form, setForm] = useState<Form>({
    destino: '',
    destinoCustom: '',
    fechaSalida: '',
    fechaRegreso: '',
    flexible: false,
    adultos: '2',
    menores: '0',
    tipoHabitacion: 'Doble',
    tipoViaje: '',
    presupuesto: '',
    actividades: [],
    ocasion: '',
    comentarios: '',
    nombre: '',
    email: '',
    telefono: '',
  })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')

  const toggle = (key: keyof Form, val: string) => {
    const arr = form[key] as string[]
    setForm(f => ({ ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }))
  }

  const destinoFinal = form.destino === 'Otro destino' ? form.destinoCustom : form.destino

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const pasajeros = parseInt(form.adultos) + parseInt(form.menores)
    const detalle = [
      `🌍 Destino: ${destinoFinal}`,
      `📅 Salida: ${form.fechaSalida || 'A definir'}${form.flexible ? ' (flexible)' : ''}`,
      `📅 Regreso: ${form.fechaRegreso || 'A definir'}`,
      `👥 Adultos: ${form.adultos} | Menores: ${form.menores}`,
      `🛏️ Habitación: ${form.tipoHabitacion}`,
      `📦 Tipo: ${form.tipoViaje || 'Sin especificar'}`,
      `💰 Presupuesto: ${form.presupuesto || 'Sin especificar'}`,
      `🎯 Actividades: ${form.actividades.join(', ') || 'Sin especificar'}`,
      `🎉 Ocasión: ${form.ocasion || 'Sin especificar'}`,
      `💬 Comentarios: ${form.comentarios || '-'}`,
    ].join('\n')

    const res = await fetch('/api/prereserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        cantPasajeros: pasajeros,
        mensaje: detalle,
        paqueteTitulo: `✈️ Viaje a medida: ${destinoFinal}`,
        paqueteId: 'arma-tu-viaje',
      }),
    })
    setEstado(res.ok ? 'ok' : 'error')
  }

  if (estado === 'ok') {
    return (
      <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#E0F6FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">¡Solicitud enviada!</h1>
          <p className="text-gray-500 mb-2">Recibimos tu consulta para un viaje a <strong className="text-[#00AEEF]">{destinoFinal}</strong>.</p>
          <p className="text-gray-400 text-sm mb-6">Un asesor te va a contactar en menos de 24 hs para cotizarte el viaje ideal.</p>
          <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Acabo de enviar una consulta para armar un viaje a ${destinoFinal} para ${parseInt(form.adultos) + parseInt(form.menores)} personas`)}`}
            target="_blank" rel="noopener noreferrer"
            className="block w-full bg-[#25D366] text-white font-bold py-3 rounded-xl mb-3 text-sm">
            💬 Hablar por WhatsApp ahora
          </a>
          <Link href="/salidas" className="block text-sm font-semibold underline" style={{ color: '#00AEEF' }}>
            Ver paquetes disponibles →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }} className="text-white py-10 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2">✈️ Armá tu viaje ideal</h1>
        <p className="opacity-80 text-sm max-w-md mx-auto">Contanos a dónde querés ir y armamos el paquete perfecto para vos.</p>

        {/* Barra de progreso */}
        <div className="flex items-center justify-center gap-2 mt-8 max-w-sm mx-auto">
          {PASOS.map((p, i) => (
            <div key={p} className="flex items-center gap-2 flex-1">
              <div className={`flex flex-col items-center flex-1`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all
                  ${i < paso ? 'bg-white text-[#00AEEF]' : i === paso ? 'bg-white text-[#00AEEF] ring-4 ring-white/30' : 'bg-white/20 text-white/60'}`}>
                  {i < paso ? '✓' : i + 1}
                </div>
                <p className={`text-[10px] mt-1 font-semibold ${i <= paso ? 'text-white' : 'text-white/40'}`}>{p}</p>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`h-0.5 flex-1 mb-4 rounded ${i < paso ? 'bg-white' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* PASO 1 — Destino */}
        {paso === 0 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-black text-gray-800 text-lg mb-4">¿A dónde querés ir?</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {DESTINOS.map(d => (
                  <button key={d.nombre} type="button"
                    onClick={() => setForm(f => ({ ...f, destino: d.nombre }))}
                    className={`p-3 rounded-xl text-center transition border-2 ${form.destino === d.nombre ? 'border-[#00AEEF] bg-[#E0F6FF]' : 'border-gray-100 bg-gray-50 hover:border-[#00AEEF]/50'}`}>
                    <div className="text-2xl mb-1">{d.emoji}</div>
                    <div className="text-[11px] font-semibold text-gray-700 leading-tight">{d.nombre}</div>
                  </button>
                ))}
              </div>
              {form.destino === 'Otro destino' && (
                <input type="text" value={form.destinoCustom}
                  onChange={e => setForm(f => ({ ...f, destinoCustom: e.target.value }))}
                  placeholder="¿A dónde querés ir?"
                  className="w-full border-2 border-[#00AEEF] rounded-xl px-4 py-3 text-sm outline-none" />
              )}
            </div>
            <button onClick={() => setPaso(1)} disabled={!form.destino || (form.destino === 'Otro destino' && !form.destinoCustom)}
              className="w-full text-white font-bold py-4 rounded-2xl text-base transition disabled:opacity-40"
              style={{ backgroundColor: '#00AEEF' }}>
              Siguiente: Fechas y grupo →
            </button>
          </div>
        )}

        {/* PASO 2 — Fechas y grupo */}
        {paso === 1 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <h2 className="font-black text-gray-800 text-lg">¿Cuándo y con quién viajás?</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de salida</label>
                  <input type="date" value={form.fechaSalida}
                    onChange={e => setForm(f => ({ ...f, fechaSalida: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha de regreso</label>
                  <input type="date" value={form.fechaRegreso}
                    onChange={e => setForm(f => ({ ...f, fechaRegreso: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.flexible}
                  onChange={e => setForm(f => ({ ...f, flexible: e.target.checked }))}
                  className="w-4 h-4 accent-[#00AEEF]" />
                <span className="text-sm text-gray-600">Soy flexible con las fechas</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Adultos</label>
                  <select value={form.adultos} onChange={e => setForm(f => ({ ...f, adultos: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Menores (hasta 12 años)</label>
                  <select value={form.menores} onChange={e => setForm(f => ({ ...f, menores: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]">
                    {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de habitación</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Simple', 'Doble', 'Triple', 'Familiar'].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipoHabitacion: t }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.tipoHabitacion === t ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPaso(0)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl text-sm">
                ← Atrás
              </button>
              <button onClick={() => setPaso(2)}
                className="flex-[2] text-white font-bold py-3 rounded-2xl text-sm"
                style={{ backgroundColor: '#00AEEF' }}>
                Siguiente: Preferencias →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — Preferencias */}
        {paso === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow p-5 space-y-5">
              <h2 className="font-black text-gray-800 text-lg">¿Qué tipo de viaje buscás?</h2>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Modalidad</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Todo incluido', 'Vuelo + hotel', 'Solo hotel', 'Solo traslados'].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipoViaje: t }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.tipoViaje === t ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Presupuesto por persona</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Hasta USD 500', 'USD 500–1.000', 'USD 1.000–2.000', 'Más de USD 2.000'].map(p => (
                    <button key={p} type="button" onClick={() => setForm(f => ({ ...f, presupuesto: p }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.presupuesto === p ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Actividades de interés (podés elegir varias)</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVIDADES.map(a => (
                    <button key={a.id} type="button" onClick={() => toggle('actividades', a.id)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition text-left
                        ${form.actividades.includes(a.id) ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">¿Es para alguna ocasión especial?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Luna de miel 💍', 'Cumpleaños 🎂', 'Aniversario 💑', 'Viaje familiar 👨‍👩‍👧', 'Viaje de egresados 🎓', 'Ninguna en particular'].map(o => (
                    <button key={o} type="button" onClick={() => setForm(f => ({ ...f, ocasion: o }))}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.ocasion === o ? 'border-[#00AEEF] bg-[#E0F6FF] text-[#00AEEF]' : 'border-gray-200 text-gray-600'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">¿Algo más que quieras contarnos?</label>
                <textarea rows={3} value={form.comentarios}
                  onChange={e => setForm(f => ({ ...f, comentarios: e.target.value }))}
                  placeholder="Necesito accesibilidad, quiero habitación con vista al mar, solo vuelo de ida..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF] resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl text-sm">
                ← Atrás
              </button>
              <button onClick={() => setPaso(3)}
                className="flex-[2] text-white font-bold py-3 rounded-2xl text-sm"
                style={{ backgroundColor: '#00AEEF' }}>
                Último paso →
              </button>
            </div>
          </div>
        )}

        {/* PASO 4 — Datos personales */}
        {paso === 3 && (
          <form onSubmit={enviar} className="space-y-5">
            {/* Resumen */}
            <div className="bg-[#E0F6FF] rounded-2xl p-4 text-sm text-[#0078B4] space-y-1">
              <p className="font-black text-base text-[#00AEEF] mb-2">✈️ Resumen de tu viaje</p>
              <p>🌍 <strong>{destinoFinal}</strong></p>
              {(form.fechaSalida || form.flexible) && (
                <p>📅 {form.fechaSalida || 'Fechas a definir'}{form.flexible ? ' · Flexible' : ''}</p>
              )}
              <p>👥 {parseInt(form.adultos) + parseInt(form.menores)} persona{parseInt(form.adultos) + parseInt(form.menores) !== 1 ? 's' : ''} · Hab. {form.tipoHabitacion}</p>
              {form.presupuesto && <p>💰 {form.presupuesto} por persona</p>}
              {form.ocasion && form.ocasion !== 'Ninguna en particular' && <p>🎉 {form.ocasion}</p>}
            </div>

            <div className="bg-white rounded-2xl shadow p-5 space-y-4">
              <h2 className="font-black text-gray-800 text-lg">Tus datos de contacto</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
                <input type="text" required value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Tu nombre completo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp</label>
                <input type="tel" required value={form.telefono}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  placeholder="+54 280 432 1400"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
            </div>

            {estado === 'error' && <p className="text-red-500 text-sm text-center">Hubo un error. Intentá de nuevo.</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setPaso(2)} className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl text-sm">
                ← Atrás
              </button>
              <button type="submit" disabled={estado === 'enviando'}
                className="flex-[2] text-white font-bold py-3 rounded-2xl text-sm transition disabled:opacity-60"
                style={{ backgroundColor: '#00AEEF' }}>
                {estado === 'enviando' ? 'Enviando...' : '✈️ Quiero este viaje'}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">Sin compromiso · Te respondemos en menos de 24hs</p>
          </form>
        )}
      </div>
    </div>
  )
}
