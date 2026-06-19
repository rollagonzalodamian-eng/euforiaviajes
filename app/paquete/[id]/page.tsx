'use client'
import { use, useState } from 'react'
import { getPaquete, emojiDestino } from '@/lib/paquetes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const SENA_PORC = 15
const TC = 1050

export default function PaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const p = getPaquete(id)
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', cantPasajeros: '1', fechaDeseada: '', mensaje: '' })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const [pagoEstado, setPagoEstado] = useState<'idle' | 'cargando'>('idle')

  if (!p) return <div className="p-8 text-center">Paquete no encontrado. <Link href="/" className="text-[#00AEEF] underline">Volver</Link></div>

  const precioNum = parseFloat(p.precioUSD) || parseInt(p.precioARS) / TC || 0
  const precioARS = parseFloat(p.precioUSD) ? parseFloat(p.precioUSD) * TC : parseInt(p.precioARS) || 0
  const senaARS = Math.round(precioARS * parseInt(form.cantPasajeros) * SENA_PORC / 100)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const res = await fetch('/api/prereserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, paqueteId: p.id, paqueteTitulo: p.titulo }),
    })
    if (res.ok) router.push('/confirmacion')
    else setEstado('error')
  }

  const pagarSena = async () => {
    if (!form.nombre || !form.email) {
      alert('Completá tu nombre y email primero.')
      return
    }
    setPagoEstado('cargando')
    const res = await fetch('/api/pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paqueteId: p.id,
        paqueteTitulo: p.titulo,
        precioUSD: precioNum,
        cantPasajeros: parseInt(form.cantPasajeros),
        nombre: form.nombre,
        email: form.email,
      }),
    })
    const data = await res.json()
    setPagoEstado('idle')
    if (data.init_point) window.location.href = data.init_point
    else alert('Mercado Pago no está activado aún. Contactanos por WhatsApp.')
  }

  const cupos = Math.floor(Math.random() * 4) + 1

  const compartirWhatsApp = () => {
    const url = `https://euforiaviajes.vercel.app/paquete/${p.id}`
    const texto = `¡Mirá este paquete de Euforia Viajes! ${p.titulo}${p.precioUSD ? ` - Desde USD ${parseFloat(p.precioUSD).toLocaleString()}` : ''} 👉 ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      <div className="max-w-4xl mx-auto px-4 pt-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-[#00AEEF] font-semibold text-sm hover:underline">← Volver</button>
        <button onClick={compartirWhatsApp} className="flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg">
          📤 Compartir
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* DETALLE */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img src={p.foto} alt={p.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00AEEF' }}>{p.categoria} · {p.transporte}</span>
              <h1 className="text-2xl font-black text-gray-800 mt-1">{p.titulo}</h1>
              <div className="flex gap-4 text-sm text-gray-500 mt-2">
                {p.noches && <span>🌙 {p.noches} noches</span>}
                {p.origen && <span>📍 Desde {p.origen}</span>}
                {p.fecha && <span>📅 {p.fecha}</span>}
              </div>
              {p.precioUSD && (
                <div className="mt-3">
                  {p.promoUSD && parseFloat(p.promoUSD) > 0 && (
                    <p className="text-lg text-gray-400 line-through">USD {parseFloat(p.promoUSD).toLocaleString()}</p>
                  )}
                  <p className="text-3xl font-black" style={{ color: '#00AEEF' }}>USD {parseFloat(p.precioUSD).toLocaleString()} <span className="text-sm font-normal text-gray-400">/ persona</span></p>
                </div>
              )}
              {!p.precioUSD && p.precioARS && (
                <p className="text-3xl font-black mt-3" style={{ color: '#00AEEF' }}>$ {parseInt(p.precioARS).toLocaleString('es-AR')} <span className="text-sm font-normal text-gray-400">/ persona</span></p>
              )}
              <div className="mt-2 inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                🔥 Solo quedan {cupos} lugar{cupos > 1 ? 'es' : ''}
              </div>
              <hr className="my-4" />
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{p.descripcion}</div>
              {p.linkWeb && (
                <a href={p.linkWeb} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm underline" style={{ color: '#00AEEF' }}>
                  Ver en sitio web →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* FORMULARIO PRERESERVA */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-4">
            <h2 className="font-bold text-gray-800 text-lg mb-1">📋 Pre-reservar</h2>
            <p className="text-xs text-gray-400 mb-4">Completá el formulario y nos comunicamos con vos para confirmar.</p>

            {senaARS > 0 && (
              <div className="bg-[#E0F6FF] rounded-xl p-3 mb-4 text-sm">
                <p className="font-bold text-[#0090C5]">Seña {SENA_PORC}%: <span className="text-[#00AEEF]">$ {senaARS.toLocaleString('es-AR')}</span></p>
                <p className="text-xs text-[#0090C5] mt-0.5">por {form.cantPasajeros} pasajero{parseInt(form.cantPasajeros) > 1 ? 's' : ''} · abonás ahora y el resto al viajar</p>
              </div>
            )}
            {estado === 'ok' ? null : (
              <form onSubmit={enviar} className="space-y-3">
                {[
                  { name: 'nombre', label: 'Nombre completo', type: 'text', required: true },
                  { name: 'email', label: 'Email', type: 'email', required: true },
                  { name: 'telefono', label: 'Teléfono / WhatsApp', type: 'tel', required: true },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                    <input type={f.type} required={f.required}
                      value={(form as any)[f.name]}
                      onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad de pasajeros</label>
                  <select value={form.cantPasajeros} onChange={e => setForm(p => ({ ...p, cantPasajeros: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha deseada de viaje</label>
                  <input type="date" value={form.fechaDeseada} onChange={e => setForm(p => ({ ...p, fechaDeseada: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Consulta adicional (opcional)</label>
                  <textarea value={form.mensaje} onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
                    rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF] resize-none" />
                </div>
                {estado === 'error' && <p className="text-red-500 text-xs">Hubo un error. Intentá de nuevo.</p>}
                <button type="submit" disabled={estado === 'enviando'}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                  style={{ backgroundColor: '#00AEEF' }}>
                  {estado === 'enviando' ? 'Enviando...' : '📋 Consultar sin compromiso'}
                </button>
                {senaARS > 0 && (
                  <button type="button" onClick={pagarSena} disabled={pagoEstado === 'cargando'}
                    className="w-full bg-[#009ee3] text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2">
                    {pagoEstado === 'cargando' ? 'Redirigiendo...' : `💳 Pagar seña $ ${senaARS.toLocaleString('es-AR')} con Mercado Pago`}
                  </button>
                )}
                <p className="text-[10px] text-gray-400 text-center">Sin compromiso · Te contactamos en menos de 24hs</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
