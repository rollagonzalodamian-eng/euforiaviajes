'use client'
import { useState } from 'react'

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', consulta: '' })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('enviando')
    const res = await fetch('/api/prereserva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cantPasajeros: 1,
        mensaje: form.consulta,
        paqueteTitulo: 'Consulta general',
        paqueteId: 'contacto',
      }),
    })
    setEstado(res.ok ? 'ok' : 'error')
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd]">

      {/* Hero */}
      <section className="text-white py-12 px-4" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Contacto</h1>
          <p className="opacity-80 text-sm">Estamos disponibles 24hs para ayudarte a planear tu próximo viaje.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        {/* Canales de contacto */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '💬', titulo: 'WhatsApp', valor: '280 432-1400', href: 'https://wa.me/542804321400', color: '#25D366' },
            { icon: '📧', titulo: 'Email', valor: 'adm@viajaconeuforia.com', href: 'mailto:adm@viajaconeuforia.com', color: '#00AEEF' },
            { icon: '📍', titulo: 'Oficina', valor: 'Fontana 243, Trelew', href: 'https://maps.google.com/?q=Fontana+243+Trelew+Chubut', color: '#F59E0B' },
            { icon: '🕐', titulo: 'Atención', valor: 'Las 24 horas', href: null, color: '#8B5CF6' },
          ].map(c => (
            <div key={c.titulo} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3" style={{ backgroundColor: c.color + '20' }}>
                {c.icon}
              </div>
              <p className="font-bold text-gray-800 text-sm">{c.titulo}</p>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                  className="text-xs mt-0.5 hover:underline" style={{ color: c.color }}>
                  {c.valor}
                </a>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">{c.valor}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-black text-gray-800 text-lg mb-5">Envianos un mensaje</h2>
            {estado === 'ok' ? (
              <div className="text-center py-10">
                <p className="text-5xl mb-3">✅</p>
                <p className="font-bold text-gray-700 text-lg">¡Mensaje enviado!</p>
                <p className="text-gray-400 text-sm mt-1">Te respondemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                    <input type="text" required value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono</label>
                    <input type="tel" required value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">¿En qué te podemos ayudar?</label>
                  <textarea required rows={4} value={form.consulta}
                    onChange={e => setForm(f => ({ ...f, consulta: e.target.value }))}
                    placeholder="Contanos a dónde querés viajar, cuántas personas, fechas..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#00AEEF] resize-none" />
                </div>
                {estado === 'error' && <p className="text-red-500 text-xs">Hubo un error. Intentá por WhatsApp.</p>}
                <button type="submit" disabled={estado === 'enviando'}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                  style={{ backgroundColor: '#00AEEF' }}>
                  {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje →'}
                </button>
              </form>
            )}
          </div>

          {/* Mapa + info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2989.8!2d-65.3044!3d-43.2489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE0JzU2LjAiUyA2NcKwMTgnMTUuOCJX!5e0!3m2!1ses!2sar!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="font-bold text-gray-800">📍 Dónde estamos</h3>
              <p className="text-sm text-gray-600">Fontana 243, Trelew, Chubut, Argentina</p>
              <div className="border-t pt-3">
                <h3 className="font-bold text-gray-800 mb-1">🕐 Horario de atención</h3>
                <p className="text-sm text-gray-600">Las 24 horas por WhatsApp</p>
                <p className="text-xs text-gray-400 mt-1">Respuesta garantizada en menos de 24hs</p>
              </div>
              <div className="border-t pt-3">
                <h3 className="font-bold text-gray-800 mb-1">🪪 Habilitación</h3>
                <p className="text-sm text-gray-600">Legajo LADEVI N° 16816</p>
              </div>
              <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 rounded-xl text-sm hover:bg-green-500 transition">
                💬 Escribir por WhatsApp ahora
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-white mt-4 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
