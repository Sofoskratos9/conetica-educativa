# Integración Conética Educativa — restyle NEFTALÍ + rescate fix + frontera no clínica

- Fecha: 18 Nov 2026
- Base: HEAD remoto `5ca869b` (`feat: integrate full admin controls, EXANI-II bank, psychometrics, binaural wellness & real XP gamification`)
- Directorio: `~/workspace/conetica-integracion/` (copia de `~/workspace/conetica-review/`, `.git` conservado)
- Commits locales (rama `main`, **sin empujar a GitHub**):
  - `cea6d82` restyle NEFTALÍ (cherry-pick de `7448625` desde `~/workspace/conetica-unified/`)
  - `e63f730` integración: restyle + rescate fix + correcciones frontera + retiro de MOCK
  - (este informe y 6 archivos de corrección extra de la escala CENEVAL van en un commit posterior)
- Fuentes: `~/workspace/conetica-review/AUDITORIA-CONFLICTOS.md` (auditoría) y `~/workspace/conetica-unified/NEFTALI-RESTYLE.md`.

## 1. Restyle NEFTALÍ — aplicado

- Método: remote local `neftali-restyle` (`file:///home/hatch/workspace/conetica-unified`) + `git cherry-pick 7448625`. Aplicó limpio, sin conflictos.
- El commit `f857163` **no** se incluyó (es solo una nota de rebase, como pedía el encargo).
- Verificado: las 8 ilustraciones PNG están en `public/images/neftali/` (no en `public/ilustraciones/`; el código del restyle las referencia desde `public/images/neftali/`):
  `balanza.png`, `brujula.png`, `conversacion.png`, `farol.png`, `heroe-decision.png`, `libro-pregunta.png`, `planta.png`, `puerta.png` (19.598.828 bytes en total).
- Referencias verificadas en código: `src/app/page.tsx`, `pricing/page.tsx`, `schools/page.tsx`, `services/page.tsx`, `layout.tsx` (OG).

## 2. Rescate del fix (`~/workspace/conetica-educativa-fix/`, `4382175`) — pieza por pieza

| Pieza del fix | Decisión | Motivo |
|---|---|---|
| `src/app/api/checkout/stripe/verify/route.ts` | **Rescatada tal cual** | El remoto **no** tenía verificación de pago de Stripe Checkout: la página de éxito afirmaba "¡Confirmación Exitosa!" solo con query params. La ruta usa el mismo `apiVersion: '2023-10-16'` que el resto del remoto y solo necesita `STRIPE_SECRET_KEY`. Aún **no** está conectada a `/checkout/success` (queda pendiente, ver §6). |
| `supabase/migrations/001_launch_fixes.sql` | **Rescatada adaptada** | Solo la parte 1: `users.stripe_customer_id` + índice. El `schema.sql` del remoto **no** tiene esa columna pero el código del remoto sí la lee/escribe (`checkout/stripe/route.ts:68,82`, `webhooks/stripe/route.ts:133,170,198`); sin ella el checkout real falla. Las partes 2 y 3 se descartaron (ver abajo). |
| `LAUNCH_CHECKLIST.md` | **Rescatada adaptada** (reescrita) | La del fix traía precios viejos ($1,999/$599/$1,499/$2,499), el WhatsApp viejo (449 455 0463) y asumía Supabase Auth. La versión integrada usa precios correctos, WhatsApp 449 495 9259, auth HMAC + Postgres, la ruta verify nueva y la migración adaptada. |
| `.gitignore` | **No duplicada** | El remoto ya cubre lo mismo (`.out`, `*.tsbuildinfo`); el diff con el fix es solo orden de líneas. |
| `src/lib/supabase-server.ts` | **Descartada** | Solo existe para Supabase Auth (middleware con `@supabase/ssr`). El remoto no usa Supabase Auth. |
| `src/lib/api-auth.ts` | **Descartada** | `getVerifiedUser()` con Supabase Auth; el remoto verifica sesiones con `verifySessionToken` (HMAC, `src/lib/session.ts`). |
| `src/components/auth/RoleGuard.tsx` | **Descartada (ya existe)** | El remoto **ya tiene** su propio `RoleGuard.tsx` adaptado a HMAC (`getCurrentUser` + `hasPermission` del `auth-service.ts` del remoto). El del fix usa `getSessionUser()`, que no existe en el remoto. Igual `ProtectedRoute.tsx`: el remoto ya tiene su versión HMAC. |
| `src/lib/products.ts` (fix) | **Descartada** | Precios viejos ($1,999/$599/$1,499/$2,499). Se conserva el del remoto (ver §5). |
| Auth / checkout / middleware / `payment-service.ts` del fix | **Descartados** | Chocan con 14 commits del remoto (auditoría §4.1); el remoto ya tiene checkout real y auth real por otro camino. |
| `@supabase/ssr` (`package.json` del fix) | **No añadido** | Solo se necesita si se adopta Supabase Auth. No se usa Supabase Auth. |

