'use client'
import { useEffect } from 'react'

declare global {
  interface Window { Tawk_API: any; Tawk_LoadStart: Date }
}

export default function TawkChat() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()
    const s = document.createElement('script')
    s.async = true
    s.src = `https://embed.tawk.to/6a34930fb1bc7b1d4bd8d40b/1jrelsubs`
    s.charset = 'UTF-8'
    s.setAttribute('crossorigin', '*')
    document.body.appendChild(s)
  }, [])
  return null
}
