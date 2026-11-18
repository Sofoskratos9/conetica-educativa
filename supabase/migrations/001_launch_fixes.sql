-- Migración 001 — correcciones para el lanzamiento (adaptada 18 Nov 2026)
-- Origen: supabase/migrations/001_launch_fixes.sql de la rama local
-- fix/launch-ready (commit 4382175). ADAPTADA a la arquitectura del
-- remoto (sesiones HMAC propias + Postgres/Neon, NO Supabase Auth).
-- Ejecutar en el SQL Editor DESPUÉS de supabase/schema.sql, en el
-- proyecto que se use para producción.
--
-- ADAPTACIONES (decisión documentada en INTEGRACION.md):
-- 1) SE CONSERVA: la columna users.stripe_customer_id. El schema.sql del
--    remoto NO la tiene, pero el código del remoto SÍ la lee y escribe
--    (src/app/api/checkout/stripe/route.ts:68,82 y
--    src/app/api/webhooks/stripe/route.ts:133,170,198). Sin ella el
--    checkout real falla al guardar el cliente de Stripe.
-- 2) SE DESCARTA: "ALTER COLUMN password_hash DROP NOT NULL". Esa parte
--    asumía que las contraseñas viven en Supabase Auth (auth.users). En
--    el remoto las contraseñas viven en users.password_hash (bcrypt,
--    src/lib/auth-server.ts) y la columna DEBE seguir siendo NOT NULL.
--    Aplicarla rompería el registro HMAC.
-- 3) SE DESCARTA: la policy RLS "Users can insert own profile"
--    (auth.uid() = id). Esa policy solo tiene sentido con Supabase Auth;
--    el remoto inserta perfiles desde el servidor con el pool de
--    Postgres (src/lib/auth-server.ts), no desde el navegador con el
--    cliente de Supabase. No añadir policies de Supabase Auth mientras
--    la auth sea HMAC.

-- 1) Columna que el checkout de Stripe necesita para guardar el cliente.
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
