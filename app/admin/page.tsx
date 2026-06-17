'use client'

import { useState, useEffect } from 'react'
import paquetesData from '@/data/paquetes.json'

type Paquete = {
  id: string
  titulo: string
  categoria: string
  destino: string
  precioUSD: string | number
  foto: string
  disponible: boolean
}

type Reserva = {
  nombre: string
  email: string
  telefono: string
  cantPasajeros: number
  fechaDeseada?: string
  paqueteTitulo: string
  fecha: string
}

const paquetes = paquetesData as unknown as Paquete[]

export default function AdminPage() {
  const [pass, setPass] = useState('')
  const [autenticado, setAutenticado] = useState(false)
  const [tab, setTab] = useState<'fotos' | 'reservas' | 'stats'>('stats')
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [nuevaUrl, setNuevaUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function login() {
    const res = await fetch('/api/admin/fotos', { headers: { 'x-admin-pass': pass } })
    if (res.ok) {
      const data = await res.json()
      setFotos(data)
      setAutenticado(true)
      setError('')
      cargarReservas()
    } else {
      setError('Contraseña incorrecta')
    }
  }

  async function cargarReservas() {
    const res = await fetch('/api/admin/reservas')
    if (res.ok) setReservas(await res.json())
  }

  async function guardarFoto(id: string) {
    setGuardando(true)
    const res = await fetch('/api/admin/fotos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, id, url: nuevaUrl }),
    })
    if (res.ok) {
      setFotos(f => ({ ...f, [id]: nuevaUrl }))
      setMensaje('Foto guardada correctamente')
      setTimeout(() => setMensaje(''), 3000)
    }
    setGuardando(false)
    setEditando(null)
    setNuevaUrl('')
  }

  const paquetesFiltrados = paquetes.filter(p =>
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  )

  const categorias = [...new Set(paquetes.map(p => p.categoria))]
  const conFoto = paquetes.filter(p => fotos[p.id] || p.foto).length

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#00AEEF] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Panel Administrativo</h1>
            <p className="text-gray-500 text-sm">Euforia Viajes</p>
          </div>
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full border rounded-lg px-4 py-3 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
          />
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
          <button
            onClick={login}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold hover:bg-[#0090C5] transition"
          >
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00AEEF] text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Panel Admin</h1>
          <p className="text-xs opacity-80">Euforia Viajes</p>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          className="text-white/80 hover:text-white text-sm border border-white/30 rounded-lg px-3 py-1"
        >
          Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        {([['stats', 'Resumen'], ['fotos', 'Fotos'], ['reservas', 'Pre-Reservas']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${
              tab === key ? 'border-[#00AEEF] text-[#00AEEF]' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {mensaje && (
          <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✓ {mensaje}
          </div>
        )}

        {/* RESUMEN */}
        {tab === 'stats' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Resumen</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="text-3xl font-bold text-[#00AEEF]">{paquetes.length}</div>
                <div className="text-gray-600 text-sm">Paquetes totales</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="text-3xl font-bold text-green-500">{reservas.length}</div>
                <div className="text-gray-600 text-sm">Pre-reservas</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="text-3xl font-bold text-purple-500">{conFoto}</div>
                <div className="text-gray-600 text-sm">Con foto</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="text-3xl font-bold text-orange-500">{categorias.length}</div>
                <div className="text-gray-600 text-sm">Categorías</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-3">Por categoría</h3>
              {categorias.sort().map(cat => {
                const count = paquetes.filter(p => p.categoria === cat).length
                return (
                  <div key={cat} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-40 truncate">{cat}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#00AEEF] h-2 rounded-full"
                        style={{ width: `${(count / paquetes.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FOTOS */}
        {tab === 'fotos' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Buscar paquete..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
              />
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Toca cualquier paquete para cambiar su foto. La URL debe ser una imagen directa (jpg, png, webp).
            </p>
            <div className="space-y-3">
              {paquetesFiltrados.map(p => {
                const fotoActual = fotos[p.id] || p.foto || ''
                const isEditing = editando === p.id
                return (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {fotoActual ? (
                          <img src={fotoActual} alt={p.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{p.titulo}</p>
                        <p className="text-xs text-gray-500">{p.categoria} · {p.destino}</p>
                        {Number(p.precioUSD) > 0 && (
                          <p className="text-xs text-[#00AEEF] font-semibold">USD {Number(p.precioUSD).toLocaleString()}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditando(isEditing ? null : p.id)
                          setNuevaUrl(fotoActual)
                        }}
                        className="text-[#00AEEF] text-sm font-medium shrink-0"
                      >
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </button>
                    </div>
                    {isEditing && (
                      <div className="px-3 pb-3 border-t pt-3 bg-blue-50">
                        <input
                          type="url"
                          placeholder="https://... URL de la foto"
                          value={nuevaUrl}
                          onChange={e => setNuevaUrl(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                        />
                        {nuevaUrl && (
                          <img src={nuevaUrl} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" onError={e => (e.currentTarget.style.display = 'none')} />
                        )}
                        <button
                          onClick={() => guardarFoto(p.id)}
                          disabled={guardando || !nuevaUrl}
                          className="w-full bg-[#00AEEF] text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          {guardando ? 'Guardando...' : 'Guardar foto'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {tab === 'reservas' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Pre-Reservas</h2>
              <button
                onClick={cargarReservas}
                className="text-[#00AEEF] text-sm font-medium"
              >
                Actualizar
              </button>
            </div>
            {reservas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No hay pre-reservas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...reservas].reverse().map((r, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{r.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          }) : ''}
                        </p>
                      </div>
                      <a
                        href={`https://wa.me/542804321400?text=${encodeURIComponent(`Hola ${r.nombre}! Te contactamos por tu consulta sobre ${r.paqueteTitulo}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium"
                      >
                        WhatsApp
                      </a>
                    </div>
                    <p className="text-sm text-[#00AEEF] font-medium mb-2">{r.paqueteTitulo}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                      <span>📧 {r.email}</span>
                      <span>📱 {r.telefono}</span>
                      <span>👥 {r.cantPasajeros} pasajeros</span>
                      {r.fechaDeseada && <span>📅 {r.fechaDeseada}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
