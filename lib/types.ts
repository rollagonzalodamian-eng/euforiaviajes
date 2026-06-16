export interface Paquete {
  id: string
  titulo: string
  categoria: string
  destacado: boolean
  enPromocion: boolean
  destino: string
  descripcion: string
  pais: string
  origen: string
  transporte: string
  servicio: string
  noches: string
  precioUSD: string
  promoUSD: string
  precioARS: string
  linkWeb: string
  itinerario: string
  fecha: string
  vendedor: string
  disponible: string
  urlImagenes: string
  foto: string
}

export interface PreReserva {
  nombre: string
  email: string
  telefono: string
  paqueteId: string
  paqueteTitulo: string
  fechaDeseada: string
  cantPasajeros: string
  mensaje: string
}
