'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('rollagonzalodamian@gmail.com')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState<'password' | 'email'>('password')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const loginConPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/mi-cuenta' })
    setCargando(false)
    if (res?.ok) {
      router.push('/mi-cuenta')
    } else {
      setError('Email o contraseña incorrectos.')
    }
  }

  const loginConEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    const res = await signIn('email', { email, redirect: false, callbackUrl: '/mi-cuenta' })
    setCargando(false)
    if (res?.error) {
      setError('Hubo un error. Intentá de nuevo.')
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

        {enviado ? (
          <div className="mt-4">
            <div className="text-5xl mb-4">📬</div>
            <p className="font-bold text-gray-800 text-lg mb-2">¡Revisá tu email!</p>
            <p className="text-gray-500 text-sm">
              Te mandamos un link a <strong>{email}</strong>.<br />
              Hacé clic en ese link para ingresar.
            </p>
            <p className="text-xs text-gray-400 mt-4">¿No llegó? Revisá la carpeta de spam.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 mt-4">
              <button
                onClick={() => { setModo('password'); setError('') }}
                className={`flex-1 py-2 text-sm font-bold transition ${modo === 'password' ? 'text-white' : 'text-gray-500 bg-gray-50'}`}
                style={modo === 'password' ? { backgroundColor: '#00AEEF' } : {}}
              >
                🔑 Contraseña
              </button>
              <button
                onClick={() => { setModo('email'); setError('') }}
                className={`flex-1 py-2 text-sm font-bold transition ${modo === 'email' ? 'text-white' : 'text-gray-500 bg-gray-50'}`}
                style={modo === 'email' ? { backgroundColor: '#00AEEF' } : {}}
              >
                📧 Link por email
              </button>
            </div>

            {modo === 'password' ? (
              <form onSubmit={loginConPassword}>
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF] mb-3"
                />
                <input
                  type="password"
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00AEEF] mb-3"
                />
                {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                  style={{ backgroundColor: '#00AEEF' }}
                >
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            ) : (
              <form onSubmit={loginConEmail}>
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
                  disabled={cargando}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                  style={{ backgroundColor: '#00AEEF' }}
                >
                  {cargando ? 'Enviando...' : 'Enviar link de acceso'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
