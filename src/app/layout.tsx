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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://conetica-educativa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Conética Educativa | Pensamiento aplicado a la vida real",
    template: "%s | Conética Educativa",
  },
  description:
    "Pensamiento aplicado a la vida real: diagnóstico académico, preparación EXANI-II UAA, orientación vocacional y consultoría filosófica NEFTALÍ para estudiantes, padres y escuelas en Aguascalientes y en línea.",
  keywords: [
    "Conética Educativa",
    "EXANI-II",
    "UAA",
    "Orientación Vocacional RIASEC",
    "Técnicas de estudio",
    "Consultoría filosófica",
    "NEFTALÍ",
    "Aguascalientes",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: "Conética Educativa",
    title: "Conética Educativa | Pensamiento aplicado a la vida real",
    description:
      "Diagnóstico académico, simuladores EXANI-II, orientación vocacional y consultoría filosófica NEFTALÍ para estudiantes, familias y escuelas.",
    images: [
      {
        url: "/images/neftali/heroe-decision.png",
        width: 1264,
        height: 848,
        alt: "Conética Educativa — Pensamiento aplicado a la vida real",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conética Educativa | Pensamiento aplicado a la vida real",
    description:
      "Diagnóstico académico, simuladores EXANI-II, orientación vocacional y consultoría filosófica NEFTALÍ.",
    images: ["/images/neftali/heroe-decision.png"],
  },
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
