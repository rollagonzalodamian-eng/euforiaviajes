'use client'

// Foto genérica de viaje — se usa cuando la imagen no carga
const FALLBACK = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop'

export default function ImgFallback({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK) {
          e.currentTarget.src = FALLBACK
        }
      }}
    />
  )
}
