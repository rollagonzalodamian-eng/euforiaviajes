'use client'

const FALLBACK = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80&fit=crop'

export default function ImgFallback({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={className}
      onError={(e) => { e.currentTarget.src = FALLBACK }}
    />
  )
}
