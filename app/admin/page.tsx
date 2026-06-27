'use client'

import { useState, useEffect } from 'react'

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
  paqueteId?: string
  fecha: string
  estado?: string
  mensaje?: string
}

export default function AdminPage() {
  const [pass, setPass] = useState('')
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [autenticado, setAutenticado] = useState(false)
  const [tab, setTab] = useState<'fotos' | 'reservas' | 'stats' | 'config' | 'resenas' | 'cupones' | 'usuarios' | 'campanas'>('stats')
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)
  const [resenas, setResenas] = useState<any[]>([])
  const [nuevaResena, setNuevaResena] = useState({ nombre: '', ciudad: '', destino: '', texto: '', estrellas: 5, fecha: '' })
  const [guardandoResena, setGuardandoResena] = useState(false)
  const [config, setConfig] = useState({ senaPorc: 15, tipoCambio: 1400, whatsapp: '542804321400', emailAdmin: 'adm@viajaconeuforia.com' })
  const [guardandoConfig, setGuardandoConfig] = useState(false)
  const [mensajeConfig, setMensajeConfig] = useState('')
  const [oferta, setOferta] = useState({ activo: false, titulo: '', descripcion: '', linkId: '', fechaFin: '' })
  const [guardandoOferta, setGuardandoOferta] = useState(false)
  const [cupones, setCupones] = useState<any[]>([])
  const [nuevoCupon, setNuevoCupon] = useState({ codigo: '', descuento: 10, tipo: 'porcentaje', activo: true, maxUsos: 100 })
  const [guardandoCupon, setGuardandoCupon] = useState(false)
  const [syncEstado, setSyncEstado] = useState<'idle' | 'sincronizando' | 'ok' | 'error'>('idle')
  const [syncInfo, setSyncInfo] = useState<{ total?: number; fecha?: string; error?: string } | null>(null)
  const [syncFotosEstado, setSyncFotosEstado] = useState<'idle' | 'sincronizando' | 'ok' | 'error'>('idle')
  const [syncFotosInfo, setSyncFotosInfo] = useState<{ actualizados?: number; total?: number; error?: string } | null>(null)
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [galerias, setGalerias] = useState<Record<string, string[]>>({})
  const [editandoGaleria, setEditandoGaleria] = useState<string | null>(null)
  const [urlsGaleria, setUrlsGaleria] = useState('')
  const [guardandoGaleria, setGuardandoGaleria] = useState(false)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [nuevaUrl, setNuevaUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [modoFoto, setModoFoto] = useState<'url' | 'archivo'>('archivo')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [vistaReservas, setVistaReservas] = useState<'pipeline' | 'lista'>('pipeline')

  async function login() {
    const res = await fetch('/api/admin/fotos', { headers: { 'x-admin-pass': pass } })
    if (res.ok) {
      const data = await res.json()
      setFotos(data)
      setAutenticado(true)
      setError('')
      cargarReservas()
      cargarCupones()
      fetch('/api/paquetes').then(r => r.json()).then(data => setPaquetes(data)).catch(() => {})
      fetch('/api/admin/config').then(r => r.json()).then(cfg => {
        if (cfg) setConfig(c => ({ ...c, ...cfg }))
      }).catch(() => {})
    } else {
      setError('Contraseña incorrecta')
    }
  }

  async function cargarReservas() {
    const res = await fetch('/api/admin/reservas')
    if (res.ok) setReservas(await res.json())
  }

  async function cargarResenas() {
    const res = await fetch('/api/admin/resenas')
    if (res.ok) setResenas(await res.json())
  }

  async function agregarResena() {
    setGuardandoResena(true)
    await fetch('/api/admin/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, accion: 'agregar', resena: nuevaResena }),
    })
    setNuevaResena({ nombre: '', ciudad: '', destino: '', texto: '', estrellas: 5, fecha: '' })
    await cargarResenas()
    setGuardandoResena(false)
  }

  async function eliminarResena(id: string) {
    await fetch('/api/admin/resenas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, accion: 'eliminar', resena: { id } }),
    })
    await cargarResenas()
  }

  async function cargarOferta() {
    const res = await fetch('/api/admin/oferta')
    if (res.ok) setOferta(await res.json())
  }

  async function guardarOferta() {
    setGuardandoOferta(true)
    await fetch('/api/admin/oferta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, ...oferta }),
    })
    setGuardandoOferta(false)
    setMensaje('Banner guardado')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function sincronizarFotos() {
    setSyncFotosEstado('sincronizando')
    try {
      const res = await fetch('/api/admin/sync-fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass, limite: 50 }),
      })
      const data = await res.json()
      if (data.ok) {
        setSyncFotosEstado('ok')
        setSyncFotosInfo({ actualizados: data.actualizados, total: data.total })
      } else {
        setSyncFotosEstado('error')
        setSyncFotosInfo({ error: data.error || data.mensaje })
      }
    } catch (e: any) {
      setSyncFotosEstado('error')
      setSyncFotosInfo({ error: e.message })
    }
  }

  async function sincronizarAppSheet() {
    setSyncEstado('sincronizando')
    try {
      const res = await fetch('/api/sync-appsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass }),
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { data = { ok: false, error: `Error del servidor (${res.status}): ${text.slice(0, 200)}` } }
      if (data.ok) {
        setSyncEstado('ok')
        setSyncInfo({ total: data.total, fecha: data.fecha })
      } else {
        setSyncEstado('error')
        setSyncInfo({ error: data.error })
      }
    } catch (e: any) {
      setSyncEstado('error')
      setSyncInfo({ error: e.message })
    }
  }

  async function cargarCupones() {
    const res = await fetch('/api/admin/cupones')
    if (res.ok) setCupones(await res.json())
  }

  async function agregarCupon() {
    setGuardandoCupon(true)
    await fetch('/api/admin/cupones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, accion: 'agregar', cupon: nuevoCupon }),
    })
    setNuevoCupon({ codigo: '', descuento: 10, tipo: 'porcentaje', activo: true, maxUsos: 100 })
    await cargarCupones()
    setGuardandoCupon(false)
  }

  async function eliminarCupon(codigo: string) {
    await fetch('/api/admin/cupones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, accion: 'eliminar', cupon: { codigo } }),
    })
    await cargarCupones()
  }

  async function guardarConfig() {
    setGuardandoConfig(true)
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, ...config }),
    })
    if (res.ok) { setMensajeConfig('Configuración guardada'); setTimeout(() => setMensajeConfig(''), 3000) }
    setGuardandoConfig(false)
  }

  async function cargarGaleria(id: string) {
    const res = await fetch(`/api/admin/galeria?id=${id}`)
    if (res.ok) {
      const data = await res.json()
      setGalerias(g => ({ ...g, [id]: data }))
      setUrlsGaleria(data.join('\n'))
    }
  }

  async function guardarGaleria(id: string) {
    setGuardandoGaleria(true)
    const fotos = urlsGaleria.split('\n').map((u: string) => u.trim()).filter(Boolean)
    await fetch('/api/admin/galeria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass, id, fotos }),
    })
    setGalerias(g => ({ ...g, [id]: fotos }))
    setGuardandoGaleria(false)
    setEditandoGaleria(null)
    setMensaje('Galería guardada')
    setTimeout(() => setMensaje(''), 3000)
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

  function comprimirImagen(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        // Máximo 900px de ancho, calidad 72% — queda ~80-150KB como base64
        const maxW = 900
        const ratio = Math.min(1, maxW / img.width)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas no disponible'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => reject(new Error('No se pudo leer la imagen'))
      img.src = objectUrl
    })
  }

  async function subirArchivo(id: string, file: File) {
    setSubiendoArchivo(true)
    setError('')
    setMensaje('Procesando imagen...')
    try {
      const dataUrl = await comprimirImagen(file)
      const kb = Math.round(dataUrl.length / 1024)
      setMensaje(`Imagen comprimida (${kb}KB), guardando...`)

      if (dataUrl.length > 900000) {
        setError(`Imagen muy grande (${kb}KB). Necesita ser menor a 700KB. Elegí una foto más chica.`)
        setMensaje('')
        setSubiendoArchivo(false)
        return
      }

      const res = await fetch('/api/admin/fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass, id, url: dataUrl }),
      })
      const data = await res.json().catch(() => ({ ok: false, error: 'Respuesta inválida del servidor' }))

      if (res.ok && data.ok) {
        setFotos(f => ({ ...f, [id]: dataUrl }))
        setMensaje('✅ Foto guardada')
        setTimeout(() => setMensaje(''), 3000)
        setEditando(null)
        setNuevaUrl('')
      } else {
        setError(`Error ${res.status}: ${data.error || 'No se pudo guardar'}`)
        setMensaje('')
      }
    } catch (e: any) {
      setError('Error: ' + (e.message || 'desconocido'))
      setMensaje('')
    }
    setSubiendoArchivo(false)
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
        {([['stats', 'Resumen'], ['fotos', 'Fotos'], ['reservas', 'Reservas'], ['campanas', '📣 Campañas'], ['resenas', 'Reseñas'], ['cupones', 'Cupones'], ['config', 'Config']] as const).map(([key, label]) => (
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
            {mensaje}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* RESUMEN / DASHBOARD */}
        {tab === 'stats' && (() => {
          const ahora = new Date()
          const haceSiete = new Date(ahora); haceSiete.setDate(ahora.getDate() - 7)
          const haceQuince = new Date(ahora); haceQuince.setDate(ahora.getDate() - 15)
          const hoy = ahora.toDateString()

          const reservasHoy = reservas.filter(r => r.fecha && new Date(r.fecha).toDateString() === hoy)
          const reservasSemana = reservas.filter(r => r.fecha && new Date(r.fecha) >= haceSiete)
          const confirmadas = reservas.filter(r => r.estado === 'confirmada')
          const enGestion = reservas.filter(r => !r.estado || r.estado === 'en_gestion')
          const canceladas = reservas.filter(r => r.estado === 'cancelada')

          // Top paquetes por cantidad de reservas
          const conteo: Record<string, number> = {}
          reservas.forEach(r => { if (r.paqueteTitulo) conteo[r.paqueteTitulo] = (conteo[r.paqueteTitulo] || 0) + 1 })
          const topPaquetes = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)

          // Reservas últimos 7 días por día
          const dias: { label: string; count: number }[] = []
          for (let i = 6; i >= 0; i--) {
            const d = new Date(ahora); d.setDate(ahora.getDate() - i)
            const label = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
            const count = reservas.filter(r => r.fecha && new Date(r.fecha).toDateString() === d.toDateString()).length
            dias.push({ label, count })
          }
          const maxDia = Math.max(...dias.map(d => d.count), 1)

          return (
            <div>
              {/* Acciones rápidas */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <button onClick={sincronizarAppSheet} disabled={syncEstado === 'sincronizando'}
                  className="bg-[#00AEEF] text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-60 flex items-center gap-2">
                  {syncEstado === 'sincronizando' ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>Sincronizando...</> : '🔄 Sync AppSheet'}
                </button>
                <button onClick={sincronizarFotos} disabled={syncFotosEstado === 'sincronizando'}
                  className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-60">
                  {syncFotosEstado === 'sincronizando' ? '⏳ Buscando fotos...' : '🖼️ Sync Fotos'}
                </button>
              </div>

              {syncEstado === 'ok' && syncInfo && <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">✅ {syncInfo.total} paquetes sincronizados desde AppSheet</div>}
              {syncEstado === 'error' && syncInfo && <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">❌ {syncInfo.error}</div>}
              {syncFotosEstado === 'ok' && syncFotosInfo && <div className="mb-4 bg-purple-100 text-purple-700 px-4 py-3 rounded-xl text-sm">🖼️ {syncFotosInfo.actualizados} fotos actualizadas de {syncFotosInfo.total} paquetes</div>}

              {/* KPIs principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total reservas', value: reservas.length, color: 'text-[#00AEEF]', bg: 'bg-blue-50', icon: '📋' },
                  { label: 'Esta semana', value: reservasSemana.length, color: 'text-green-600', bg: 'bg-green-50', icon: '📈' },
                  { label: 'Hoy', value: reservasHoy.length, color: 'text-orange-500', bg: 'bg-orange-50', icon: '🕐' },
                  { label: 'Paquetes activos', value: paquetes.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: '✈️' },
                ].map(k => (
                  <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                    <div className="text-2xl mb-1">{k.icon}</div>
                    <div className={`text-3xl font-black ${k.color}`}>{k.value}</div>
                    <div className="text-gray-500 text-xs mt-1 font-medium">{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Estados de reservas */}
              <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
                <h3 className="font-bold text-gray-700 mb-4">Estado de reservas</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-yellow-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-yellow-600">{enGestion.length}</p>
                    <p className="text-xs text-yellow-700 font-semibold mt-1">⏳ En gestión</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-green-600">{confirmadas.length}</p>
                    <p className="text-xs text-green-700 font-semibold mt-1">✅ Confirmadas</p>
                  </div>
                  <div className="text-center bg-red-50 rounded-xl p-3">
                    <p className="text-2xl font-black text-red-500">{canceladas.length}</p>
                    <p className="text-xs text-red-600 font-semibold mt-1">❌ Canceladas</p>
                  </div>
                </div>
                {reservas.length > 0 && (
                  <div className="mt-4">
                    <div className="flex rounded-full overflow-hidden h-3">
                      {confirmadas.length > 0 && <div className="bg-green-400 transition-all" style={{ width: `${confirmadas.length / reservas.length * 100}%` }} />}
                      {enGestion.length > 0 && <div className="bg-yellow-400 transition-all" style={{ width: `${enGestion.length / reservas.length * 100}%` }} />}
                      {canceladas.length > 0 && <div className="bg-red-400 transition-all" style={{ width: `${canceladas.length / reservas.length * 100}%` }} />}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {reservas.length > 0 ? Math.round(confirmadas.length / reservas.length * 100) : 0}% conversión
                    </p>
                  </div>
                )}
              </div>

              {/* Actividad últimos 7 días */}
              <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
                <h3 className="font-bold text-gray-700 mb-4">📊 Actividad últimos 7 días</h3>
                <div className="flex items-end gap-2 h-24">
                  {dias.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-[#00AEEF]">{d.count > 0 ? d.count : ''}</span>
                      <div className="w-full rounded-t-lg transition-all"
                        style={{ height: `${(d.count / maxDia) * 64}px`, backgroundColor: d.count > 0 ? '#00AEEF' : '#e5e7eb', minHeight: '4px' }} />
                      <span className="text-[9px] text-gray-400 text-center leading-tight">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top paquetes */}
              {topPaquetes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
                  <h3 className="font-bold text-gray-700 mb-4">🏆 Paquetes más consultados</h3>
                  <div className="space-y-3">
                    {topPaquetes.map(([titulo, count], i) => (
                      <div key={titulo} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0
                          ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-[#00AEEF]/30'}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">{titulo}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                            <div className="bg-[#00AEEF] h-1.5 rounded-full" style={{ width: `${(count / topPaquetes[0][1]) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-black text-[#00AEEF] shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Últimas reservas */}
              {reservas.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700">🕐 Últimas consultas</h3>
                    <button onClick={() => setTab('reservas')} className="text-xs text-[#00AEEF] font-semibold">Ver todas →</button>
                  </div>
                  <div className="space-y-3">
                    {[...reservas].reverse().slice(0, 4).map((r, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className="w-9 h-9 rounded-full bg-[#E0F6FF] flex items-center justify-center text-sm font-black text-[#00AEEF] shrink-0">
                          {r.nombre?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.nombre}</p>
                          <p className="text-xs text-gray-400 truncate">{r.paqueteTitulo}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                            r.estado === 'cancelada' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {r.estado === 'confirmada' ? '✅' : r.estado === 'cancelada' ? '❌' : '⏳'}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

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
                        {/* Toggle modo */}
                        <div className="flex rounded-lg overflow-hidden border border-[#00AEEF] mb-3">
                          <button
                            onClick={() => setModoFoto('archivo')}
                            className={`flex-1 py-1.5 text-xs font-semibold transition ${modoFoto === 'archivo' ? 'bg-[#00AEEF] text-white' : 'bg-white text-[#00AEEF]'}`}
                          >
                            📁 Subir desde PC
                          </button>
                          <button
                            onClick={() => setModoFoto('url')}
                            className={`flex-1 py-1.5 text-xs font-semibold transition ${modoFoto === 'url' ? 'bg-[#00AEEF] text-white' : 'bg-white text-[#00AEEF]'}`}
                          >
                            🔗 Pegar link
                          </button>
                        </div>

                        {modoFoto === 'archivo' ? (
                          <div>
                            <label className="block w-full cursor-pointer">
                              <div className="border-2 border-dashed border-[#00AEEF] rounded-lg p-4 text-center hover:bg-blue-50 transition">
                                <p className="text-2xl mb-1">📸</p>
                                <p className="text-sm font-semibold text-[#00AEEF]">Tocá para elegir una imagen</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · máx 4MB</p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={subiendoArchivo}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file) subirArchivo(p.id, file)
                                }}
                              />
                            </label>
                            {(subiendoArchivo || mensaje) && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-[#00AEEF] bg-blue-50 px-3 py-2 rounded-lg">
                                {subiendoArchivo && <div className="w-4 h-4 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin shrink-0" />}
                                <span>{mensaje || 'Procesando...'}</span>
                              </div>
                            )}
                            {error && (
                              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                ❌ {error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <input
                              type="url"
                              placeholder="https://... URL de la foto portada"
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
                              className="w-full bg-[#00AEEF] text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 mb-3"
                            >
                              {guardando ? 'Guardando...' : 'Guardar foto portada'}
                            </button>
                          </div>
                        )}

                        {/* Galería múltiple */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-600">📸 Galería ({galerias[p.id]?.length || 0} fotos)</p>
                            <button
                              onClick={() => {
                                if (editandoGaleria === p.id) { setEditandoGaleria(null) }
                                else { setEditandoGaleria(p.id); cargarGaleria(p.id) }
                              }}
                              className="text-xs text-[#00AEEF] underline"
                            >
                              {editandoGaleria === p.id ? 'Cerrar' : 'Editar galería'}
                            </button>
                          </div>
                          {editandoGaleria === p.id && (
                            <div>
                              {/* Subir múltiples archivos a la galería */}
                              <label className="block w-full cursor-pointer mb-2">
                                <div className="border-2 border-dashed border-green-400 rounded-lg p-3 text-center hover:bg-green-50 transition">
                                  <p className="text-sm font-semibold text-green-600">+ Subir fotos desde PC</p>
                                  <p className="text-xs text-gray-400">Podés seleccionar varias a la vez</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  disabled={subiendoArchivo}
                                  onChange={async e => {
                                    const files = Array.from(e.target.files || [])
                                    if (!files.length) return
                                    setSubiendoArchivo(true)
                                    const urls: string[] = []
                                    for (const file of files) {
                                      const dataUrl = await comprimirImagen(file)
                                      urls.push(dataUrl)
                                    }
                                    const nuevas = [...(galerias[p.id] || []), ...urls]
                                    setGalerias(g => ({ ...g, [p.id]: nuevas }))
                                    setUrlsGaleria(nuevas.join('\n'))
                                    setSubiendoArchivo(false)
                                    setMensaje(`${urls.length} foto(s) subidas a la galería`)
                                    setTimeout(() => setMensaje(''), 3000)
                                  }}
                                />
                              </label>
                              {subiendoArchivo && (
                                <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                                  <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                  Subiendo fotos...
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mb-1">O pegá URLs (una por línea):</p>
                              <textarea
                                rows={4}
                                value={urlsGaleria}
                                onChange={e => setUrlsGaleria(e.target.value)}
                                placeholder={"https://foto1.jpg\nhttps://foto2.jpg"}
                                className="w-full border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] resize-none font-mono"
                              />
                              <button
                                onClick={() => guardarGaleria(p.id)}
                                disabled={guardandoGaleria}
                                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                              >
                                {guardandoGaleria ? 'Guardando...' : 'Guardar galería'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BANNER OFERTA */}
        {tab === 'config' && (
          <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">🔥 Banner de oferta</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-500">{oferta.activo ? 'Activo' : 'Inactivo'}</span>
                <div onClick={() => setOferta(o => ({ ...o, activo: !o.activo }))}
                  className={`w-10 h-6 rounded-full transition ${oferta.activo ? 'bg-[#00AEEF]' : 'bg-gray-300'} relative`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${oferta.activo ? 'left-5' : 'left-1'}`} />
                </div>
              </label>
            </div>
            <input placeholder="Título (ej: ¡PROMO INVIERNO! 20% OFF en Termas)"
              value={oferta.titulo} onChange={e => setOferta(o => ({ ...o, titulo: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
            <input placeholder="Descripción corta (opcional)"
              value={oferta.descripcion} onChange={e => setOferta(o => ({ ...o, descripcion: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
            <input placeholder="ID del paquete en oferta (opcional)"
              value={oferta.linkId} onChange={e => setOferta(o => ({ ...o, linkId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha y hora de vencimiento</label>
              <input type="datetime-local" value={oferta.fechaFin}
                onChange={e => setOferta(o => ({ ...o, fechaFin: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
            </div>
            <button onClick={guardarOferta} disabled={guardandoOferta}
              className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold text-sm disabled:opacity-50">
              {guardandoOferta ? 'Guardando...' : 'Guardar banner'}
            </button>
          </div>
        )}

        {/* RESEÑAS */}
        {tab === 'resenas' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Reseñas de viajeros</h2>
              <button onClick={cargarResenas} className="text-[#00AEEF] text-sm">Actualizar</button>
            </div>

            {/* Agregar nueva */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 space-y-3">
              <p className="font-semibold text-gray-700 text-sm">Agregar reseña</p>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Nombre (ej: María G.)" value={nuevaResena.nombre}
                  onChange={e => setNuevaResena(r => ({ ...r, nombre: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
                <input placeholder="Ciudad (ej: Neuquén)" value={nuevaResena.ciudad}
                  onChange={e => setNuevaResena(r => ({ ...r, ciudad: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Destino (ej: Cancún)" value={nuevaResena.destino}
                  onChange={e => setNuevaResena(r => ({ ...r, destino: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
                <input placeholder="Fecha (ej: 2026-03)" value={nuevaResena.fecha}
                  onChange={e => setNuevaResena(r => ({ ...r, fecha: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
              </div>
              <textarea placeholder="Texto de la reseña..." rows={3} value={nuevaResena.texto}
                onChange={e => setNuevaResena(r => ({ ...r, texto: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF] resize-none" />
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Estrellas:</span>
                {[5,4,3].map(n => (
                  <button key={n} onClick={() => setNuevaResena(r => ({ ...r, estrellas: n }))}
                    className={`px-3 py-1 rounded-lg text-sm border ${nuevaResena.estrellas === n ? 'bg-yellow-400 text-white border-yellow-400' : 'border-gray-200'}`}>
                    {'⭐'.repeat(n)}
                  </button>
                ))}
              </div>
              <button onClick={agregarResena} disabled={guardandoResena || !nuevaResena.nombre || !nuevaResena.texto}
                className="w-full bg-[#00AEEF] text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                {guardandoResena ? 'Guardando...' : '+ Agregar reseña'}
              </button>
            </div>

            {/* Lista */}
            <div className="space-y-3">
              {resenas.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No hay reseñas guardadas. Agregá la primera arriba.</p>
              )}
              {resenas.map((r: any) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border p-4 flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{r.nombre}</span>
                      <span className="text-xs text-gray-400">{r.ciudad}</span>
                      <span className="text-xs text-yellow-400">{'⭐'.repeat(r.estrellas)}</span>
                    </div>
                    <p className="text-xs text-[#00AEEF] mb-1">✈️ {r.destino}</p>
                    <p className="text-sm text-gray-600">"{r.texto}"</p>
                  </div>
                  <button onClick={() => eliminarResena(r.id)} className="text-red-400 hover:text-red-600 text-sm shrink-0">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUPONES */}
        {tab === 'cupones' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Cupones de descuento</h2>
              <button onClick={cargarCupones} className="text-sm text-[#00AEEF] underline">Actualizar</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5 mb-5">
              <h3 className="font-semibold text-gray-700 mb-3">Nuevo cupón</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                  <input type="text" placeholder="VERANO10" value={nuevoCupon.codigo}
                    onChange={e => setNuevoCupon(c => ({ ...c, codigo: e.target.value.toUpperCase() }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00AEEF] uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descuento</label>
                  <input type="number" value={nuevoCupon.descuento}
                    onChange={e => setNuevoCupon(c => ({ ...c, descuento: Number(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
                  <select value={nuevoCupon.tipo} onChange={e => setNuevoCupon(c => ({ ...c, tipo: e.target.value as any }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00AEEF]">
                    <option value="porcentaje">% descuento</option>
                    <option value="fijo">USD fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Máx. usos</label>
                  <input type="number" value={nuevoCupon.maxUsos}
                    onChange={e => setNuevoCupon(c => ({ ...c, maxUsos: Number(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00AEEF]" />
                </div>
              </div>
              <button onClick={agregarCupon} disabled={guardandoCupon || !nuevoCupon.codigo}
                className="mt-4 bg-[#00AEEF] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
                {guardandoCupon ? 'Guardando...' : '+ Crear cupón'}
              </button>
            </div>

            <div className="space-y-3">
              {cupones.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No hay cupones creados</p>}
              {cupones.map((c: any) => (
                <div key={c.codigo} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#00AEEF] text-lg font-mono">{c.codigo}</span>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {c.tipo === 'porcentaje' ? `${c.descuento}% off` : `USD ${c.descuento} off`} · {c.usos}/{c.maxUsos} usos · {c.activo ? '✅ Activo' : '❌ Inactivo'}
                    </p>
                  </div>
                  <button onClick={() => eliminarCupon(c.codigo)} className="text-red-400 hover:text-red-600 text-sm">✕ Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIG */}
        {tab === 'config' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Configuración</h2>
            {mensajeConfig && <div className="mb-4 bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm">✓ {mensajeConfig}</div>}
            <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">% de seña (actualmente {config.senaPorc}%)</label>
                <input type="number" min={5} max={50} value={config.senaPorc}
                  onChange={e => setConfig(c => ({ ...c, senaPorc: parseInt(e.target.value) }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
                <p className="text-xs text-gray-400 mt-1">Porcentaje que paga el cliente como seña por Mercado Pago</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de cambio USD → ARS</label>
                <input type="number" value={config.tipoCambio}
                  onChange={e => setConfig(c => ({ ...c, tipoCambio: parseInt(e.target.value) }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
                <p className="text-xs text-gray-400 mt-1">Se usa para mostrar precios en pesos en la app</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp de contacto</label>
                <input type="text" value={config.whatsapp}
                  onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email administrativo</label>
                <input type="email" value={config.emailAdmin}
                  onChange={e => setConfig(c => ({ ...c, emailAdmin: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-gray-500 mb-2">Mercado Pago</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                  ✅ Mercado Pago configurado y activo.
                </div>
              </div>
              <button onClick={guardarConfig} disabled={guardandoConfig}
                className="w-full bg-[#00AEEF] text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {tab === 'reservas' && (() => {
          const ETAPAS = [
            { id: 1, label: 'Nueva consulta', color: '#6B7280', bg: 'bg-gray-100', badge: 'bg-gray-200 text-gray-700' },
            { id: 2, label: 'Cotización enviada', color: '#00AEEF', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
            { id: 3, label: 'Confirmado', color: '#22C55E', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
            { id: 4, label: 'No confirmó', color: '#F59E0B', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
            { id: 5, label: 'Lead frío', color: '#8B5CF6', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
          ]

          async function cambiarEtapa(r: any, etapa: number) {
            await fetch('/api/admin/crm', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pass, id: r.id, etapa }),
            })
            setReservas(prev => prev.map((x: any) => x.id === r.id ? { ...x, etapa } : x))
          }

          async function enviarCotizacion(r: any) {
            setMensaje('Enviando cotización...')
            const res = await fetch('/api/admin/crm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pass, id: r.id }),
            })
            if (res.ok) {
              setReservas(prev => prev.map((x: any) => x.id === r.id ? { ...x, etapa: 2, cotizacionEnviada: new Date().toISOString() } : x))
              setMensaje('✅ Cotización enviada a ' + r.email)
            } else {
              setMensaje('❌ Error al enviar cotización')
            }
            setTimeout(() => setMensaje(''), 4000)
          }

          return (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800">CRM · Consultas</h2>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                  <button onClick={() => setVistaReservas('pipeline')}
                    className={`px-3 py-1.5 font-semibold transition ${vistaReservas === 'pipeline' ? 'bg-[#00AEEF] text-white' : 'bg-white text-gray-500'}`}>
                    Pipeline
                  </button>
                  <button onClick={() => setVistaReservas('lista')}
                    className={`px-3 py-1.5 font-semibold transition ${vistaReservas === 'lista' ? 'bg-[#00AEEF] text-white' : 'bg-white text-gray-500'}`}>
                    Lista
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={cargarReservas} className="text-[#00AEEF] text-sm font-medium">↻ Actualizar</button>
                <button onClick={async () => {
                  const res = await fetch('/api/admin/reservas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass }) })
                  const d = await res.json()
                  setMensaje(d.ok ? `✅ ${d.migradas} consultas migradas` : '❌ Error')
                  setTimeout(() => setMensaje(''), 4000)
                  cargarReservas()
                }} className="text-gray-400 text-xs font-medium border border-gray-200 px-2 py-1 rounded-lg hover:border-[#00AEEF] hover:text-[#00AEEF] transition">🔧 Migrar IDs</button>
                {reservas.length > 0 && (
                  <button
                    onClick={() => {
                      const headers = ['Nombre', 'Email', 'Teléfono', 'Pasajeros', 'Fecha deseada', 'Paquete', 'Etapa', 'Fecha consulta']
                      const rows = reservas.map((r: any) => [
                        r.nombre, r.email, r.telefono, r.cantPasajeros,
                        r.fechaDeseada || '', r.paqueteTitulo, r.etapa || 1,
                        r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR') : '',
                      ])
                      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
                      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a'); a.href = url; a.download = 'crm-euforia.csv'; a.click()
                    }}
                    className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    📥 Exportar
                  </button>
                )}
                {reservas.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm('¿Borrar TODAS las consultas?')) return
                      await fetch('/api/admin/reservas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass }) })
                      setReservas([])
                    }}
                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    🗑️ Borrar todo
                  </button>
                )}
              </div>
            </div>

            {reservas.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p>No hay consultas aún</p>
              </div>
            ) : vistaReservas === 'pipeline' ? (
              /* VISTA PIPELINE */
              <div className="space-y-4">
                {ETAPAS.map(etapa => {
                  const items = [...reservas].filter((r: any) => (r.etapa || 1) === etapa.id).reverse()
                  return (
                    <div key={etapa.id} className={`rounded-2xl border-2 p-4 ${items.length > 0 ? etapa.bg : 'bg-gray-50 opacity-60'}`}
                      style={{ borderColor: etapa.color + '40' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: etapa.color }} />
                          <span className="font-bold text-gray-700 text-sm">{etapa.label}</span>
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${etapa.badge}`}>{items.length}</span>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">Sin consultas en esta etapa</p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((r: any) => (
                            <div key={r.id || r.email} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-800 text-sm truncate">{r.nombre}</p>
                                  <p className="text-xs text-[#00AEEF] font-medium truncate">{r.paqueteTitulo}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                                    {r.cotizacionEnviada && ' · ✉️ cotiz. enviada'}
                                  </p>
                                </div>
                                <a href={`https://wa.me/54${r.telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${r.nombre}! Te contactamos por ${r.paqueteTitulo}`)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="bg-[#25D366] text-white text-[10px] px-2 py-1 rounded-lg font-bold shrink-0">WA</a>
                              </div>
                              <div className="text-[10px] text-gray-500 flex gap-2 flex-wrap mb-2">
                                <span>📧 {r.email}</span>
                                <span>👥 {r.cantPasajeros}p</span>
                                {r.fechaDeseada && <span>📅 {r.fechaDeseada}</span>}
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                {/* Botón cotizar (solo etapa 1) */}
                                {etapa.id === 1 && (
                                  <button onClick={() => enviarCotizacion(r)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[#00AEEF] text-white hover:bg-[#0090C5] transition">
                                    ✉️ Enviar cotización
                                  </button>
                                )}
                                {/* Mover de etapa */}
                                <select defaultValue=""
                                  onChange={e => { if (e.target.value) cambiarEtapa(r, parseInt(e.target.value)); e.target.value = '' }}
                                  className="text-[10px] border border-gray-200 rounded-lg px-1 py-1 outline-none text-gray-600">
                                  <option value="" disabled>Mover a...</option>
                                  {ETAPAS.filter(e => e.id !== etapa.id).map(e => (
                                    <option key={e.id} value={e.id}>{e.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* VISTA LISTA */
              <div className="space-y-3">
                {[...reservas].reverse().map((r: any, i) => {
                  const etapa = ETAPAS.find(e => e.id === (r.etapa || 1)) || ETAPAS[0]
                  return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{r.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {r.fecha ? new Date(r.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                        <a href={`https://wa.me/54${r.telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${r.nombre}! Te contactamos por ${r.paqueteTitulo}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">WhatsApp</a>
                      </div>
                      <p className="text-sm text-[#00AEEF] font-medium mb-2">{r.paqueteTitulo}</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
                        <span>📧 {r.email}</span>
                        <span>📱 {r.telefono}</span>
                        <span>👥 {r.cantPasajeros} pasajeros</span>
                        {r.fechaDeseada && <span>📅 {r.fechaDeseada}</span>}
                        {r.cotizacionEnviada && <span className="text-green-600">✉️ Cotización enviada</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${etapa.badge}`}>{etapa.label}</span>
                        {r.etapa === 1 && (
                          <button onClick={() => enviarCotizacion(r)}
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-[#00AEEF] text-white">
                            ✉️ Enviar cotización
                          </button>
                        )}
                        <select defaultValue={r.etapa || 1}
                          onChange={e => cambiarEtapa(r, parseInt(e.target.value))}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#00AEEF]">
                          {ETAPAS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )
        })()}

        {/* CAMPAÑAS */}
        {tab === 'campanas' && (() => {
          const ETAPAS_LABELS: Record<number, string> = {
            1: 'Nueva consulta', 2: 'Cotización enviada', 3: 'Confirmado', 4: 'No confirmó', 5: 'Lead frío'
          }
          const [campAsunto, setCampAsunto] = useState('✈️ Tenemos algo especial para vos')
          const [campCuerpo, setCampCuerpo] = useState('Hola {nombre}!\n\nQueremos contarte sobre nuestras últimas salidas disponibles.\n\n¡Escribinos y te armamos un viaje a tu medida!')
          const [campEtapas, setCampEtapas] = useState<number[]>([5])
          const [campPaqueteId, setCampPaqueteId] = useState('')
          const [campEstado, setCampEstado] = useState<'idle'|'enviando'|'ok'|'error'>('idle')
          const [campResultado, setCampResultado] = useState<any>(null)

          const destinatariosCount = (() => {
            const vistos = new Set<string>()
            return reservas.filter(r => {
              const etapa = (r as any).etapa || 1
              if (!campEtapas.includes(etapa)) return false
              if (vistos.has(r.email)) return false
              vistos.add(r.email)
              return true
            }).length
          })()

          return (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">📣 Campañas de email</h2>
              <p className="text-xs text-gray-400">Enviá un email personalizado a tus contactos según su etapa en el CRM.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Config campaña */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 text-sm mb-4">1. ¿A quién enviás?</h3>
                  <div className="space-y-2">
                    {[1,2,3,4,5].map(e => (
                      <label key={e} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={campEtapas.includes(e)}
                          onChange={ev => setCampEtapas(prev => ev.target.checked ? [...prev, e] : prev.filter(x => x !== e))}
                          className="accent-[#00AEEF] w-4 h-4" />
                        <span className="text-sm text-gray-700">{ETAPAS_LABELS[e]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2 text-xs text-[#00AEEF] font-bold">
                    {destinatariosCount} destinatario{destinatariosCount !== 1 ? 's' : ''} (sin duplicados)
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">2. Paquete a destacar (opcional)</h3>
                  <select value={campPaqueteId} onChange={e => setCampPaqueteId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#00AEEF]">
                    <option value="">Sin paquete destacado</option>
                    {paquetes.slice(0,30).map(p => (
                      <option key={p.id} value={p.id}>{p.titulo}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Aparece como card con foto, precio y botón de reserva.</p>
                </div>
              </div>

              {/* Redacción */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">3. Redactá el email</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Asunto</label>
                    <input type="text" value={campAsunto} onChange={e => setCampAsunto(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Mensaje <span className="text-gray-400 font-normal">— usá {'{nombre}'} para personalizar</span>
                    </label>
                    <textarea rows={7} value={campCuerpo} onChange={e => setCampCuerpo(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF] resize-none font-mono" />
                  </div>
                </div>

                <button
                  disabled={campEstado === 'enviando' || destinatariosCount === 0 || !campAsunto.trim()}
                  onClick={async () => {
                    if (!confirm(`¿Enviás "${campAsunto}" a ${destinatariosCount} contactos?`)) return
                    setCampEstado('enviando')
                    setCampResultado(null)
                    const res = await fetch('/api/admin/email-masivo', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pass, etapas: campEtapas, asunto: campAsunto, cuerpo: campCuerpo, paqueteDestacadoId: campPaqueteId || null }),
                    })
                    const d = await res.json()
                    setCampResultado(d)
                    setCampEstado(d.ok ? 'ok' : 'error')
                  }}
                  className="w-full bg-[#00AEEF] text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-50 transition hover:bg-[#0090C5]">
                  {campEstado === 'enviando' ? '⏳ Enviando...' : `📤 Enviar a ${destinatariosCount} contactos`}
                </button>

                {campResultado && (
                  <div className={`rounded-2xl p-4 text-sm text-center ${campResultado.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {campResultado.ok
                      ? `✅ ${campResultado.enviados} emails enviados${campResultado.errores > 0 ? ` · ${campResultado.errores} errores` : ''}`
                      : `❌ ${campResultado.error}`}
                  </div>
                )}
              </div>
            </div>
          </div>
          )
        })()}

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Usuarios registrados</h2>
              <button
                onClick={async () => {
                  setCargandoUsuarios(true)
                  const r = await fetch(`/api/admin/usuarios?pass=${encodeURIComponent(pass)}`)
                  const data = await r.json()
                  setUsuarios(Array.isArray(data) ? data : [])
                  setCargandoUsuarios(false)
                }}
                className="text-[#00AEEF] text-sm font-medium"
              >
                {cargandoUsuarios ? 'Cargando...' : 'Cargar usuarios'}
              </button>
            </div>
            {usuarios.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">👥</p>
                <p>Apretá "Cargar usuarios" para ver la lista</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usuarios.map((u, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{u.nombre || '(sin nombre)'}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                        {u.telefono && <p className="text-xs text-gray-400">📱 {u.telefono}</p>}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${u.rol === 'pasajero' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.rol === 'pasajero' ? '✈️ Pasajero' : '👤 Visitante'}
                      </span>
                    </div>
                    {u.rol !== 'pasajero' && (
                      <button
                        onClick={async () => {
                          await fetch('/api/admin/usuarios', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pass, email: u.email, rol: 'pasajero' }),
                          })
                          setUsuarios(prev => prev.map(x => x.email === u.email ? { ...x, rol: 'pasajero' } : x))
                        }}
                        className="mt-3 text-xs text-[#00AEEF] font-semibold border border-[#00AEEF] rounded-lg px-3 py-1 hover:bg-[#E0F6FF] transition"
                      >
                        Marcar como pasajero ✈️
                      </button>
                    )}
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
