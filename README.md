# Conética Educativa™

Plataforma SaaS educativa profesional con pagos reales, base de datos y seguridad de producción.

## 🚀 Despliegue Rápido

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/conetica-educativa.git
git push -u origin main
```

### 2. Desplegar en Vercel

1. Ve a <https://vercel.com/new>
2. Importa tu repositorio
3. Deploy (compilará con valores dummy)

### 3. Agregar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXTAUTH_SECRET
```

Ver `.env.example` para detalles.

### 4. Redeploy

Después de agregar variables: Deployments → Redeploy

---

## 📋 Configuración Completa

Ver documentación detallada:

- `VERCEL_DEPLOY.md` - Guía de despliegue
- `PAYMENT_SETUP.md` - Configurar Stripe y Mercado Pago
- `SECURITY.md` - Medidas de seguridad
- `supabase/schema.sql` - Ejecutar en Supabase

---

## 🏗️ Estructura

```
src/
├── app/
│   ├── api/              ← API Routes (checkout, webhooks)
│   ├── auth/             ← Login, Register
│   ├── dashboard/        ← Dashboard estudiante
│   └── page.tsx          ← Landing page
├── lib/
│   ├── supabase.ts       ← Cliente DB
│   ├── access-control.ts ← Control de acceso
│   └── security/         ← Sanitización y autorización
└── middleware.ts         ← Protección de rutas
```

---

## ✅ Características

- ✅ Pagos reales (Stripe + Mercado Pago)
- ✅ Base de datos Supabase
- ✅ Seguridad completa (RLS, sanitización, roles)
- ✅ Frontend profesional
- ✅ Sin simulaciones - código de producción

---

## 📞 Soporte

- Stripe: <https://stripe.com/docs>
- Mercado Pago: <https://www.mercadopago.com.mx/developers>
- Supabase: <https://supabase.com/docs>
- Vercel: <https://vercel.com/docs>

---

**Listo para producción** 🎉
