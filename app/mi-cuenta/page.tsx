'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Reserva = {
  nombre: string
  email: string
  telefono: string
  cantPasajeros: number
  fechaDeseada?: string
  paqueteTitulo: string
  fecha: string
  estado?: string
}

type Perfil = {
  nombre: string
  telefono: string
  rol: 'visitante' | 'pasajero'
  viajes: string[]
}

export default function MiCuentaPage() {
  const { data: session, status } = useSession()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '' })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!session?.user?.email) return
    setCargando(true)
    Promise.all([
      fetch(`/api/mis-reservas?email=${encodeURIComponent(session.user.email)}`).then(r => r.json()),
      fetch('/api/auth/perfil').then(r => r.json()),
    ]).then(([res, perf]) => {
      setReservas(res)
      if (!perf || !perf.nombre) {
        setOnboarding(true)
        setForm({ nombre: perf?.nombre || '', telefono: perf?.telefono || '' })
      } else {
        setPerfil(perf)
      }
      setCargando(false)
    }).catch(() => setCargando(false))
  }, [session])

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    await fetch('/api/auth/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setPerfil({ nombre: form.nombre, telefono: form.telefono, rol: 'visitante', viajes: [] })
    setOnboarding(false)
    setGuardando(false)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#E0F6FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Mi cuenta</h1>
          <p className="text-gray-400 text-sm mb-6">Ingresá para ver tus reservas y viajes.</p>
          <a href="/login" className="block w-full text-white font-bold py-3 rounded-xl text-center transition" style={{ backgroundColor: '#00AEEF' }}>
            Ingresar / Registrarse
          </a>
        </div>
      </div>
    )
  }

  if (onboarding) {
    return (
      <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#E0F6FF] rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-xl font-black text-gray-800">¡Bienvenido!</h1>
            <p className="text-gray-400 text-sm mt-1">Completá tu perfil para continuar</p>
          </div>
          <form onSubmit={guardarPerfil} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
              <input type="text" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF]"
                placeholder="Tu nombre" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono / WhatsApp</label>
              <input type="tel" required value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF]"
                placeholder="+54 280 432 1400" />
            </div>
            <button type="submit" disabled={guardando}
              className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
              style={{ backgroundColor: '#00AEEF' }}>
              {guardando ? 'Guardando...' : 'Guardar y continuar →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Perfil */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E0F6FF] flex items-center justify-center text-2xl font-black text-[#00AEEF]">
            {perfil?.nombre?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{perfil?.nombre || session.user?.name}</p>
            <p className="text-sm text-gray-400">{session.user?.email}</p>
            {perfil?.telefono && <p className="text-xs text-gray-400">📱 {perfil.telefono}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${perfil?.rol === 'pasajero' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {perfil?.rol === 'pasajero' ? '✈️ Pasajero' : '👤 Visitante'}
            </span>
            <button onClick={() => signOut()} className="text-xs text-gray-400 hover:text-red-500 transition">
              Salir
            </button>
          </div>
        </div>

        {/* Viajes confirmados */}
        {perfil?.rol === 'pasajero' && perfil.viajes?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">✈️ Mis viajes confirmados</h2>
            <div className="space-y-3">
              {perfil.viajes.map((v, i) => (
                <a key={i} href={`/paquete/${v}`} className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition">
                  <p className="text-sm font-semibold text-[#00AEEF]">Ver paquete →</p>
                </a>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-800 mb-4">Mis pre-reservas</h2>

        {cargando ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">Todavía no tenés reservas.</p>
            <a href="/" className="mt-4 inline-block text-sm font-semibold underline" style={{ color: '#00AEEF' }}>
              Ver paquetes disponibles →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {[...reservas].reverse().map((r, i) => {
              const estado = r.estado || 'en_gestion'
              const pasos = [
                { key: 'recibida', label: 'Recibida', icon: '📋' },
                { key: 'en_gestion', label: 'En revisión', icon: '🔍' },
                { key: 'confirmada', label: 'Confirmada', icon: '✅' },
              ]
              const cancelada = estado === 'cancelada'
              const pasoActual = cancelada ? -1 : pasos.findIndex(p => p.key === estado)
              const idx = pasoActual === -1 ? 0 : pasoActual

              return (
                <div key={i} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-bold text-gray-800 text-sm leading-snug">{r.paqueteTitulo}</p>
                    {cancelada && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 ml-2 shrink-0">❌ Cancelada</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Solicitada el {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                    {r.cantPasajeros && ` · ${r.cantPasajeros} pasajero${r.cantPasajeros > 1 ? 's' : ''}`}
                    {r.fechaDeseada && ` · Fecha deseada: ${r.fechaDeseada}`}
                  </p>

                  {/* Timeline de progreso */}
                  {!cancelada && (
                    <div className="flex items-center mb-5">
                      {pasos.map((paso, pi) => {
                        const activo = pi <= idx
                        const esActual = pi === idx
                        return (
                          <div key={paso.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all
                                ${esActual ? 'ring-4 ring-[#00AEEF]/30' : ''}
                                ${activo ? 'bg-[#00AEEF] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {paso.icon}
                              </div>
                              <p className={`text-[10px] font-semibold mt-1 text-center leading-tight
                                ${activo ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
                                {paso.label}
                              </p>
                            </div>
                            {pi < pasos.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded ${pi < idx ? 'bg-[#00AEEF]' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {estado === 'confirmada' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs text-green-700 font-semibold">
                      🎉 ¡Tu reserva está confirmada! Pronto vas a recibir más detalles por email.
                    </div>
                  )}
                  {estado === 'en_gestion' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-700">
                      ⏳ Estamos revisando tu solicitud. Un asesor te va a contactar en menos de 24 hs.
                    </div>
                  )}

                  <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Consulto por mi pre-reserva de ${r.paqueteTitulo}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center bg-[#25D366] text-white font-bold py-2.5 rounded-xl text-sm">
                    💬 Consultar por WhatsApp
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
