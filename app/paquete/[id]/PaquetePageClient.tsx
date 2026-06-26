'use client'
import { use, useState, useEffect, useRef } from 'react'
import { getPaquete, emojiDestino } from '@/lib/paquetes'
import type { Paquete } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaquetesSimilares from '@/components/PaquetesSimilares'
import GaleriaFotos from '@/components/GaleriaFotos'

const SENA_PORC = 15

function PoliticaCancelacion({ esAereo }: { esAereo: boolean }) {
  const [abierto, setAbierto] = useState(false)

  const penalidades = esAereo ? [
    { plazo: 'Desde seña hasta 45 días antes', penalidad: 'Se retiene la seña (30% del total)' },
    { plazo: 'Entre 45 y 30 días antes', penalidad: 'Se cobra la tarifa aérea completa (sin devolución)' },
    { plazo: 'Con menos de 30 días', penalidad: 'Tarifa aérea + penalidades de servicios terrestres' },
  ] : [
    { plazo: 'Más de 30 días antes', penalidad: 'Retención del 10% + IVA del total' },
    { plazo: 'Entre 30 y 16 días antes', penalidad: 'Retención del 25% + IVA del total' },
    { plazo: 'Entre 15 días y 72 hs', penalidad: 'Retención del 50% + IVA del total' },
    { plazo: 'Menos de 72 hs o sin aviso', penalidad: '100% del total — sin devolución' },
  ]

  return (
    <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setAbierto(a => !a)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <span className="font-bold text-gray-700 text-sm">📋 Política de cancelación</span>
        <span className="text-gray-400 text-lg">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="px-5 py-4 space-y-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-700 mb-2">
              {esAereo ? '✈️ Paquete aéreo — penalidades por cancelación' : '🚌 Paquete en bus — penalidades por cancelación'}
            </p>
            <div className="space-y-2">
              {penalidades.map((p, i) => (
                <div key={i} className="flex gap-3 bg-orange-50 rounded-xl p-3">
                  <span className="text-orange-400 font-bold shrink-0">⚠️</span>
                  <div>
                    <p className="font-semibold text-gray-700">{p.plazo}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{p.penalidad}</p>
                  </div>
                </div>
              ))}
            </div>
            {esAereo && (
              <p className="text-xs text-gray-400 mt-3 bg-yellow-50 rounded-lg p-2">
                ⚠️ Los boletos aéreos se emiten 30-45 días antes de la salida. Una vez emitidos no admiten cancelaciones ni cambios de fecha.
              </p>
            )}
          </div>

          <details className="group">
            <summary className="cursor-pointer text-xs text-[#00AEEF] font-semibold select-none">
              Ver condiciones generales completas ▼
            </summary>
            <div className="mt-3 space-y-3 text-xs text-gray-500 leading-relaxed border-t pt-3">
              <p><strong>Inscripción:</strong> Se considera inscripto al pasajero una vez abonada la seña o acordadas las condiciones de pago. La inscripción implica aceptación plena de estas condiciones.</p>
              <p><strong>Cancelación por el organizador:</strong> Euforia Viajes se reserva el derecho de cancelar una salida si el número de inscriptos no es suficiente, notificando con mínimo 7 días de anticipación. En ese caso se devuelve el 100% de lo abonado sin indemnización adicional.</p>
              <p><strong>Equipaje:</strong> Hasta 20 kg de bodega + bolso de mano. El exceso puede tener costo adicional. El equipaje viaja por cuenta y riesgo del pasajero.</p>
              <p><strong>Documentación:</strong> La obtención y vigencia de DNI, pasaporte, visas o certificados es responsabilidad exclusiva del pasajero. No se realizan reintegros por problemas de documentación.</p>
              <p><strong>Reembolsos:</strong> Todo reclamo deberá presentarse por escrito dentro de los 30 días corridos posteriores a la finalización del tour. No se reembolsan servicios no utilizados por decisión del pasajero.</p>
              <p><strong>Jurisdicción:</strong> Tribunales ordinarios de la ciudad de Trelew, Provincia del Chubut. Leg. 16816 — Vigencia: 01/10/2024.</p>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

function formatFecha(f: string) {
  if (!f) return ''
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  let d: number, m: number, y: number
  if (/^\d{4}-\d{2}-\d{2}/.test(f)) {
    const parts = f.slice(0, 10).split('-')
    y = parseInt(parts[0]); m = parseInt(parts[1]); d = parseInt(parts[2])
  } else if (f.includes('/')) {
    const parts = f.split('/')
    const a = parseInt(parts[0]), b = parseInt(parts[1]), c = parseInt(parts[2])
    if (a > 31) { y = a; m = b; d = c }
    else if (a > 12) { d = a; m = b; y = c }
    else if (b > 12) { m = a; d = b; y = c }
    else { d = a; m = b; y = c }
  } else return f
  if (!meses[m - 1] || isNaN(d) || isNaN(y)) return f
  return `${d} ${meses[m - 1]} ${y}`
}

export default function PaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [p, setP] = useState<Paquete | undefined>(getPaquete(id))
  const [tc, setTc] = useState(1400)
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', cantPasajeros: '1', fechaDeseada: '', mensaje: '' })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const [pagoEstado, setPagoEstado] = useState<'idle' | 'cargando'>('idle')
  const [cupon, setCupon] = useState('')
  const [descuentoUSD, setDescuentoUSD] = useState(0)
  const [cuponEstado, setCuponEstado] = useState<'idle' | 'ok' | 'error'>('idle')
  const [cuponMsg, setCuponMsg] = useState('')

  useEffect(() => {
    fetch('/api/paquetes').then(r => r.json()).then((data: Paquete[]) => {
      const found = data.find(pkg => pkg.id === id)
      if (found) setP(found)
    }).catch(() => {})
    fetch('/api/admin/config').then(r => r.json()).then(cfg => {
      if (cfg?.tipoCambio) setTc(Number(cfg.tipoCambio))
    }).catch(() => {})
  }, [id])

  if (!p) return <div className="p-8 text-center">Paquete no encontrado. <Link href="/" className="text-[#00AEEF] underline">Volver</Link></div>

  const precioNum = Math.max(0, (parseFloat(p.precioUSD) || parseInt(p.precioARS) / tc || 0) - descuentoUSD)
  const precioARS = precioNum * tc
  const senaARS = Math.round(precioARS * parseInt(form.cantPasajeros) * SENA_PORC / 100)

  const validarCupon = async () => {
    if (!cupon) return
    setCuponEstado('idle')
    const res = await fetch('/api/validar-cupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: cupon, precioUSD: parseFloat(p.precioUSD) || 0 }),
    })
    const data = await res.json()
    if (data.ok) {
      setDescuentoUSD(data.descuento)
      setCuponEstado('ok')
      setCuponMsg(`Cupón aplicado: -USD ${data.descuento.toFixed(0)}`)
    } else {
      setCuponEstado('error')
      setCuponMsg(data.error || 'Cupón inválido')
    }
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const res = await fetch('/api/prereserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, paqueteId: p.id, paqueteTitulo: p.titulo, precioUSD: p.precioUSD, precioARS: p.precioARS, fecha: p.fecha }),
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

  const compartirWhatsApp = () => {
    const url = `https://app.viajaconeuforia.com/paquete/${p.id}`
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
            <GaleriaFotos paqueteId={p.id} fotoPortada={p.foto} />
            <div className="p-6">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#00AEEF' }}>{p.categoria} · {p.transporte}</span>
              <h1 className="text-2xl font-black text-gray-800 mt-1">{p.titulo}</h1>
              <div className="flex gap-4 text-sm text-gray-500 mt-2">
                {p.noches && <span>🌙 {p.noches} noches</span>}
                {p.origen && <span>📍 Desde {p.origen}</span>}
                {p.fecha && <span>📅 {formatFecha(p.fecha)}</span>}
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
                🔥 ¡Últimos cupos disponibles!
              </div>
              <hr className="my-4" />
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{p.descripcion}</div>

              {/* INCLUYE / NO INCLUYE */}
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="font-bold text-green-700 text-sm mb-3">✅ Incluye</p>
                  <ul className="space-y-1.5 text-sm text-green-800">
                    <li>🛏️ Hotelería</li>
                    <li>☕ Desayuno diario</li>
                    {(p.transporte || '').toLowerCase().includes('aéreo') || (p.transporte || '').toLowerCase().includes('aereo') ? (
                      <>
                        <li>✈️ Vuelos incluidos</li>
                        <li>🚐 Transfer in / out</li>
                      </>
                    ) : (
                      <>
                        <li>🚌 Transporte en bus</li>
                        <li>🍽️ Cenas a bordo</li>
                      </>
                    )}
                    <li>🛡️ Seguro de viaje</li>
                    <li>👤 Coordinador de grupo</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-2xl p-4">
                  <p className="font-bold text-red-600 text-sm mb-3">❌ No incluye</p>
                  <ul className="space-y-1.5 text-sm text-red-700">
                    <li>🏄 Excursiones opcionales</li>
                    <li>💵 Propinas</li>
                    <li>🧳 Valijas extra</li>
                    {!(p.transporte || '').toLowerCase().includes('bus') && (
                      <li>🍽️ Cenas</li>
                    )}
                    <li>🍹 Gastos personales</li>
                  </ul>
                </div>
              </div>
              {p.linkWeb && (
                <a href={p.linkWeb} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm underline" style={{ color: '#00AEEF' }}>
                  Ver en sitio web →
                </a>
              )}

              {/* POLÍTICA DE CANCELACIÓN */}
              <PoliticaCancelacion esAereo={
                (p.transporte || '').toLowerCase().includes('aéreo') ||
                (p.transporte || '').toLowerCase().includes('aereo')
              } />
            </div>
          </div>
        </div>

        {/* FORMULARIO PRERESERVA */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow p-6 sticky top-4">
            <h2 className="font-bold text-gray-800 text-lg mb-1">📋 Pre-reservar</h2>
            <p className="text-xs text-gray-400 mb-4">Completá el formulario y nos comunicamos con vos para confirmar.</p>

            {precioARS > 0 && (
              <div className="bg-[#E0F6FF] rounded-xl p-3 mb-4 text-sm space-y-2">
                <p className="font-bold text-[#0090C5]">
                  Seña {SENA_PORC}%: <span className="text-[#00AEEF]">$ {senaARS.toLocaleString('es-AR')}</span>
                </p>
                <p className="text-xs text-[#0090C5]">por {form.cantPasajeros} pasajero{parseInt(form.cantPasajeros) > 1 ? 's' : ''} · el resto al viajar</p>
                <hr className="border-[#b3e6f9]" />
                <p className="text-xs font-bold text-[#0090C5] mb-1">💳 Financiación en cuotas:</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { n: 2, pct: 16.09 },
                    { n: 3, pct: 18.79 },
                    { n: 6, pct: 25.69 },
                    { n: 9, pct: 33.89 },
                    { n: 12, pct: 38.89 },
                    { n: 18, pct: 48.19 },
                  ].map(({ n, pct }) => {
                    const total = precioARS * parseInt(form.cantPasajeros)
                    const valorCuota = Math.round(total * (1 + pct / 100) / n)
                    return (
                      <div key={n} className="bg-white rounded-lg p-2 text-center border border-[#b3e6f9]">
                        <p className="text-[10px] text-gray-500 font-semibold">{n} cuotas</p>
                        <p className="text-xs font-black text-[#00AEEF]">$ {valorCuota.toLocaleString('es-AR')}</p>
                        <p className="text-[9px] text-gray-400">+{pct}%</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-gray-400">Financiación Mercado Pago · valores con interés incluido</p>
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
                {/* Cupón de descuento */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Cupón de descuento (opcional)</label>
                  <div className="flex gap-2">
                    <input type="text" value={cupon} onChange={e => setCupon(e.target.value.toUpperCase())}
                      placeholder="Ej: VERANO10"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF] uppercase" />
                    <button type="button" onClick={validarCupon}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
                      Aplicar
                    </button>
                  </div>
                  {cuponMsg && (
                    <p className={`text-xs mt-1 ${cuponEstado === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{cuponMsg}</p>
                  )}
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
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <PaquetesSimilares idActual={id} destino={p.destino || p.titulo} />
      </div>
    </div>
  )
}
