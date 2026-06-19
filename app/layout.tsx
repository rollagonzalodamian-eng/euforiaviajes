import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import SessionWrapper from "@/components/SessionWrapper";
import Analytics from "@/components/Analytics";
import TawkChat from "@/components/TawkChat";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Euforia Viajes - Paquetes de Viaje Nacionales e Internacionales",
  description: "Descubrí paquetes de viaje a Termas de Río Hondo, Brasil, Cancún, Bariloche y más. Salidas grupales y viajes a medida desde Patagonia. ¡Reservá online!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  verification: { google: 'bhnWH8_jpOgDRWkVT37jl7aZsyiIXUK-EhfKjrqOvkk' },
  keywords: ["paquetes de viaje", "turismo argentina", "salidas grupales", "euforia viajes", "viajes patagonia", "termas rio hondo", "cancun", "brasil"],
  openGraph: {
    title: "Euforia Viajes - Paquetes Nacionales e Internacionales",
    description: "Los mejores paquetes de viaje con salida desde Patagonia. Reservá online con seña del 15%.",
    url: "https://euforiaviajes.vercel.app",
    siteName: "Euforia Viajes",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f9fd]">
        <SessionWrapper>
          <Analytics />
          <TawkChat />
          <Header />
          {children}
          <WhatsAppButton />
        </SessionWrapper>
      </body>
    </html>
  );
}
