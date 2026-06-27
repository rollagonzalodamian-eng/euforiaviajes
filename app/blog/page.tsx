'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

type Post = {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  date: string
  link: string
  featured_media: number
  _embedded?: any
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&hellip;/g, '...').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").trim()
}

function formatFecha(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('https://viajaconeuforia.com/wp-json/wp/v2/posts?per_page=12&_embed&orderby=date&order=desc')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data)
        else setError(true)
        setCargando(false)
      })
      .catch(() => { setError(true); setCargando(false) })
  }, [session])

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f9fd]">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f9fd] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✈️</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Contenido exclusivo</h2>
        <p className="text-gray-500 mb-6">Iniciá sesión con Google para acceder al blog de Euforia Viajes.</p>
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 font-semibold text-gray-700 shadow hover:shadow-md transition"
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.1C12.9 13.2 18 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/><path fill="#FBBC05" d="M10.9 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.4 10.7l8.5-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.7 2.3-6 0-11.1-4-12.9-9.4l-7.9 6.1C6.9 42.6 14.8 48 24 48z"/></svg>
          Continuar con Google
        </button>
        <p className="text-xs text-gray-400 mt-4">Solo necesitás una cuenta de Google.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Hero */}
      <section className="text-white py-12 px-4" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Blog de viajes</p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Inspiración para tu próximo viaje</h1>
          <p className="opacity-80 text-sm">Consejos, destinos y novedades de Euforia Viajes</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {cargando && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📡</p>
            <p className="font-bold text-gray-700 mb-2">No se pudieron cargar los artículos</p>
            <p className="text-gray-400 text-sm mb-5">Visitá el blog directamente en nuestra web</p>
            <a href="https://viajaconeuforia.com/blogs/" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-[#00AEEF] text-white font-bold px-6 py-3 rounded-xl text-sm">
              Ver blog completo →
            </a>
          </div>
        )}

        {!cargando && !error && posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">No hay artículos publicados aún.</div>
        )}

        {!cargando && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(post => {
              const imagen = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
              const titulo = stripHtml(post.title.rendered)
              const extracto = stripHtml(post.excerpt.rendered).slice(0, 120) + '...'
              return (
                <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col group">
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {imagen ? (
                      <img src={imagen} alt={titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">✈️</div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-2">{formatFecha(post.date)}</p>
                    <h2 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#00AEEF] transition">
                      {titulo}
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed flex-1">{extracto}</p>
                    <span className="mt-3 text-xs font-bold text-[#00AEEF]">Leer más →</span>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {!cargando && posts.length > 0 && (
          <div className="text-center mt-10">
            <a href="https://viajaconeuforia.com/blogs/" target="_blank" rel="noopener noreferrer"
              className="inline-block border-2 border-[#00AEEF] text-[#00AEEF] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#E0F6FF] transition">
              Ver todos los artículos →
            </a>
          </div>
        )}
      </div>

      <footer className="text-white mt-4 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
