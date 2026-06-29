'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function CuentaPage() {
  const { data: session, status } = useSession()
  const [perfil, setPerfil] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/auth/perfil')
        .then(r => r.json())
        .then(data => { setPerfil(data); setCargando(false) })
        .catch(() => setCargando(false))
    } else if (status === 'unauthenticated') {
      setCargando(false)
    }
  }, [status])

  if (status === 'loading' || cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#00AEEF] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Mi cuenta</h1>
          <p className="text-gray-500 text-sm mb-6">Iniciá sesión para ver tu viaje, voucher e itinerario</p>
          <button
            onClick={() => signIn()}
            className="w-full bg-[#00AEEF] text-white py-3 rounded-xl font-bold hover:bg-[#0090C5] transition"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  const viaje = perfil?.viajeAsignado
  const puntos = perfil?.puntos || 0

  function imprimirVoucher() {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher ${viaje?.nroVoucher || ''} - Euforia Viajes</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #00AEEF, #0078B4); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; }
          .voucher-num { font-size: 28px; font-weight: 900; letter-spacing: 2px; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
          .label { color: #777; }
          .val { font-weight: bold; }
          .estado { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-top: 16px; }
          .footer { margin-top: 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <p style="margin:0;opacity:.8;font-size:12px">VOUCHER DE VIAJE</p>
          <div class="voucher-num">${viaje?.nroVoucher || 'EUF-0000'}</div>
          <p style="margin:0;font-size:13px">Euforia Viajes</p>
        </div>
        <div class="row"><span class="label">Pasajero</span><span class="val">${perfil?.nombre || session?.user?.name || ''}</span></div>
        <div class="row"><span class="label">Email</span><span class="val">${session?.user?.email || ''}</span></div>
        <div class="row"><span class="label">Destino</span><span class="val">${viaje?.paqueteTitulo || ''}</span></div>
        <div class="row"><span class="label">Fecha de salida</span><span class="val">${viaje?.fechaSalida || ''}</span></div>
        <div class="row"><span class="label">Pasajeros</span><span class="val">${viaje?.cantPasajeros || 1}</span></div>
        <div class="row"><span class="label">Estado</span><span class="val">${viaje?.estado || 'pendiente'}</span></div>
        <div style="text-align:center"><span class="estado">✓ ${viaje?.estado === 'confirmado' ? 'Reserva Confirmada' : viaje?.estado === 'pagado' ? 'Pagado' : 'Pendiente de confirmación'}</span></div>
        <div class="footer">
          Euforia Viajes · Fontana 243, Trelew · Leg. LADEVI 16816<br/>
          viajaconeuforia.com · +54 280 432-1400
        </div>
      </body>
      </html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00AEEF] text-white px-4 py-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Mi cuenta</h1>
            <p className="text-white/80 text-sm">{perfil?.nombre || session.user?.name}</p>
          </div>
          <button onClick={() => signOut()} className="text-white/80 text-sm border border-white/30 rounded-lg px-3 py-1">
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Sección 1 — Mi información */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">👤</span> Mi información
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nombre</span>
              <span className="font-semibold">{perfil?.nombre || session.user?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold text-right">{session.user?.email}</span>
            </div>
            {perfil?.telefono && (
              <div className="flex justify-between">
                <span className="text-gray-500">Teléfono</span>
                <span className="font-semibold">{perfil.telefono}</span>
              </div>
            )}
            {perfil?.ciudad && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ciudad</span>
                <span className="font-semibold">{perfil.ciudad}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección 2 — Mi viaje */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">✈️</span> Mi viaje
          </h2>
          {viaje?.paqueteTitulo ? (
            <div>
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-[#00AEEF] text-lg leading-tight">{viaje.paqueteTitulo}</h3>
                <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                  viaje.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                  viaje.estado === 'pagado' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {viaje.estado === 'confirmado' ? '✓ Confirmado' : viaje.estado === 'pagado' ? '💳 Pagado' : '⏳ Pendiente'}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {viaje.fechaSalida && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">📅 Fecha de salida</span>
                    <span className="font-semibold">{viaje.fechaSalida}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">👥 Pasajeros</span>
                  <span className="font-semibold">{viaje.cantPasajeros || 1}</span>
                </div>
                {viaje.nroVoucher && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">🎫 Nro. voucher</span>
                    <span className="font-semibold font-mono">{viaje.nroVoucher}</span>
                  </div>
                )}
              </div>
              <button
                onClick={imprimirVoucher}
                className="w-full bg-[#00AEEF] text-white font-bold py-3 rounded-xl hover:bg-[#0090C5] transition flex items-center justify-center gap-2"
              >
                🎫 Descargar / Imprimir voucher
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-sm">Aún no tenés un viaje asignado.</p>
              <a
                href="https://wa.me/542804321400"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-[#25D366] text-white text-sm font-bold px-5 py-2 rounded-xl"
              >
                💬 Consultanos por WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Sección 3 — Mi itinerario */}
        {viaje?.itinerario && (
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📋</span> Mi itinerario
            </h2>
            {viaje.itinerario.startsWith('http') ? (
              <a
                href={viaje.itinerario}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 text-[#00AEEF] font-semibold hover:bg-blue-100 transition"
              >
                <span className="text-2xl">📄</span>
                <span>Ver itinerario completo ↗</span>
              </a>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {viaje.itinerario}
              </div>
            )}
          </div>
        )}

        {/* Sección 4 — Mis puntos */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">⭐</span> Mis puntos
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 rounded-2xl px-6 py-4 text-center flex-1">
              <p className="text-4xl font-black text-yellow-500">{puntos}</p>
              <p className="text-xs text-gray-500 mt-1">puntos acumulados</p>
            </div>
            <p className="text-sm text-gray-500 flex-1">
              Acumulás puntos con cada viaje. ¡Canjeálos por descuentos en tu próxima aventura!
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
