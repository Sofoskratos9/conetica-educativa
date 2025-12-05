# 🚀 Guía Rápida de Despliegue en Vercel

## ✅ El Proyecto Está Listo

El build compila exitosamente con valores dummy. Ahora puedes desplegarlo en Vercel.

---

## 📦 Paso 1: Subir a GitHub

```bash
cd /Users/miguelneftalilopezesparza/.gemini/antigravity/scratch/conetica-educativa

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - Conética Educativa ready for production"

# Crear repositorio en GitHub y conectar
git branch -M main
git remote add origin https://github.com/TU_USUARIO/conetica-educativa.git
git push -u origin main
```

---

## 🌐 Paso 2: Desplegar en Vercel

### Opción A: Desde la Web (Recomendado)

1. Ve a <https://vercel.com/new>
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente Next.js
4. **NO agregues variables de entorno todavía**
5. Haz clic en "Deploy"
6. Espera 2-3 minutos

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ⚙️ Paso 3: Agregar Variables de Entorno en Vercel

Una vez desplegado:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega estas variables (reemplaza con tus valores reales):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_TU_KEY_AQUI
STRIPE_SECRET_KEY = sk_live_TU_KEY_AQUI
STRIPE_WEBHOOK_SECRET = whsec_TU_SECRET_AQUI
MERCADOPAGO_ACCESS_TOKEN = APP_USR-TU_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY = APP_USR-TU_PUBLIC_KEY_AQUI
NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = TU_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY = TU_SERVICE_ROLE_KEY_AQUI
NEXT_PUBLIC_APP_URL = https://tu-app.vercel.app
NEXTAUTH_SECRET = genera_con_openssl_rand_base64_32
```

4. Haz clic en "Save"
5. Ve a Deployments → Latest → ⋯ → **Redeploy**

---

## 🔑 Dónde Obtener las Claves

### Stripe

1. <https://dashboard.stripe.com/apikeys>
2. Copia Publishable key y Secret key
3. Configura webhook en <https://dashboard.stripe.com/webhooks>
4. URL: `https://tu-app.vercel.app/api/webhooks/stripe`
5. Copia el Webhook secret

### Mercado Pago

1. <https://www.mercadopago.com.mx/developers/panel/credentials>
2. Modo Producción
3. Copia Access Token y Public Key
4. Configura webhook en <https://www.mercadopago.com.mx/developers/panel/webhooks>
5. URL: `https://tu-app.vercel.app/api/webhooks/mercadopago`

### Supabase

1. <https://app.supabase.com>
2. Crea proyecto
3. Ejecuta `supabase/schema.sql` en SQL Editor
4. Settings → API
5. Copia Project URL, anon key y service_role key

### NextAuth Secret

```bash
openssl rand -base64 32
```

---

## ✅ Verificar Despliegue

1. Visita tu app: `https://tu-app.vercel.app`
2. Deberías ver la landing page
3. Prueba el login (con credenciales dummy)
4. Una vez agregues las variables reales, prueba un pago

---

## 📁 Estructura del Proyecto

```
✅ /src/app          - Páginas y rutas
✅ /src/app/api      - API Routes (checkout, webhooks)
✅ /src/lib          - Utilidades y servicios
✅ /supabase         - Schema de base de datos
✅ .env              - Variables dummy (para build)
✅ .env.example      - Template de variables
✅ vercel.json       - Configuración de Vercel
```

---

## 🎯 Próximos Pasos

1. ✅ Proyecto desplegado en Vercel
2. ⏳ Agregar variables de entorno reales
3. ⏳ Configurar webhooks de Stripe y Mercado Pago
4. ⏳ Ejecutar schema SQL en Supabase
5. ⏳ Probar un pago real

---

## 🆘 Solución de Problemas

### Build falla en Vercel

- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel

### App muestra errores después de desplegar

- Asegúrate de haber agregado TODAS las variables de entorno
- Haz Redeploy después de agregar variables

### Webhooks no funcionan

- Verifica que las URLs de webhook apunten a tu dominio de Vercel
- Revisa que `STRIPE_WEBHOOK_SECRET` sea correcto

---

Tu app está lista para producción. Solo agrega tus credenciales reales y estará 100% funcional 🎉
