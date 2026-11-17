import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Conética Educativa™ | Aprendizaje Basado en Evidencia Científica",
    template: "%s | Conética Educativa™",
  },
  description:
    "Plataforma educativa basada en evidencia científica para estudiantes, padres y escuelas: diagnóstico cognitivo-académico, preparación EXANI-II UAA, orientación vocacional RIASEC y bienestar académico.",
  keywords: [
    "Conética Educativa",
    "EXANI-II",
    "UAA",
    "Orientación Vocacional RIASEC",
    "Técnicas de estudio",
    "Aguascalientes",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="antialiased bg-[var(--color-surface-50)] text-[var(--color-text-main)]">
        <SiteChrome>{children}</SiteChrome>
        <WhatsAppButton
          variant="floating"
          message="Hola, me gustaría obtener más información sobre Conética Educativa."
          label="¿Necesitas ayuda?"
        />
      </body>
    </html>
  );
}
