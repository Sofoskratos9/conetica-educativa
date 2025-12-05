"use client";

import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        {/* Floating WhatsApp Button - Available on all pages */}
        <WhatsAppButton
          variant="floating"
          message="Hola, me gustaría obtener más información sobre Conética Educativa."
          label="¿Necesitas ayuda?"
        />
      </body>
    </html>
  )
}