### Decisión de auth (arquitectura, no merge)

**Se conserva el sistema del remoto: sesiones propias firmadas HMAC en cookie (`src/lib/session.ts`, TTL 7 días, secreto `SESSION_SECRET`/`NEXTAUTH_SECRET`) + `src/lib/auth-server.ts` (login/registro/recuperación HMAC con `password_hash` bcrypt en Postgres) + `src/lib/auth-service.ts` en cliente.** El fix lo reemplazaría todo por Supabase Auth (`signInWithPassword`/`signUp`/`getSession`, `supabase.auth.getUser()` en middleware). Mezclar ambos sería tener dos sistemas de auth conviviendo: dos sesiones, dos formas de verificar usuario en cada ruta API y dos fuentes de verdad de roles. No se hizo.

Consecuencias documentadas de esta decisión:
- La parte 2 de la migración del fix (`password_hash DROP NOT NULL`) se descartó: en el remoto las contraseñas **sí** viven en `users.password_hash` y la columna debe seguir `NOT NULL`.
- La parte 3 (policy RLS `auth.uid() = id`) se descartó: solo tiene sentido con Supabase Auth; el remoto inserta perfiles desde el servidor con el pool de Postgres.
- Si Miguel decide migrar a Supabase Auth, es un proyecto aparte: reescribir `auth-service.ts`, `middleware.ts`, login/registro, `api-auth.ts` y probar login, registro, recuperación y roles. No es un cherry-pick.

## 3. Correcciones de frontera no clínica (flags F1–F40 de la auditoría)

Regla aplicada: corregir solo las afirmaciones; **ninguna funcionalidad se borró** (tests, audio, XP, banco EXANI, admin, calculadora y semáforo siguen existiendo, con textos neutros). Ya corregidos por el restyle y verificados: F10 (Anti-ansiedad en bienestar), F19/F20 (claim de evidencia en layout/home), F22–F24 (95%/500+/4.9/5), F25 (maximizar puntaje), F29/F33/F34 (ilimitados en `products.ts`, home y pricing), F35 (Talleres Transformadores), F38 (Footer).

### Cambios hechos en esta integración

