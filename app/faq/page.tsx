'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import type { Metadata } from 'next'

const FAQS = [
  {
    categoria: '✈️ Reservas y pagos',
    preguntas: [
      {
        q: '¿Cómo hago una reserva?',
        a: 'Podés reservar directamente desde nuestra web eligiendo el paquete que te interesa y completando el formulario de pre-reserva. También podés escribirnos por WhatsApp al 280 432-1400 y un asesor te guía en el proceso.',
      },
      {
        q: '¿Cuánto tengo que pagar para reservar?',
        a: 'Para confirmar tu lugar solo necesitás abonar una seña del 15% del valor total del paquete. El saldo restante se abona antes de la fecha de salida según las condiciones de cada programa.',
      },
      {
        q: '¿Cómo puedo pagar?',
        a: 'Aceptamos pago con tarjeta de crédito o débito (hasta 12 cuotas), transferencia bancaria, efectivo y Mercado Pago. Los pagos en efectivo y transferencia no tienen recargo adicional.',
      },
      {
        q: '¿Puedo pagar en cuotas?',
        a: 'Sí, ofrecemos financiación en hasta 12 cuotas con tarjeta de crédito. Las cuotas tienen el interés propio de cada tarjeta. Consultanos para conocer las opciones disponibles al momento de tu reserva.',
      },
    ],
  },
  {
    categoria: '📦 Qué incluyen los paquetes',
    preguntas: [
      {
        q: '¿Qué incluye el precio del paquete?',
        a: 'Todos nuestros paquetes incluyen hotelería con desayuno, transporte (bus o aéreo según el programa), coordinador de viaje y seguro de asistencia. Los paquetes aéreos además incluyen traslados in/out del aeropuerto.',
      },
      {
        q: '¿Las excursiones están incluidas?',
        a: 'Las excursiones son opcionales y tienen costo aparte, salvo que el programa indique expresamente lo contrario. Nuestros coordinadores te ayudan a organizarlas en destino.',
      },
      {
        q: '¿Incluye seguro de viaje?',
        a: 'Sí, todos los paquetes incluyen seguro de asistencia al viajero con cobertura médica básica. Para viajes internacionales recomendamos contratar un seguro adicional con mayor cobertura.',
      },
      {
        q: '¿Qué tipo de habitaciones tienen los hoteles?',
        a: 'Los hoteles tienen habitaciones dobles, triples y cuádruples con baño privado. Si viajás solo te asignamos habitación individual (puede tener un suplemento). Podés indicar tu preferencia al momento de la reserva.',
      },
    ],
  },
  {
    categoria: '❌ Cancelaciones',
    preguntas: [
      {
        q: '¿Puedo cancelar mi reserva?',
        a: 'Sí, podés cancelar notificándonos por escrito. Las penalidades dependen de cuánto tiempo falta para la salida: más de 30 días (10%), entre 30 y 16 días (25%), entre 15 días y 72 horas (50%), menos de 72 horas (100%). Para paquetes aéreos aplican condiciones especiales por los boletos.',
      },
      {
        q: '¿Qué pasa si Euforia cancela el viaje?',
        a: 'Si cancelamos el viaje por falta de inscriptos u otro motivo, te avisamos con al menos 7 días de anticipación y te ofrecemos la opción de pasarte a la próxima salida disponible o recibir el reembolso completo de lo abonado.',
      },
      {
        q: '¿Puedo cambiar la fecha de mi reserva?',
        a: 'Los cambios de fecha están sujetos a disponibilidad y pueden tener un costo administrativo. Para paquetes aéreos, una vez emitido el boleto no se admiten cambios de fecha. Consultanos a tiempo para evaluar opciones.',
      },
    ],
  },
  {
    categoria: '📄 Documentación',
    preguntas: [
      {
        q: '¿Qué documentos necesito para viajar?',
        a: 'Para destinos nacionales necesitás DNI vigente. Para viajes internacionales necesitás pasaporte vigente (con al menos 6 meses de validez desde la fecha de regreso). Algunos destinos requieren visa — consultanos según tu destino.',
      },
      {
        q: '¿Los menores pueden viajar?',
        a: 'Los menores deben viajar acompañados por al menos un adulto responsable. Para viajes al exterior con un solo padre o tutor, puede ser necesaria la autorización del otro progenitor. Consultanos con anticipación para preparar la documentación.',
      },
      {
        q: '¿Necesito vacunas para viajar?',
        a: 'Depende del destino. Algunos países tropicales exigen vacuna contra la fiebre amarilla. Te informamos los requisitos específicos de cada destino al momento de la reserva.',
      },
    ],
  },
  {
    categoria: '🌍 Destinos y salidas',
    preguntas: [
      {
        q: '¿Desde qué ciudades salen los viajes?',
        a: 'La mayoría de nuestros viajes en bus salen desde Trelew y Puerto Madryn. Algunos programas tienen salida desde otras ciudades de la Patagonia. Los viajes aéreos salen desde el aeropuerto más cercano según disponibilidad.',
      },
      {
        q: '¿Con qué frecuencia hay salidas?',
        a: 'Cada destino tiene su propio calendario de salidas. Podés ver todas las fechas disponibles en nuestra sección de Salidas Grupales. También podemos armar salidas especiales para grupos de 10 personas o más.',
      },
      {
        q: '¿Puedo armar un viaje a medida?',
        a: 'Sí. Usá nuestra herramienta "Armá tu Viaje" para contarnos tus preferencias y te preparamos una propuesta personalizada. También podés escribirnos directamente por WhatsApp.',
      },
    ],
  },
]

export default function FaqPage() {
  const { data: session, status } = useSession()
  const [abierta, setAbierta] = useState<string | null>(null)

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f9fd]">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f9fd] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❓</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Contenido exclusivo</h2>
        <p className="text-gray-500 mb-6">Iniciá sesión con Google para ver las preguntas frecuentes de Euforia Viajes.</p>
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Preguntas Frecuentes</h1>
          <p className="opacity-80 text-sm">Todo lo que necesitás saber antes de reservar tu viaje</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {FAQS.map(cat => (
          <div key={cat.categoria}>
            <h2 className="font-black text-gray-800 text-lg mb-4">{cat.categoria}</h2>
            <div className="space-y-2">
              {cat.preguntas.map(faq => {
                const id = faq.q
                const open = abierta === id
                return (
                  <div key={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setAbierta(open ? null : id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                      <span className={`text-[#00AEEF] text-lg shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {open && (
                      <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#00AEEF] to-[#0078B4] rounded-3xl p-8 text-white text-center">
          <h3 className="font-black text-xl mb-2">¿No encontraste tu respuesta?</h3>
          <p className="opacity-90 text-sm mb-5">Escribinos y te respondemos en minutos.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-500 transition">
              💬 WhatsApp
            </a>
            <Link href="/contacto"
              className="bg-white text-[#00AEEF] font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition">
              Formulario de contacto
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-white mt-4 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
