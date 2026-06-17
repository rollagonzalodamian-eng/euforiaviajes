import Link from 'next/link'

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[#E0F6FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">¡Solicitud enviada!</h1>
        <p className="text-gray-500 mb-6">
          Recibimos tu pre-reserva. Un asesor de <strong>Euforia Viajes</strong> te va a contactar en menos de 24 horas por email o WhatsApp para confirmar disponibilidad y coordinar el pago.
        </p>
        <div className="bg-[#E0F6FF] rounded-xl p-4 mb-6 text-sm text-[#0090C5]">
          <p className="font-semibold mb-1">¿Necesitás respuesta urgente?</p>
          <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
            className="font-bold underline">
            Escribinos por WhatsApp →
          </a>
        </div>
        <Link href="/"
          className="block w-full text-white font-bold py-3 rounded-xl transition"
          style={{ backgroundColor: '#00AEEF' }}>
          Ver más paquetes
        </Link>
      </div>
    </div>
  )
}