| Flag | Archivo:línea (post-cambio) | Antes → Después |
|---|---|---|
| F1 | `src/lib/psychometric-tests.ts:1` | `(validated Mexican psychometric instruments)` → `(cuestionarios de autoconocimiento adaptados; NO son instrumentos validados ni tienen valor diagnóstico)` |
| F2 | `src/lib/psychometric-tests.ts:60` | `…Validado para población mexicana.` (EDAOM) → `…Cuestionario de autoconocimiento, no validado ni diagnóstico.` |
| F3 | `src/lib/psychometric-tests.ts:557` | `…Validado para población mexicana.` (CHASIDE) → `…Cuestionario de autoconocimiento, no validado ni diagnóstico.` |
| F4 | `src/lib/psychometric-tests.ts:939` | `…Validado para población mexicana.` (Bar-On) → `…Cuestionario de autoconocimiento, no validado ni diagnóstico.` |
| F5 | `src/app/dashboard/psychometrics/page.tsx:141` | `Resultado Psicométrico Validado` → `Resultado de tu cuestionario de autoconocimiento` |
| F6 | `src/app/dashboard/psychometrics/page.tsx:315` | `Centro Psicométrico Validado` → `Centro de autoconocimiento` |
| F7 | `src/app/dashboard/psychometrics/page.tsx:318` | `Instrumentos adaptados para México (EDAOM, VAK, CHASIDE y Bar-On) para descubrir cómo aprendes mejor y gestionar el estrés de admisión.` → `Cuestionarios de autoconocimiento inspirados en EDAOM, VAK, CHASIDE y Bar-On, para descubrir cómo aprendes mejor. No son instrumentos validados ni diagnósticos.` |
| F7 | `src/app/dashboard/psychometrics/page.tsx:134` | `Volver al Centro Psicométrico` → `Volver al Centro de autoconocimiento` |
| F8 | `src/app/admin/vocational/page.tsx:128` | `Perfiles RIASEC e inventarios validados (EDAOM, VAK, CHASIDE, Bar-On) en tiempo real.` → `Perfiles RIASEC y cuestionarios de autoconocimiento (EDAOM, VAK, CHASIDE, Bar-On) en tiempo real.` |
| F9 | `src/lib/gamification.ts:74` (+ nombre insignia) | `Completaste al menos un inventario psicométrico validado (EDAOM/VAK/CHASIDE/Bar-On).` → `Completaste al menos un cuestionario de autoconocimiento (EDAOM/VAK/CHASIDE/Bar-On).`; insignia `Autoconocimiento Psicométrico` → `Autoconocimiento` |
| F11 | `src/lib/audio-synthesizer.ts:108` | Archivo descargable `Protocolo-NSDR-AntiAnsiedad-Conetica.wav` → `Audio-Respiracion-para-Calmar-Conetica.wav` |
| F11 | `src/lib/audio-synthesizer.ts:103` | `Audio-Binaural-40Hz-Enfoque-Conetica.wav` → `Audio-para-Concentrarte-Conetica.wav` |
| F12 | `src/app/dashboard/wellness/page.tsx:271,273` | `Enfoque Gamma 40 Hz + Pad Armónico` / `200 Hz oído izquierdo / 240 Hz oído derecho para concentración sostenida.` → `Audio para concentrarte + Pad Armónico` / `Sonido estéreo suave para acompañar tu concentración.` |
| F13 | `src/app/dashboard/wellness/page.tsx:311,172–173` | `Protocolo NSDR (Alfa 10 Hz → Theta 6 Hz)` / `Audio Binaural 40 Hz (Enfoque Profundo)` / `Protocolo NSDR (Calma y Recuperación)` → `Audio para descansar la mente` / `Audio para concentrarte` / `Audio para descansar la mente` |
| F14 | `src/app/dashboard/wellness/page.tsx:196` | `Herramientas interactivas de audio binaural, respiración guiada y autorregulación.` → `Herramientas de audio, respiración guiada y pausas para estudiar con calma.` |
| F16 | `src/app/dashboard/wellness/page.tsx:238,246,249` + aria-label | `Laboratorio de Neuro-Audio Binaural` → `Audio para estudiar`; subtítulo `…(usa audífonos para efecto binaural)` → `…(usa audífonos)`; `aria-label="Volumen de audio binaural"` → `"Volumen del audio"` |
| F18 | `src/app/auth/register/page.tsx:90,241,244` | `Comienza tu diagnóstico y plan basado en evidencia científica.` → `Comienza tu evaluación y plan de estudio con método.`; `comunidad educativa ética y científica` → `ética y con método`; `herramientas de diagnóstico cognitivo` → `herramientas de evaluación académica` |
| F21 | `GITHUB_SETUP.md:11` | Descripción del repo `…100% basada en evidencia científica…` → `…con método y práctica guiada…` |
| F26 | `src/app/dashboard/exani/page.tsx:223` | `…(incluyendo reactivos oficiales y personalizados por tu tutor)` → `…(creados para practicar y personalizados por tu tutor)` |
| F27 | `src/app/dashboard/exani/page.tsx:169–184` | Pantalla de resultado del simulador: **se quitó la caja con el puntaje 700–1300 y la etiqueta "Escala CENEVAL"** (grid de 3 a 2 columnas: solo % Aciertos y Reactivos). |
| F27 | `src/app/page.tsx:53` | `Reactivos comentados paso a paso con escala CENEVAL (700–1300)…` → `Reactivos comentados paso a paso con porcentaje de aciertos…` |
| F27 | `src/app/dashboard/exani/page.tsx:250,258,336,340,354` | `Calculadora CENEVAL y Semáforo UAA` → `Calculadora de práctica y referencia UAA`; `Proyección de Puntaje CENEVAL y Corte UAA` → `Estimación de práctica y referencia de corte UAA`; `Puntaje Proyectado CENEVAL` → `Estimación de práctica`; añadido descargo: `Estimación interna de práctica; no es un puntaje CENEVAL oficial ni garantiza admisión.` |
| F27 | `src/app/dashboard/page.tsx:157,162` | Etiqueta `Puntaje EXANI-II` → `Estimación EXANI-II`; subtítulo `Última escala CENEVAL estimada` → `Última estimación de práctica (EXANI-II)` |
| F27 | `src/app/api/student/progress/route.ts:214` | Mensaje `Obtuviste X pts en escala CENEVAL (…)` → `Obtuviste X pts de estimación de práctica (…). No es un puntaje CENEVAL oficial.` |
| F27 | `src/app/api/parent/overview/route.ts:26` | `Último simulacro EXANI-II: X pts en escala CENEVAL` → `…X pts (estimación de práctica, no oficial)` |
| F27 | `src/lib/gamification.ts:58` | Insignia `Alcanzaste 1,050+ puntos proyectados en escala CENEVAL.` → `Alcanzaste una estimación de práctica de 1,050+ puntos (escala de referencia, no oficial).` |
| F27 | `src/lib/analytics-server.ts:124,409` | `…para estimar tu puntaje CENEVAL` / `…estimar tu puntaje en escala CENEVAL` → `…para medir tu porcentaje de aciertos` (2 recomendaciones) |
| F30–F32 | `src/app/checkout/success/page.tsx:71`, `src/app/dashboard/layout.tsx:148`, `src/app/dashboard/settings/page.tsx:147` | `Simuladores EXANI-II ilimitados` → `Simuladores EXANI-II con retroalimentación`; `Desbloquea simuladores EXANI-II ilimitados y reportes completos.` → `…simuladores EXANI-II y reportes completos.`; `Tienes acceso ilimitado a simuladores EXANI-II…` → `Tienes acceso a simuladores EXANI-II…` |
| F36 | `src/app/dashboard/vocational/page.tsx:25` | Título `Evidencia Científica` → `Teoría de Holland` (la descripción ya citaba a Holland) |
| F37 | `src/app/dashboard/layout.tsx:208` | `Plataforma de Aprendizaje Basada en Evidencia` → `Plataforma de Aprendizaje Conética` |
| F39/F40 | `src/app/legal/ethics/page.tsx:37,39,158,165` | Encabezado `1. Evidencia Científica` → `1. Método y honestidad`; `Todas nuestras metodologías están basadas en investigación peer-reviewed y fuentes oficiales verificables (CENEVAL, SEP, OCDE, UNESCO, OMS). No utilizamos pseudociencia ni técnicas no validadas.` → `Nuestras metodologías se inspiran en investigación educativa y fuentes públicas (…). Los cuestionarios y simuladores de la plataforma son ejercicios de práctica y autoconocimiento, no instrumentos validados ni diagnósticos.`; `Nuestras metodologías están basadas en investigación de:` → `Nos inspiramos en fuentes públicas como:`; `Revistas científicas peer-reviewed en educación y neurociencia` → `Publicaciones educativas sobre aprendizaje y estudio` |
| — | `src/components/blog/BlogExplorer.tsx:41` | `Recursos basados en evidencia` → `Recursos para estudiar mejor` |
| — | `src/app/services/page.tsx:38` | `Soluciones personalizadas y basadas en evidencia…` → `Soluciones personalizadas para cada etapa de tu desarrollo académico.` |
| — | `src/app/legal/terms/page.tsx:30` | `Estrategias de aprendizaje basadas en evidencia científica` → `Estrategias de aprendizaje con método y práctica guiada` |

