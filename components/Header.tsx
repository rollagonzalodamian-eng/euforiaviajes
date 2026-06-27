'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header style={{ backgroundColor: '#00AEEF' }} className="text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/icon.png" alt="Euforia Viajes" width={44} height={44} className="rounded-lg" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/" className="hover:opacity-80 transition">Inicio</Link>
          <Link href="/salidas" className="hover:opacity-80 transition">Salidas Grupales</Link>
          <Link href="/arma-tu-viaje" className="hover:opacity-80 transition">Armá tu Viaje</Link>
          <Link href="/blog" className="hover:opacity-80 transition">Blog</Link>
          <Link href="/nosotros" className="hover:opacity-80 transition">Nosotros</Link>
          <Link href="/faq" className="hover:opacity-80 transition">FAQ</Link>
          <Link href="/contacto" className="hover:opacity-80 transition">Contacto</Link>
          <Link href="/mi-cuenta" className="hover:opacity-80 transition">Mi cuenta</Link>
          <a href="https://wa.me/542804321400" target="_blank"
            className="bg-white text-[#00AEEF] px-4 py-1.5 rounded-full font-bold hover:bg-[#E0F6FF] transition text-xs">
            WhatsApp
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0090C5] px-4 py-3 flex flex-col gap-3 text-sm font-semibold">
          <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/salidas" onClick={() => setOpen(false)}>Salidas Grupales</Link>
          <Link href="/arma-tu-viaje" onClick={() => setOpen(false)}>Armá tu Viaje</Link>
          <Link href="/blog" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="/nosotros" onClick={() => setOpen(false)}>Nosotros</Link>
          <Link href="/faq" onClick={() => setOpen(false)}>FAQ</Link>
          <Link href="/contacto" onClick={() => setOpen(false)}>Contacto</Link>
          <Link href="/mi-cuenta" onClick={() => setOpen(false)}>Mi cuenta</Link>
        </div>
      )}
    </header>
  )
}
