# Checklist de lanzamiento — Conética Educativa (integrada 18 Nov 2026)

Adaptada de `LAUNCH_CHECKLIST.md` de la rama local `fix/launch-ready`
(commit 4382175) a la arquitectura real del remoto: **sesiones HMAC
propias + Postgres/Neon, NO Supabase Auth**. Precios corregidos a los
del remoto (los del fix eran viejos) y WhatsApp corregido a
449 495 9259 (el fix traía el número viejo 449 455 0463).

Nada de este checklist pide claves por chat: las claves se ponen en
Vercel / Stripe / Mercado Pago, nunca en mensajes ni en el repo.

## 0. Decisiones de Miguel (antes de cobrar un peso)
- [ ] Confirmar precios finales (los del catálogo `src/lib/products.ts`):
      Premium $299/mes, Mentoría 4 sesiones $1,800, Sesión individual
      $500, Orientación Vocacional $850, EXANI $2,500.
- [ ] WhatsApp real: 449 495 9259 (ya configurado en el remoto).
- [ ] Auth: se conserva el sistema HMAC + Postgres del remoto. NO migrar
      a Supabase Auth sin una decisión explícita de Miguel: sería
      reescribir `auth-service.ts`, `middleware.ts`, login/registro y
      las rutas API (ver INTEGRACION.md § "Decisión de auth").
- [ ] Textos de frontera no clínica: ver INTEGRACION.md (flags F1–F40);
      los que quedaron pendientes de decisión de producto están listados
      ahí (semáforo UAA / cortes por carrera, audio binaural y NSDR).

## 1. Base de datos (Neon/Postgres o Supabase como Postgres)
- [ ] Crear el proyecto / base de datos (si no existe).
- [ ] Ejecutar `supabase/schema.sql` en el SQL Editor.
- [ ] Ejecutar `supabase/migrations/001_launch_fixes.sql` (añade
      `users.stripe_customer_id`, que el checkout necesita).
- [ ] Definir `SESSION_SECRET` (o `NEXTAUTH_SECRET`) largo y aleatorio;
      sin él las sesiones HMAC usan el fallback de desarrollo.
- [ ] Crear la cuenta admin: registrarse en la app con el correo de
      Miguel (miguel.neftali95@gmail.com) y cambiar su `role` a `admin`
      directamente en la tabla `users`. No hay registro de admin
      desde la app.

## 2. Stripe (modo prueba primero)
- [ ] Copiar claves de PRUEBA (pk_test_... / sk_test_...).
- [ ] Crear webhook de prueba: endpoint
      `https://TU-DOMINIO/api/webhooks/stripe`, eventos
      `checkout.session.completed`, `payment_intent.succeeded`,
      `payment_intent.payment_failed`, `customer.subscription.created`,
      `customer.subscription.updated`, `customer.subscription.deleted`,
      `invoice.payment_succeeded`. Copiar el `whsec_...`.
- [ ] Probar: registrarse, pagar Premium $299 con tarjeta de prueba
      4242 4242 4242 4242, verificar que el webhook marca la transacción
      `completed` y el usuario queda `is_premium = true`.
- [ ] Repetir con un pago único (Sesión $500) y con una tarjeta que
      falla (4000 0000 0000 0002) para ver el mensaje de error.
- [ ] Verificar la ruta nueva `GET /api/checkout/stripe/verify?session_id=...`
      devuelve `paid: true` tras un pago real (la página de éxito aún
      no la consulta: si se quiere mostrar el estado verificado, hay
      que conectar `/checkout/success` a esta ruta).
- [ ] Solo cuando todo lo anterior pase: cambiar a claves LIVE
      (pk_live_... / sk_live_...) y crear el webhook de producción.

## 3. Mercado Pago (modo prueba primero)
- [ ] Copiar access token y public key de prueba del panel de developers.
- [ ] Probar un pago único con un usuario de prueba de Mercado Pago.
- [ ] VERIFICAR en sandbox: que el webhook reciba el metadata
      (user_id/product_id) del pago. El código tiene un respaldo que
      busca la transacción pendiente por preference_id, pero hay que
      verlo funcionar una vez antes de lanzar.
- [ ] Solo después: claves de producción.

## 4. Vercel (despliegue)
- [ ] Importar el repo en Vercel (o conectar el repo existente).
- [ ] Poner TODAS las variables de `.env.example` en
      Settings → Environment Variables (Production): Stripe/Mercado
      Pago + `DATABASE_URL` (o `POSTGRES_URL`) + `SESSION_SECRET` +
      `NEXT_PUBLIC_APP_URL` con el dominio real +
      `NEXT_PUBLIC_WHATSAPP_NUMBER` (4494959259).
- [ ] Desplegar la rama de integración (o hacer merge a `main`
      después de revisar el PR, cuando haya acceso de escritura).
- [ ] `NEXT_PUBLIC_APP_URL` debe ser el dominio real: Stripe y Mercado
      Pago redirigen ahí y los webhooks apuntan ahí.
- [ ] Sin claves configuradas, el checkout cae en modo demo
      (`/checkout/success?demo=true`): verificar que en producción
      las claves SÍ estén puestas, o el cobro real no existe aunque
      el código sea real.

## 5. Pruebas finales antes de abrir (con claves de prueba)
- [ ] Registro de estudiante nuevo → entra al dashboard.
- [ ] Registro de padre → entra a /parent/dashboard, no al dashboard.
- [ ] Login con contraseña incorrecta → error, no entra.
- [ ] Sin sesión, entrar a /dashboard → redirige a /auth/login.
- [ ] Con sesión de estudiante, entrar a /admin → redirige fuera.
- [ ] Checkout Stripe (tarjeta de prueba) → redirige a Stripe, paga,
      vuelve a /checkout/success y dice "Pago Exitoso".
- [ ] Checkout Mercado Pago (prueba) → vuelve y el acceso se activa.
- [ ] Cancelar un pago → vuelve al checkout con el producto intacto.
- [ ] Recuperación de contraseña (flujo HMAC por correo) → llega el
      enlace y permite restablecer.

## 6. Legal / contenido (antes de cobrar a menores o a escuelas)
- [ ] Aviso de privacidad y términos revisados para menores de edad:
      la plataforma es para estudiantes (muchos menores). Definir
      consentimiento de padre/tutor y tratamiento de datos de menores.
- [ ] Textos de frontera no clínica ya corregidos en esta integración
      (ver INTEGRACION.md); los pendientes de decisión de producto
      (semáforo UAA, audio binaural/NSDR) siguen listados ahí.
- [ ] Los dashboards ya leen de Postgres real (commit 10a3290 del
      remoto); los `MOCK_*` restantes eran código muerto y se retiraron
      en esta integración (ver INTEGRACION.md).

## 7. GitHub (para subir estos cambios)
- [ ] Completar la instalación de la GitHub App (seleccionar repos).
- [ ] Subir la rama de integración y abrir un PR a `main`.
- [ ] Revisar el PR (ver `git diff --stat` y el resumen de cambios).
- [ ] Las 8 ilustraciones PNG en `public/images/neftali/` NO se pueden
      subir por el conector GitHub (solo acepta UTF-8): Miguel debe
      subirlas desde su máquina (`git add public/images/neftali`).
- [ ] Después del merge: rotar por precaución las claves de prueba
      que estaban en el `.env` anterior (eran valores dummy, pero el
      archivo estuvo en el historial de git).