### Lo que queda SIN corregir (decisión de producto, para Miguel)

- **F27 (fondo) / F28 — la estimación 700–1300 sigue viviendo por dentro.** La pantalla de resultado ya no muestra la escala y la calculadora ya se presenta como estimación no oficial, pero el cálculo interno `700 + aciertos × 600` sigue en `src/app/dashboard/exani/page.tsx:93` (`cScore`, guardado en el historial vía `save_exani`), en la calculadora (`estimatedCeneval`), en el esquema zod de `/api/student/progress` (`cenevalScore: z.number().min(700).max(1300)`) y en `analytics-server.ts` (`exaniLastScore`, mostrado en admin/CSV como `EXANI: X pts`). Quitarlo del todo exige decidir qué modelo de puntuación lo reemplaza (¿solo % de aciertos? ¿se mantiene la comparación con metas UAA?) y verificar la **fuente de los cortes UAA por carrera** (Medicina 1160, Estomatología/Nutrición/Enfermería 1080, Psicología/Derecho/Comunicación 1030, Ingenierías 990, Administración 950 en `src/lib/exam-cycle.ts:24–55`): no hay fuente citada en el repo. El semáforo UAA y la calculadora siguen funcionando como estaban, solo con textos neutros.
- **F15 — parámetros de síntesis en comentarios de código.** `src/lib/audio-synthesizer.ts:14–15` describe los tonos (40 Hz Gamma, Alfa 10 Hz → Theta 6 Hz) como parámetros técnicos reales de síntesis, no como promesa al usuario. Los identificadores internos (`AudioSessionKind = 'neuro-focus' | 'nsdr-calm'`, `LiveBinauralPlayer`, `downloadNsdrAudioWav`) también se conservaron: no son visibles para el usuario y renombrarlos sería churn sin efecto. Si Miguel quiere, se renombran.
- **"Diagnóstico académico" como nombre de módulo.** Queda en `layout.tsx` (meta description), `pricing` y el módulo `/dashboard/diagnostic`. Es el nombre del producto (evaluación académica, no clínica) y las páginas legales ya aclaran que no es clínico; no se renombró el módulo entero sin decisión de Miguel.
- **`NEFTALI-RESTYLE.md:25–27`** menciona las cifras viejas (95%, 500+, 4.9/5, "ilimitados"…) en pasado, como historial de lo que se retiró. Es un doc interno, no texto del producto; se dejó.
- **`src/lib/exam-cycle.ts:59`** (`scale: '700 a 1,300 puntos CENEVAL'`) describe la escala real del examen oficial y no se usa en ninguna pantalla (verificado: 0 usos fuera de su definición). Se dejó.

