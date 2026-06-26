import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const { paqueteId, paqueteTitulo, precioUSD, cantPasajeros, nombre, email } = await req.json()

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
  if (!MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Mercado Pago no configurado aún' }, { status: 503 })
  }

  const config = await redis.get<any>('config').catch(() => null)
  const tipoCambio = config?.tipoCambio ? Number(config.tipoCambio) : 1400
  const senaPorc = 15
  const precioTotal = parseFloat(precioUSD) * cantPasajeros * tipoCambio
  const montoSena = Math.round(precioTotal * senaPorc / 100)

  const preference = {
    items: [{
      title: `Seña ${senaPorc}% - ${paqueteTitulo}`,
      quantity: 1,
      unit_price: montoSena,
      currency_id: 'ARS',
    }],
    payer: { name: nombre, email },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/api/pago/confirmacion`,
      failure: `${process.env.NEXT_PUBLIC_URL}/paquete/${paqueteId}`,
      pending: `${process.env.NEXT_PUBLIC_URL}/api/pago/confirmacion`,
    },
    auto_return: 'approved',
    statement_descriptor: 'EUFORIA VIAJES',
    external_reference: `${paqueteId}-${Date.now()}`,
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preference),
  })

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: 500 })

  return NextResponse.json({ init_point: data.init_point, sandbox_init_point: data.sandbox_init_point })
}
