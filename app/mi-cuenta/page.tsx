'use client'
import { useState } from 'react'
import Link from 'next/link'

type Reserva = {
  nombre: string
  email: string
  telefono: string
  cantPasajeros: number
  fechaDeseada?: string
  paqueteTitulo: string
  paqueteId?: string
  fecha: string
}

export default function MiCuentaPage() {
  const [email, setEmail] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [reservas, setReservas] = useState<Reserva[] | null>(null)
  const [buscado, setBuscado] = useState(false)

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault()
    setBuscando(true)
    const res = await fetch(`/api/mis-reservas?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setReservas(data)
    setBuscado(true)
    setBuscando(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-gray-800 mb-1">Mi cuenta</h1>
        <p className="text-gray-500 text-sm mb-8">Ingresá tu email para ver tus pre-reservas.</p>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <form onSubmit={buscar} className="flex gap-3">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00AEEF]"
            />
            <button type="submit" disabled={buscando}
              className="text-white font-bold px-6 py-2 rounded-lg transition disabled:opacity-60"
              style={{ backgroundColor: '#00AEEF' }}>
              {buscando ? '...' : 'Buscar'}
            </button>
          </form>
        </div>

        {buscado && reservas !== null && (
          reservas.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold">No encontramos reservas para ese email.</p>
              <p className="text-sm mt-2">Si hiciste una consulta, revisá que el email sea el mismo que usaste.</p>
              <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold underline" style={{ color: '#00AEEF' }}>
                Contactar por WhatsApp →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">{reservas.length} pre-reserva{reservas.length > 1 ? 's' : ''} encontrada{reservas.length > 1 ? 's' : ''}</p>
              {[...reservas].reverse().map((r, i) => (
                <div key={i} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{r.paqueteTitulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Solicitado el {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
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
          )
        )}
      </div>
    </div>
  )
}