## 4. MOCK — retirado

Verificado 0 importadores de `metrics-data.ts`, `automation-service.ts` y `parent-data.ts` en todo `src/` (los dashboards leen de Postgres vía `/api/*` desde el commit `10a3290`). Se borraron las 5 exportaciones muertas (se conservaron las interfaces y una nota en cada archivo):
- `MOCK_STUDENT_METRICS`, `MOCK_ADMIN_ANALYTICS` (`src/lib/metrics-data.ts`)
- `MOCK_NOTIFICATIONS`, `MOCK_AUTOMATION_LOGS` (`src/lib/automation-service.ts`; también se quitó el import de `lucide-react` que solo usaban esos datos)
- `MOCK_STUDENT_DATA` (`src/lib/parent-data.ts`)

Grep posterior: 0 ocurrencias de `MOCK_` en `src/` (salvo la palabra en las notas de retiro). Ningún dashboard mostraba mock antes ni ahora.

## 5. Precios — verificación

- Grep de precios viejos (`1,999` / `1,499` / `2,499` / `$599`) en `src/`, `*.md` y `supabase/`: **0 ocurrencias**.
- Precios del remoto intactos en `src/lib/products.ts`: Premium `premium_monthly` **$299**/mes, Mentoría `program_4_sessions` **$1,800**, Sesión `single_session` **$500**, Vocacional `vocational_pack` **$850**, EXANI `exani_prep` **$2,500**. (El `$400` de la sesión NEFTALÍ no es producto de Conética; vive en `src/lib/neftali.ts`.)

## 6. Build

