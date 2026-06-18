'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const res = await signIn('email', { email, redirect: false, callbackUrl: '/mi-cuenta' })
    if (res?.error) {
      setError('Hubo un error. Intentá de nuevo.')
      setEnviando(false)
    } else {
      setEnviado(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f9fd] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-[#E0F6FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✈️</span>
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-1">Ingresá a tu cuenta</h1>
        <p className="text-gray-400 text-sm mb-8">Te enviamos un link a tu email para entrar sin contraseña.</p>

        {enviado ? (
          <div>
            <div className="text-5xl mb-4">📬</div>
            <p className="font-bold text-gray-800 text-lg mb-2">¡Revisá tu email!</p>
            <p className="text-gray-500 text-sm">
              Te mandamos un link a <strong>{email}</strong>.<br />
              Hacé clic en ese link para ingresar.
            </p>
            <p className="text-xs text-gray-400 mt-4">¿No llegó? Revisá la carpeta de spam.</p>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF] mb-3"
            />
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
              style={{ backgroundColor: '#00AEEF' }}
            >
              {enviando ? 'Enviando...' : 'Enviar link de acceso'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
