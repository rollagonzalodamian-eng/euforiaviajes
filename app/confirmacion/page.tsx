'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmacionContent() {
  const params = useSearchParams()
  const paquete = params.get('paquete') || ''
  const nombre = params.get('nombre') || ''

  const urlPaquete = `https://app.viajaconeuforia.com${paquete ? '' : ''}`
  const textoWA = `¡Hola! Acabo de consultar por un viaje con Euforia Viajes${paquete ? ` — ${paquete}` : ''}. ¡Los recomiendo!`
  const textoEmail = `Hola!\n\nAcabo de consultar con Euforia Viajes${paquete ? ` sobre el paquete "${paquete}"` : ''}.\n\nTe dejo el link para que veas sus paquetes: https://app.viajaconeuforia.com\n\n¡Son muy buenos!`
  const asuntoEmail = `Te recomiendo Euforia Viajes${paquete ? ` — ${paquete}` : ''}`

  return (
    <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">
          ¡{nombre ? `${nombre.split(' ')[0]}, listo` : 'Listo'}!
        </h1>
        <p className="text-gray-500 mb-2 text-sm">
          Recibimos tu consulta{paquete ? ` sobre <strong>${paquete}</strong>` : ''}.
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          Un asesor de <strong>Euforia Viajes</strong> te contacta en menos de 24 horas por email o WhatsApp.
        </p>

        {/* Pasos */}
        <div className="bg-[#f5f9fd] rounded-xl p-4 mb-6 text-left space-y-3">
          {[
            ['1', '📧', 'Revisá tu email', 'Te llega la cotización por mail.'],
            ['2', '💬', 'WhatsApp de confirmación', 'Te escribimos para coordinar el pago de la seña.'],
            ['3', '🎒', '¡A viajar!', 'Con todo organizado y sin sorpresas.'],
          ].map(([n, ico, titulo, desc]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#00AEEF' }}>{n}</span>
              <div>
                <p className="font-bold text-gray-700 text-sm">{ico} {titulo}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp urgente */}
        <a href={`https://wa.me/542804321400?text=${encodeURIComponent('Hola! Acabo de enviar una consulta por ' + (paquete || 'un paquete') + '. ¿Me podés dar más info?')}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full font-bold py-3 rounded-xl mb-3 text-white transition"
          style={{ backgroundColor: '#25D366' }}>
          💬 WhatsApp urgente
        </a>

        {/* Compartir */}
        <div className="border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 font-semibold mb-2">¿Conocés a alguien que quiera viajar? Compartí</p>
          <div className="flex gap-2">
            <a href={`https://wa.me/?text=${encodeURIComponent(textoWA + '\n\nhttps://app.viajaconeuforia.com')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs font-bold py-2 rounded-lg text-white text-center" style={{ backgroundColor: '#25D366' }}>
              📤 WhatsApp
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(asuntoEmail)}&body=${encodeURIComponent(textoEmail)}`}
              className="flex-1 text-xs font-bold py-2 rounded-lg text-white text-center" style={{ backgroundColor: '#00AEEF' }}>
              📧 Email
            </a>
          </div>
        </div>

        <Link href="/"
          className="block w-full text-[#00AEEF] font-bold py-3 rounded-xl transition border border-[#00AEEF] hover:bg-[#E0F6FF] text-sm">
          Ver más paquetes →
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Cargando...</p></div>}>
      <ConfirmacionContent />
    </Suspense>
  )
}