- Node **v24.22.1**, npm **10.9.4** (coincide con `engines: node 24.x`).
- `npm ci` (491 paquetes) y `npm run build`: **compila en producción sin errores** (`✓ Compiled successfully`, 71/71 páginas generadas). La ruta nueva `/api/checkout/stripe/verify` aparece en el listado de rutas. No hizo falta corregir nada causado por la integración; el remoto compilaba y sigue compilando.
- No hay script de test en el repo (tampoco en el remoto).

## 7. Prueba de humo (servidor local, puerto 3100, sin DB ni claves)

| Ruta | Resultado |
|---|---|
| `/` | **200** (62 KB). 0 ocurrencias de "escala CENEVAL" ni `MOCK_` en el HTML servido. |
| `/pricing` | **200** |
| `/services` | **200** |
| `/schools` | **200** |
| `/legal/ethics` | **200** (con el texto corregido "Método y honestidad") |
| `/dashboard/exani`, `/dashboard/wellness`, `/dashboard/psychometrics` | **307** → `/auth/login?redirect=…` (esperado: sin sesión el middleware redirige a login; no es un fallo) |
| `/images/neftali/heroe-decision.png`, `balanza.png` | **200** (ilustraciones servidas) |
| `GET /api/checkout/stripe/verify?session_id=cs_test_x` | **500** `{"error":"Missing STRIPE_SECRET_KEY"}` — correcto: no hay clave en este entorno; la ruta existe y responde |
| `GET /api/health` | **200** `{"status":"ok","database":"demo","demoMode":true,…}` — sin DB configurada localmente, modo demo |

No se probaron pagos reales ni login/registro (sin DB ni claves en este entorno). El servidor de la prueba se detuvo al final.

## 8. Preparación para push (NO se empujó nada)

- Archivos trackeados: **160** (`git ls-files | wc -l`).
- Tamaño total de archivos de **texto** trackeados: **1.347.690 bytes** (~1,35 MB).
- Archivos **binarios** trackeados (11): los 8 PNG NEFTALÍ nuevos (**19.598.828 bytes** en total), 2 JPG preexistentes (`hero-illustration.jpg` 614.570, `schools-illustration.jpg` 661.110) y `src/app/favicon.ico` (25.931). Los SVG son texto (XML) y sí pasan por el conector.
- **Exclusión crítica para el push por conector GitHub (solo UTF-8): los 8 PNG de `public/images/neftali/`.** Sin ellos, la tienda se ve sin imágenes. **Miguel debe subirlos desde su máquina** (`git add public/images/neftali && git commit && git push`) después de que el resto llegue por el conector. Los JPG y el favicon ya están en el remoto, no son problema nuevo.
- No se creó rama en GitHub, no se agregaron llaves ni `.env`, no se desplegó nada. El remote `neftali-restyle` (file:// local) quedó solo en la config local de este clon; no viaja con un push.
- Pasos sugeridos para Miguel (o quien tenga acceso de escritura): subir la rama de integración por el conector (160 archivos de texto), abrir PR a `main`, y subir los 8 PNG desde su máquina antes de desplegar.

## 9. Qué sigue necesitando de Miguel

1. **Decisión de producto F27/F28:** fuente de los cortes UAA por carrera y qué hacer con la estimación 700–1300 guardada en historial (¿se mantiene como estimación interna etiquetada, o se pasa a solo % de aciertos?). Sin esto, el semáforo UAA sigue con metas sin fuente verificada.
2. **Decisión de auth:** se conserva HMAC + Postgres (recomendado: ya funciona y ya cobra real). Migrar a Supabase Auth sería un proyecto aparte.
3. **Conectar `/checkout/success` a la ruta verify nueva** (o dejar que el webhook siga siendo la única fuente de verdad del pago).
4. **Subir los 8 PNG** desde su máquina (ver §8) y revisar el PR.
5. **Claves reales en Vercel** (Stripe/Mercado Pago, `DATABASE_URL`, `SESSION_SECRET`): sin ellas el checkout cae en modo demo aunque el código sea real. Probar con tarjetas de prueba antes de pasar a live (ver `LAUNCH_CHECKLIST.md`).
6. **Ejecutar `supabase/migrations/001_launch_fixes.sql`** en la base de producción (añade `users.stripe_customer_id`).
