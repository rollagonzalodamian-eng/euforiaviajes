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
}

export default function MiCuentaPage() {
  const { data: session, status } = useSession()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      setCargando(true)
      fetch(`/api/mis-reservas?email=${encodeURIComponent(session.user.email)}`)
        .then(r => r.json())
        .then(data => { setReservas(data); setCargando(false) })
        .catch(() => setCargando(false))
    }
  }, [session])

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
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Mi cuenta</h1>
          <p className="text-gray-400 text-sm mb-6">Ingresá para ver tus reservas y datos guardados.</p>
          <button
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar con Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Perfil */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center gap-4">
          {session.user?.image && (
            <img src={session.user.image} alt="foto" className="w-14 h-14 rounded-full" />
          )}
          <div className="flex-1">
            <p className="font-bold text-gray-800">{session.user?.name}</p>
            <p className="text-sm text-gray-400">{session.user?.email}</p>
          </div>
          <button onClick={() => signOut()} className="text-sm text-gray-400 hover:text-red-500 transition">
            Salir
          </button>
        </div>

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
            {[...reservas].reverse().map((r, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{r.paqueteTitulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                    En gestión
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <span>👥 {r.cantPasajeros} pasajero{r.cantPasajeros > 1 ? 's' : ''}</span>
                  {r.fechaDeseada && <span>📅 {r.fechaDeseada}</span>}
                  <span>📱 {r.telefono}</span>
                </div>
                <a href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola! Consulto por mi pre-reserva de ${r.paqueteTitulo}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-green-500 text-white font-bold py-2 rounded-xl text-sm">
                  Consultar estado por WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
