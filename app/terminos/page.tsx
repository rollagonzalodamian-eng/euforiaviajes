import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Euforia Viajes',
  description: 'Condiciones Generales de Contratación de Euforia Viajes. Legajo 16816.',
}

const CLAUSULAS = [
  {
    num: '1',
    titulo: 'Servicios Incluidos',
    texto: `Transporte: Desde el punto de origen al punto de destino y regreso, en unidades con asientos reclinables, ventanilla panorámica, música funcional y aire acondicionado, cuando así lo especifique el programa contratado. Para excursiones y visitas locales, las características del vehículo podrán variar según disponibilidad.

Alojamiento: En habitaciones con baño privado del tipo contratado (doble, triple o cuádruple), con impuestos incluidos. El alojamiento estará disponible a partir de las 14:00 hs. del día de llegada hasta las 10:00 hs. del día de salida. En caso de que, por razones de fuerza mayor o sobreventa, sea necesario reemplazar el hotel asignado por otro de igual categoría, el pasajero no tendrá derecho a descuento alguno. Si la categoría del hotel de reemplazo fuera inferior, se efectuará el reembolso de las diferencias correspondientes.

Desayuno y Comidas: Según lo especificado en cada programa. El organizador no se responsabiliza por la calidad, variedad o cantidad de los servicios de comida prestados por terceros.

Excursiones: Las incluidas expresamente en el itinerario contratado. Cualquier excursión adicional será considerada un servicio extra y tendrá costo aparte.

Guía y Asistencia: Cuando el programa lo contemple, se dispondrá de guía o acompañante de viaje durante el recorrido principal.`,
  },
  {
    num: '2',
    titulo: 'Menores de Edad',
    texto: `Los menores de edad deberán viajar acompañados por al menos un adulto responsable. Los menores no abonarán tarifa de adulto únicamente cuando el programa contemple expresamente una tarifa diferencial para menores; de lo contrario, abonarán el precio completo. En caso de que los datos del menor no coincidan con los consignados en la reserva, el organizador podrá exigir el pago de la tarifa completa antes del inicio del viaje, o bien considerar la reserva como no efectuada, aplicándose las penalidades por desistimiento con menos de 7 días de anticipación.`,
  },
  {
    num: '3',
    titulo: 'Equipaje',
    texto: `Cada pasajero podrá transportar hasta dos piezas de equipaje: una maleta de bodega de hasta 20 kg y un bolso de mano. El exceso de equipaje será aceptado únicamente si la capacidad del vehículo lo permite y podrá tener un costo adicional. El equipaje viaja por cuenta y riesgo exclusivo del pasajero. El organizador no asume responsabilidad alguna por pérdidas, daños, robos o deterioros del equipaje, cualquiera sea su causa.`,
  },
  {
    num: '4',
    titulo: 'Documentación',
    texto: `La obtención y vigencia de toda documentación requerida para el viaje (DNI, pasaporte, visas, certificados de vacunación u otros) es responsabilidad exclusiva del pasajero. En caso de que un pasajero no pudiera iniciar el viaje o debiera abandonarlo por problemas de documentación, deberá abonar igualmente el total de los servicios contratados, sin derecho a reintegro, crédito ni reprogramación.`,
  },
  {
    num: '5',
    titulo: 'Alteraciones y Modificaciones del Itinerario',
    texto: `El organizador se reserva el derecho de modificar el orden del recorrido o reemplazar excursiones por otras de características similares, cuando circunstancias operativas o de fuerza mayor así lo requieran. Si la modificación implicara una reducción en la cantidad de días del tour, se reembolsará al pasajero el valor proporcional correspondiente a los servicios no prestados. En ningún caso el pasajero podrá exigir prórroga, diferimiento o extensión del programa originalmente contratado.`,
  },
  {
    num: '6',
    titulo: 'Inscripción y Aceptación de Condiciones',
    texto: `Se considerará formalmente inscripto al pasajero una vez que haya efectuado el pago de la seña o acordado las condiciones de pago con el organizador. La inscripción implica la aceptación plena e incondicional de todas las cláusulas establecidas en las presentes Condiciones Generales.`,
  },
  {
    num: '7',
    titulo: 'Cancelación por parte del Organizador',
    texto: `El organizador se reserva el derecho de cancelar cualquier salida cuando el número de inscriptos no sea suficiente para su realización, notificando al pasajero con una anticipación mínima de 7 días previos a la fecha de salida. En tal caso, el pasajero podrá optar por trasladarse a la próxima salida disponible o recibir la devolución íntegra del importe abonado. No corresponderá indemnización ni compensación adicional.`,
  },
  {
    num: '8',
    titulo: 'Desistimiento por parte del Pasajero',
    texto: `Toda cancelación deberá ser notificada por escrito al organizador. Las penalidades aplicables son:

Programas Grupales en Bus:
• Más de 30 días de anticipación: retención del 10% (+ IVA) del valor total.
• Entre 30 y 16 días: retención del 25% (+ IVA).
• Entre 15 días y 72 horas: retención del 50% (+ IVA).
• Menos de 72 horas o sin aviso: retención del 100%. No se efectuará devolución.

Programas Grupales Aéreos:
• Desde la seña hasta 45 días previos: se retiene la seña (30% de la reserva).
• Entre 45 y 30 días previos: se cobra la tarifa aérea vigente (los pasajes aéreos grupales no admiten devolución).
• Menos de 30 días: se cobra la tarifa aérea más penalidades de prestadores terrestres.`,
  },
  {
    num: '9',
    titulo: 'Reembolso',
    texto: `Toda reclamación de reembolso deberá ser presentada por escrito ante la agencia dentro de los 30 días corridos posteriores a la finalización del tour, acompañada de los comprobantes correspondientes. Vencido dicho plazo, no se atenderá reclamo alguno. No se efectuará reembolso por servicios incluidos que el pasajero no haya utilizado por decisión propia.`,
  },
  {
    num: '10',
    titulo: 'Responsabilidad del Organizador',
    texto: `Euforia Viajes actúa como intermediario y organizador entre el pasajero y los prestadores de servicios (transportistas, hoteles, restaurantes, guías, aerolíneas, entre otros). El organizador no asume responsabilidad por deficiencias, incumplimientos, accidentes, retrasos, cancelaciones o cualquier irregularidad en los servicios prestados por terceros, ni por daños materiales, personales o morales sufridos por los pasajeros durante el tour.`,
  },
  {
    num: '11',
    titulo: 'Tarifas y Forma de Pago',
    texto: `Las tarifas publicadas están sujetas a variación sin previo aviso. Los pagos realizados mediante cheque tendrán un cargo administrativo del 2% sobre el monto total. Los pagos en efectivo, transferencia bancaria o tarjeta de débito no tienen cargo adicional, salvo indicación en contrario al momento de la cotización.`,
  },
  {
    num: '12',
    titulo: 'Sin Deducciones por los Siguientes Conceptos',
    texto: `El organizador no efectuará deducciones ni descuentos en los siguientes casos:
• Cuando el pasajero no se presentara a la hora de inicio del tour o excursión, por cualquier motivo.
• Cuando desperfectos técnicos impidieran el funcionamiento de servicios complementarios (baño, aire acondicionado, música, televisión u otros que no impliquen cargo adicional).`,
  },
  {
    num: '13',
    titulo: 'Limitación al Derecho de Permanencia',
    texto: `El organizador se reserva el derecho de exigir el abandono del tour a cualquier pasajero cuya conducta, estado de salud u otra circunstancia represente un perjuicio para los demás pasajeros o comprometa el normal desarrollo del viaje. Los costos adicionales generados por modificaciones unilaterales del pasajero serán de su exclusiva responsabilidad.`,
  },
  {
    num: '14',
    titulo: 'Condiciones para Servicios con Vuelos Aéreos',
    texto: `Al contratar un paquete con vuelo incluido, el pasajero deberá abonar la totalidad del costo del transporte aéreo más la seña correspondiente a servicios terrestres. En caso de desistimiento, el pasajero perderá la totalidad de lo abonado en concepto de transporte aéreo. Solo se evaluará el reintegro proporcional de servicios terrestres conforme a las condiciones de cada prestador.

Los boletos aéreos se emiten entre 30 y 45 días previos a la fecha de salida. Una vez emitido el boleto, no se admiten cancelaciones, devoluciones ni cambios de fecha. Los cambios de nombre no están permitidos salvo autorización de la aerolínea; los costos serán íntegramente a cargo del pasajero.

Las tarifas aéreas se calculan al tipo de cambio dólar BSP del día de emisión. Al momento de la reserva es obligatorio informar apellido y nombre exactamente como figura en el documento, correo electrónico, teléfono y número de DNI o pasaporte. Para vuelos internacionales, es obligatorio informar el CUIT/CUIL del pagador ante AFIP.`,
  },
  {
    num: '15',
    titulo: 'Documentación Requerida para Emisión de Boletos',
    texto: `• Vuelos Internacionales: número de pasaporte, fecha de vencimiento y fecha de nacimiento.
• Vuelos Domésticos: número de DNI, fecha de vencimiento y fecha de nacimiento.

La información suministrada es responsabilidad del pasajero. Euforia Viajes no se responsabiliza por errores derivados de datos incorrectos. La obtención de visados y requisitos de ingreso es responsabilidad exclusiva del pasajero.`,
  },
  {
    num: '16',
    titulo: 'Jurisdicción',
    texto: `Para cualquier controversia derivada de la contratación de los servicios ofrecidos por Euforia Viajes, las partes se someten a la jurisdicción de los tribunales ordinarios de la ciudad de Trelew, Provincia del Chubut, renunciando a cualquier otro fuero que pudiera corresponder.`,
  },
]

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f5f9fd]">
      {/* Hero */}
      <section className="text-white py-12 px-4" style={{ background: 'linear-gradient(135deg, #00AEEF 0%, #0078B4 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Términos y Condiciones</h1>
          <p className="opacity-80 text-sm">Euforia Viajes · Legajo LADEVI N° 16816 · Vigencia: 01/10/2024</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-[#E0F6FF] border border-[#00AEEF]/30 rounded-2xl p-5 mb-10 text-sm text-[#0078B4]">
          <p>Al efectuar una reserva o pago con Euforia Viajes, el pasajero acepta en forma plena e incondicional las presentes Condiciones Generales de Contratación. Le recomendamos leerlas detenidamente antes de confirmar su viaje.</p>
        </div>

        {/* Cláusulas */}
        <div className="space-y-6">
          {CLAUSULAS.map(c => (
            <div key={c.num} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-black text-gray-800 text-base mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ backgroundColor: '#00AEEF' }}>{c.num}</span>
                {c.titulo}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{c.texto}</div>
            </div>
          ))}
        </div>

        {/* Contacto */}
        <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-600 text-sm mb-4">¿Tenés dudas sobre estas condiciones?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="mailto:adm@viajaconeuforia.com"
              className="inline-flex items-center gap-2 border-2 border-[#00AEEF] text-[#00AEEF] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#E0F6FF] transition">
              📧 adm@viajaconeuforia.com
            </a>
            <a href="https://wa.me/542804321400" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-500 transition">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <footer className="text-white mt-4 py-6 text-center text-sm" style={{ backgroundColor: '#00AEEF' }}>
        <p className="font-bold">✈️ Euforia Viajes · viajaconeuforia.com</p>
      </footer>
    </div>
  )
}
