# 🚀 Despliegue en Vercel - Conética Educativa™

## Pasos para Desplegar

### 1. Preparar el Proyecto

```bash
# Asegúrate de que todo compile
npm run build

# Verifica que no haya errores
npm run lint
```

### 2. Conectar con Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login
vercel login

# Desplegar
vercel
```

### 3. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en <https://vercel.com/dashboard>
2. Settings → Environment Variables
3. Agrega TODAS las variables de `.env.example`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URL (TU DOMINIO REAL)
NEXT_PUBLIC_APP_URL=https://tudominio.com

# NextAuth
NEXTAUTH_SECRET=tu_secret_generado_con_openssl
```

### 4. Configurar Webhooks

Una vez desplegado, configura los webhooks con tu URL de producción:

**Stripe:**

- URL: `https://tudominio.com/api/webhooks/stripe`

**Mercado Pago:**

- URL: `https://tudominio.com/api/webhooks/mercadopago`

### 5. Configurar Dominio Personalizado

1. En Vercel: Settings → Domains
2. Agrega tu dominio
3. Configura los DNS según las instrucciones

### 6. Verificar Despliegue

```bash
# Probar endpoints
curl https://tudominio.com/api/health

# Verificar que las variables estén cargadas
# (no expongas las secretas, solo verifica que existan)
```

---

## Checklist Post-Despliegue

- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Webhooks de Stripe configurados
- [ ] ✅ Webhooks de Mercado Pago configurados
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ SSL/HTTPS activo
- [ ] ✅ Prueba de pago real completada
- [ ] ✅ Webhooks recibidos correctamente
- [ ] ✅ Usuario activado después de pago

---

## Monitoreo

### Logs en Vercel

```bash
vercel logs
```

### Analytics

- Vercel Analytics: Automático
- Stripe Dashboard: Monitorea transacciones
- Supabase Dashboard: Monitorea base de datos

---

## Rollback

Si algo sale mal:

```bash
# Ver deployments
vercel ls

# Hacer rollback a deployment anterior
vercel rollback [deployment-url]
```
