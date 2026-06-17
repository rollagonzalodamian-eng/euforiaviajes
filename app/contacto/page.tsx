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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-gray-800 mb-1">Contacto</h1>
        <p className="text-gray-500 text-sm mb-8">Escribinos y te respondemos en menos de 24 horas.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl">💬</div>
            <div>
              <p className="font-bold text-gray-800">WhatsApp</p>
              <p className="text-sm text-gray-500">280 432-1400</p>
            </div>
          </a>
          <a href="mailto:adm@viajaconeuforia.com"
            className="flex items-center gap-4 bg-white rounded-2xl shadow p-5 hover:shadow-md transition">
            <div className="w-12 h-12 bg-[#00AEEF] rounded-full flex items-center justify-center text-white text-2xl">📧</div>
            <div>
              <p className="font-bold text-gray-800">Email</p>
              <p className="text-sm text-gray-500">adm@viajaconeuforia.com</p>
            </div>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-4">Envianos un mensaje</h2>
          {estado === 'ok' ? (
            <div className="text-center py-8">
              <p className="text-5xl mb-3">✅</p>
              <p className="font-bold text-gray-700 text-lg">¡Mensaje enviado!</p>
              <p className="text-gray-400 text-sm mt-1">Te respondemos a la brevedad por email o WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                  <input type="text" required value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono / WhatsApp</label>
                  <input type="tel" required value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">¿En qué te podemos ayudar?</label>
                <textarea required rows={4} value={form.consulta}
                  onChange={e => setForm(f => ({ ...f, consulta: e.target.value }))}
                  placeholder="Contanos a dónde querés viajar, cuántas personas, fechas aproximadas..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00AEEF] resize-none" />
              </div>
              {estado === 'error' && <p className="text-red-500 text-xs">Hubo un error. Intentá por WhatsApp.</p>}
              <button type="submit" disabled={estado === 'enviando'}
                className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                style={{ backgroundColor: '#00AEEF' }}>
                {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
