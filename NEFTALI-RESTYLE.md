# Conética Educativa — Restyle NEFTALÍ (rama `neftali-restyle`)

Parche de revisión sobre el main remoto actual (HEAD `10a3290`).
**No se empujó nada a GitHub. No se tocó `~/workspace/conetica-educativa-fix/`.**

## Qué gobierna este restyle

- Sistema visual: `~/workspace/neftali-unified/SISTEMA-VISUAL.md` (paleta exacta,
  sin degradados, fondo siempre crema, botones verde oscuro, sin tipografía
  manuscrita, sin fotos).
- Nomenclatura: Notion / marca NEFTALÍ ("Pensamiento aplicado a la vida real").
- Fuente única de la copia NEFTALÍ: `src/lib/neftali.ts`
  (sesión 60 min, $400 MXN IVA incluido, pago anticipado, cancelación 24 h,
  sin cargo si se deriva en los primeros 15 min, cinco diálogos,
  Cal.com https://cal.com/miguel-neftali-lopez-wnkrwr/consultoria,
  Lic. en Filosofía, cédula profesional 15424282).

## Auditoría del main remoto (resumen)

- Estilo anterior: "Editorial Academic" — azul marino/cobalto + esmeralda,
  secciones oscuras con texto blanco, botones con degradado, fotos/ilustración
  editorial. Nada de eso es NEFTALÍ.
- Palabras que chocaban y se corrigieron: testimonios inventados con nombre y
  apellido (María González, Carlos Ramírez, Ana Martínez) y cifras sin verificar
  (95 % de admisión, 500+ estudiantes, 4.9/5, "100 % basado en evidencia",
  "sin límites", "ilimitados", "maximizar tu puntaje", "psicométrica",
  "Talleres Transformadores", "Sesión de Enfoque Científico").
- Lo que ya estaba bien y NO se tocó: los avisos legales
  (`/legal/ethics`, `/legal/terms`) ya dicen que no es servicio clínico ni de
  salud mental; el diagnóstico ya se marca "no clínico".
- Pagos y auth NO se tocaron: `src/app/api/checkout/*`, `src/app/api/webhooks/*`,
  `src/lib/payment-service.ts`, `src/lib/auth-service.ts`, `src/app/checkout/*`
  conservan su lógica. Solo cambió su envoltura visual (tokens CSS y `Button`).
  Precios intactos: Premium $299/mes, Mentoría $1,800, Sesión $500, Vocacional
  $850, EXANI $2,500.

## Ilustraciones integradas (8/8, en `public/images/neftali/`)

| Archivo | Uso |
|---|---|
| `heroe-decision.png` | Héroe de la home + imagen OG (`layout.tsx`) |
| `libro-pregunta.png` | Sección "Pensar con método" (home) |
| `conversacion.png` | Tarjeta de la sesión NEFTALÍ (home) |
| `farol.png` | Showcase de escuelas (home) |
| `balanza.png` | Tira NEFTALÍ en `/pricing` |
| `puerta.png` | Tarjeta NEFTALÍ en `/services` |
| `planta.png` | Héroe de `/schools` |
| `brujula.png` | Motivo del módulo vocacional (home) |

Las ilustraciones se copiaron desde `~/workspace/neftali-unified/ilustraciones/`.
Los JPG anteriores (`public/images/hero-illustration.jpg`,
`public/images/schools-illustration.jpg`) ya no se referencian desde ningún
componente; se dejan en el repo sin borrar, por si Miguel quiere recuperarlos.

## Archivos cambiados

- `tailwind.config.ts`, `src/app/globals.css` — tokens NEFTALÍ exactos
  (crema #F5F1EA, verde #14532D, terracota #C96F4A, ocre, salvia, azul pizarra,
  tinta); sin degradados; tarjetas crema papel con borde verde y radio 12 px.
- `src/components/ui/Button.tsx` — primario verde oscuro, hover verde profundo;
  secundario crema profunda (nunca terracota).
- `src/lib/neftali.ts` (nuevo) — nomenclatura NEFTALÍ en un solo lugar.
- `src/lib/products.ts` — descripciones alineadas; precios intactos; la sesión
  de Conética se renombró "Sesión Académica Individual 1:1" para no confundirla
  con la sesión NEFTALÍ de $400.
- `src/lib/wellness-data.ts`, `src/lib/schools-data.ts` — colores NEFTALÍ y
  textos sin afirmaciones clínicas/neuro.
- `src/app/layout.tsx` — metadatos NEFTALÍ + OG con `heroe-decision.png`.
- `src/app/page.tsx` — héroe crema con `heroe-decision.png`, testimonios
  inventados retirados, sección de los cinco diálogos, CTA Premium en crema.
- `src/app/pricing/page.tsx` — tarjeta Premium en crema, tira NEFTALÍ con balanza.
- `src/app/services/page.tsx` — tarjeta NEFTALÍ con puerta.
- `src/app/schools/page.tsx` — héroe crema con planta, sin "transformadores".
- `src/app/dashboard/wellness/page.tsx` — banner en crema, sin degradado.
- `src/components/home/InteractivePreview.tsx` — sección oscura a crema,
  radar verde/terracota.
- `src/components/layout/Navbar.tsx` — enlace "Sesión NEFTALÍ · $400" a Cal.com,
  "Crear cuenta" en vez de "Comenzar Gratis".
- `src/components/layout/Footer.tsx` — pie en crema profunda + bloque NEFTALÍ.
- `src/app/not-found.tsx` — icono en crema (detalle menor).

## Pendiente (decisión de Miguel, no de este parche)

1. Fusionar o descartar el fix viejo de `~/workspace/conetica-educativa-fix/`
   (divergió del remoto; no se usó aquí).
2. Deploy en Vercel y claves reales (Stripe/Mercado Pago/Supabase): sin ellas
   no hay pago real que probar; los dashboards siguen con sus datos actuales.
3. WhatsApp: el repo usa 449 495 9259 (configurado en el remoto); sigue pendiente
   confirmar si es el número correcto frente al 449 455 0463 de la bio.
4. Testimonios: la home ya no muestra ninguno. Solo se añaden con testimonios
   reales y permiso.
