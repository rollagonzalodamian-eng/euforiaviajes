'use client'
import { useEffect } from 'react'

declare global {
  interface Window { Tawk_API: any; Tawk_LoadStart: Date }
}

export default function TawkChat() {
  useEffect(() => {
    const tawkId = process.env.NEXT_PUBLIC_TAWK_ID
    if (!tawkId) return
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()
    const s = document.createElement('script')
    s.async = true
    s.src = `https://embed.tawk.to/${tawkId}/default`
    s.charset = 'UTF-8'
    s.setAttribute('crossorigin', '*')
    document.body.appendChild(s)
  }, [])
  return null
}
