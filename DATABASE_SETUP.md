# Conexión de Base de Datos Gratuita y Potente (Vercel + Neon PostgreSQL o Supabase)

Tu plataforma **Conética Educativa™** ya soporta de forma automática tanto **PostgreSQL directo (Neon / Vercel Postgres)** como **Supabase**, creando automáticamente todas las tablas necesarias (`users`, `user_progress`, `appointments`, `schools_inquiries`, `transactions`, `subscriptions`, `module_access`, `webhook_events`) y configurando tu cuenta de administrador **`miguel.neftali95@gmail.com`**.

---

## Opción 1 (Más rápida — 2 clics sin salir de Vercel): **Neon PostgreSQL (Plan Gratis)**
* **Capacidad gratis:** 0.5 GB de almacenamiento PostgreSQL serverless, alta disponibilidad, sin pausas por inactividad prolongada de datos y conectado nativamente a Vercel.
* **Cómo activarlo:**
  1. Entra a tu proyecto en **Vercel** → pestaña **Storage** → **Browse Marketplace / Connect Store**.
  2. Selecciona **Neon** (Postgres) → elige el plan **Free** y conéctalo a tu proyecto `conetica-educativa`.
  3. Vercel inyectará automáticamente la variable `DATABASE_URL` (y `POSTGRES_URL`) en tu proyecto.
  4. Ve a **Vercel → Project Settings → Environment Variables** y agrega estas 3 variables:
     - `SESSION_SECRET` = *(una clave aleatoria generada con `openssl rand -base64 32` o cualquier cadena larga de 32+ caracteres)*
     - `ADMIN_EMAIL` = `miguel.neftali95@gmail.com`
     - `ADMIN_INITIAL_PASSWORD` = *(tu contraseña secreta inicial para entrar como administrador)*
  5. En **Deployments**, haz clic en **Redeploy**.
  6. Al entrar a `https://conetica-educativa.vercel.app/api/health`, verás `"database": "postgres", "persistent": true`. Las tablas se crearán automáticamente en la primera petición y podrás iniciar sesión de inmediato con `miguel.neftali95@gmail.com`.

---

## Opción 2: **Supabase (Plan Gratis 500 MB + Dashboard visual)**
1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, copia y ejecuta completo el archivo `supabase/schema.sql`.
3. En **Project Settings → API**, copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Agrégalas en **Vercel → Project Settings → Environment Variables** junto con:
   - `SESSION_SECRET`
   - `ADMIN_EMAIL` = `miguel.neftali95@gmail.com`
   - `ADMIN_INITIAL_PASSWORD` = *(tu contraseña secreta de administrador)*
5. Haz **Redeploy** en Vercel.

---

## Correos reales de recuperación de contraseña (Opcional, Plan Gratis Resend)
* Si deseas que `/auth/forgot-password` envíe correos reales de recuperación a tus usuarios:
  1. Crea una cuenta gratuita en [resend.com](https://resend.com) (3,000 correos/mes gratis).
  2. Agrega `RESEND_API_KEY` (y opcionalmente `EMAIL_FROM`) en las variables de entorno de Vercel.
