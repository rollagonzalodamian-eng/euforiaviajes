import { ImageResponse } from 'next/og'
import { getPaquete } from '@/lib/paquetes'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const p = getPaquete(params.id)
  if (!p) return new ImageResponse(<div>Euforia Viajes</div>)

  return new ImageResponse(
    <div style={{
      display: 'flex', width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #00AEEF, #0090C5)',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      padding: '60px', color: 'white', fontFamily: 'sans-serif',
    }}>
      <div style={{ fontSize: 28, opacity: 0.8, marginBottom: 16 }}>✈️ Euforia Viajes</div>
      <div style={{ fontSize: 52, fontWeight: 900, textAlign: 'center', lineHeight: 1.2 }}>{p.titulo}</div>
      {p.precioUSD && (
        <div style={{ fontSize: 36, marginTop: 24, background: 'rgba(255,255,255,0.2)', padding: '12px 32px', borderRadius: 12 }}>
          Desde USD {parseFloat(p.precioUSD).toLocaleString()}
        </div>
      )}
    </div>
  )
}
