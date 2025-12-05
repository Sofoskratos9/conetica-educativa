# 🚀 Guía de Configuración de Pagos Reales - Conética Educativa™

Esta guía te ayudará a configurar los pagos reales con Stripe y Mercado Pago en producción.

## 📋 Requisitos Previos

- Cuenta de [Stripe](https://dashboard.stripe.com/register)
- Cuenta de [Mercado Pago](https://www.mercadopago.com.mx/developers)
- Cuenta de [Supabase](https://app.supabase.com)
- Proyecto desplegado en Vercel (o similar)

---

## 1️⃣ Configurar Supabase

### Paso 1: Crear Proyecto

1. Ve a <https://app.supabase.com>
2. Crea un nuevo proyecto
3. Guarda tu **Project URL** y **API Keys**

### Paso 2: Ejecutar Schema SQL

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql`
3. Copia todo el contenido y pégalo en el editor
4. Haz clic en **Run** para crear todas las tablas

### Paso 3: Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA expongas esta clave)

---

## 2️⃣ Configurar Stripe

### Paso 1: Obtener API Keys

1. Ve a <https://dashboard.stripe.com/apikeys>
2. Copia:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Paso 2: Configurar Webhook

1. Ve a <https://dashboard.stripe.com/webhooks>
2. Haz clic en **Add endpoint**
3. URL del endpoint: `https://tudominio.com/api/webhooks/stripe`
4. Selecciona estos eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Paso 3: Activar Modo Producción

- Cambia de **Test mode** a **Live mode** en el dashboard
- Actualiza tus API keys con las de producción (`pk_live_...` y `sk_live_...`)

---

## 3️⃣ Configurar Mercado Pago

### Paso 1: Obtener Credenciales

1. Ve a <https://www.mercadopago.com.mx/developers/panel/credentials>
2. Selecciona **Producción**
3. Copia:
   - **Access Token** → `MERCADOPAGO_ACCESS_TOKEN`
   - **Public Key** → `MERCADOPAGO_PUBLIC_KEY`

### Paso 2: Configurar Webhook

1. Ve a <https://www.mercadopago.com.mx/developers/panel/webhooks>
2. Crea un nuevo webhook
3. URL: `https://tudominio.com/api/webhooks/mercadopago`
4. Eventos: Selecciona **Pagos**

---

## 4️⃣ Configurar Variables de Entorno

### Desarrollo Local

1. Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

2. Edita `.env.local` y agrega tus credenciales:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Producción (Vercel)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega TODAS las variables de `.env.local`
4. ⚠️ **IMPORTANTE**: Cambia `NEXT_PUBLIC_APP_URL` a tu dominio real:

```env
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

---

## 5️⃣ Probar Webhooks Localmente

Para probar webhooks en desarrollo local, usa **Stripe CLI**:

### Stripe

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar webhooks a tu localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Mercado Pago

Usa [ngrok](https://ngrok.com/) para exponer tu localhost:

```bash
ngrok http 3000
# Usa la URL de ngrok en la configuración del webhook de Mercado Pago
```

---

## 6️⃣ Verificar Configuración

### Checklist de Seguridad

- [ ] ✅ Todas las API keys están en `.env.local` (NO en el código)
- [ ] ✅ `.env.local` está en `.gitignore`
- [ ] ✅ Webhooks configurados en ambas plataformas
- [ ] ✅ URLs de webhooks apuntan a tu dominio de producción
- [ ] ✅ Schema SQL ejecutado en Supabase
- [ ] ✅ Variables de entorno configuradas en Vercel
- [ ] ✅ Modo producción activado en Stripe (para producción)

### Probar Pagos

1. **Modo Test (Desarrollo)**:
   - Usa tarjetas de prueba de Stripe: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

2. **Modo Producción**:
   - Usa tarjetas reales
   - Verifica que los webhooks se reciban correctamente
   - Revisa la tabla `webhook_events` en Supabase

---

## 7️⃣ Monitoreo

### Logs de Stripe

- Dashboard → Developers → Webhooks → Ver eventos

### Logs de Mercado Pago

- Panel de Desarrolladores → Webhooks → Historial

### Logs de Supabase

```sql
-- Ver últimos webhooks recibidos
SELECT * FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 20;

-- Ver transacciones completadas
SELECT * FROM transactions 
WHERE status = 'completed' 
ORDER BY created_at DESC;

-- Ver usuarios premium activos
SELECT * FROM users 
WHERE is_premium = true;
```

---

## 🆘 Solución de Problemas

### Webhook no se recibe

1. Verifica que la URL sea accesible públicamente (usa `curl`)
2. Revisa los logs en el dashboard de Stripe/MercadoPago
3. Verifica que el `WEBHOOK_SECRET` sea correcto

### Pago completado pero usuario no activado

1. Revisa la tabla `webhook_events` para ver si el evento se recibió
2. Verifica el campo `processed` y `error`
3. Revisa los logs del servidor

### Error de base de datos

1. Verifica que el schema SQL se ejecutó correctamente
2. Revisa los permisos de RLS en Supabase
3. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada

---

## 📚 Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Mercado Pago](https://www.mercadopago.com.mx/developers/es/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Webhooks de Stripe](https://stripe.com/docs/webhooks)

---

## ⚠️ Notas Importantes

1. **Nunca** expongas tus API keys en el código o en GitHub
2. Usa **diferentes credenciales** para desarrollo y producción
3. Monitorea regularmente los webhooks fallidos
4. Implementa **retry logic** para webhooks críticos
5. Mantén un **backup** de tu base de datos
6. Revisa las **tasas de conversión** en los dashboards

---

¿Necesitas ayuda? Contacta a soporte técnico.
