'use client'

export default function ImgFallback({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-400 text-xs text-center px-2">Sin foto</span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
        const parent = e.currentTarget.parentElement
        if (parent) {
          parent.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center"><span class="text-gray-400 text-xs">Sin foto</span></div>'
        }
      }}
    />
  )
}
