import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros · Euforia Viajes',
  description: 'Conocé al equipo de Euforia Viajes. Más de 10 años organizando viajes grupales desde la Patagonia con pasión y experiencia.',
}

const VALORES = [
  { emoji: '❤️', titulo: 'Pasión por viajar', desc: 'Somos viajeros antes que vendedores. Cada paquete lo diseñamos pensando en la experiencia real.' },
  { emoji: '🛡️', titulo: 'Respaldo total', desc: 'Legajo 16816 habilitado. Tu dinero y tu viaje están protegidos en todo momento.' },
  { emoji: '🤝', titulo: 'Trato personalizado', desc: 'No somos un bot. Te atiende una persona real que conoce cada destino.' },
  { emoji: '📍', titulo: 'Raíces patagónicas', desc: 'Nacimos en Trelew y crecimos viajando desde la Patagonia al mundo entero.' },
]

const HITOS = [
  { año: '2015', texto: 'Fundamos Euforia Viajes en Trelew con la idea de hacer viajar accesible a todos.' },
  { año: '2017', texto: 'Primeros viajes internacionales grupales a Brasil y Cancún.' },
  { año: '2019', texto: 'Superamos los 1.000 pasajeros y ampliamos el equipo.' },
  { año: '2022', texto: 'Lanzamos salidas desde toda la Patagonia con coordinador propio.' },
  { año: '2025', texto: 'Más de 5.000 viajeros y 327 paquetes activos en todo el país y el mundo.' },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-[#f5f9fd]">

      {/* Hero */}
      <section className="relative text-white py-20 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=60&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-5 backdrop-blur-sm">
            ✈️ Desde 2015 · Legajo 16816
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Somos Euforia Viajes</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Un equipo de 6 personas apasionadas por los viajes, con base en Trelew, Patagonia. Hace más de 10 años ayudamos a familias, amigos y parejas a vivir experiencias inolvidables.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">

        {/* Quiénes somos */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">¿Quiénes somos?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Euforia Viajes nació en 2015 con una convicción simple: <strong>viajar tiene que ser fácil, accesible y lleno de alegría</strong>. Lo que empezó como un proyecto pequeño hoy es una agencia con más de 5.000 pasajeros y presencia en toda la Patagonia.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Somos un equipo de 6 personas — asesores, coordinadores y guías — que trabajamos para que cada viaje sea perfecto desde la primera consulta hasta el regreso a casa.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-[#E0F6FF] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#00AEEF]">10+</p>
                <p className="text-xs text-gray-600 font-semibold">años de experiencia</p>
              </div>
              <div className="bg-[#E0F6FF] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#00AEEF]">5.000+</p>
                <p className="text-xs text-gray-600 font-semibold">pasajeros felices</p>
              </div>
              <div className="bg-[#E0F6FF] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#00AEEF]">6</p>
                <p className="text-xs text-gray-600 font-semibold">personas en el equipo</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl h-72 md:h-96">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop"
              alt="Equipo Euforia Viajes"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Valores */}
        <section>
          <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">Lo que nos define</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALORES.map(v => (
              <div key={v.titulo} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <span className="text-4xl shrink-0">{v.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">{v.titulo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Historia */}
        <section>
          <h2 className="text-3xl font-black text-gray-800 mb-8 text-center">Nuestra historia</h2>
          <div className="relative border-l-2 border-[#00AEEF] pl-8 space-y-8 ml-4">
            {HITOS.map(h => (
              <div key={h.año} className="relative">
                <div className="absolute -left-11 w-6 h-6 rounded-full bg-[#00AEEF] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-xs font-black text-[#00AEEF] uppercase tracking-widest">{h.año}</span>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{h.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dónde estamos */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6">📍 Dónde encontrarnos</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="font-bold text-gray-800">Oficina central</p>
                  <p className="text-gray-600 text-sm">Fontana 243, Trelew, Chubut</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold text-gray-800">WhatsApp</p>
                  <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
                    className="text-[#25D366] font-semibold text-sm hover:underline">+54 280 432-1400</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="font-bold text-gray-800">Email</p>
                  <a href="mailto:adm@viajaconeuforia.com" className="text-[#00AEEF] font-semibold text-sm hover:underline">
                    adm@viajaconeuforia.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🪪</span>
                <div>
                  <p className="font-bold text-gray-800">Habilitación</p>
                  <p className="text-gray-600 text-sm">Legajo LADEVI N° 16816</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-56 bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2989.8!2d-65.3044!3d-43.2489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDE0JzU2LjAiUyA2NcKwMTgnMTUuOCJX!5e0!3m2!1ses!2sar!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-[#00AEEF] to-[#0078B4] rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-black mb-3">¿Listo para tu próxima aventura?</h2>
          <p className="opacity-90 mb-6">Contactanos y armamos el viaje perfecto para vos.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/salidas"
              className="bg-white text-[#00AEEF] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition">
              Ver paquetes →
            </Link>
            <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-green-500 transition">
              💬 WhatsApp
            </a>
          </div>
        </section>

      </div>

      <footer className="text-white mt-4 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
