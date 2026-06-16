import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Euforia Viajes - Paquetes y Destinos",
  description: "Encontrá los mejores paquetes de viaje nacionales e internacionales con Euforia Viajes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f5f9fd]">
        <Header />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
