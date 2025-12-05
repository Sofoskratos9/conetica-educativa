# 🔒 Guía de Seguridad - Conética Educativa™

## Medidas de Seguridad Implementadas

### 1. Middleware de Protección de Rutas

**Archivo**: `src/middleware.ts`

✅ **Implementado**:

- Protección de todas las rutas privadas
- Verificación de autenticación
- Control de acceso basado en roles
- Redirección automática según rol
- Headers de seguridad (CSP, X-Frame-Options, etc.)

**Rutas Protegidas**:

- `/dashboard/*` → Solo estudiantes y admins
- `/parent/*` → Solo padres y admins
- `/admin/*` → Solo admins

### 2. Sanitización de Entradas

**Archivo**: `src/lib/security/sanitization.ts`

✅ **Funciones Implementadas**:

- `sanitizeHtml()` - Previene XSS
- `stripHtml()` - Elimina todo HTML
- `sanitizeInput()` - Limpia entradas generales
- `sanitizeEmail()` - Valida emails
- `sanitizeUuid()` - Valida UUIDs
- `sanitizeUrl()` - Valida URLs
- `sanitizePhone()` - Valida teléfonos
- `sanitizeSqlString()` - Previene SQL injection
- `checkRateLimit()` - Previene abuso
- `validateFileUpload()` - Valida archivos

**Protecciones**:

- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ Command Injection
- ✅ Path Traversal
- ✅ Rate Limiting

### 3. Autorización por Rol

**Archivo**: `src/lib/security/authorization.ts`

✅ **Funciones Implementadas**:

- `verifyResourceAccess()` - Verifica acceso a recursos
- `getUserAuthContext()` - Obtiene contexto de usuario
- `verifyParentChildRelationship()` - Verifica relación padre-hijo
- `getAccessibleUserIds()` - Lista usuarios accesibles
- `applyAccessFilter()` - Filtra resultados por acceso
- `hasPermission()` - Verifica permisos específicos

**Reglas de Acceso**:

- **Estudiantes**: Solo sus propios datos
- **Padres**: Solo datos de su hijo
- **Admins**: Todos los datos

### 4. Row Level Security (RLS)

**Archivo**: `supabase/schema.sql`

✅ **Políticas Implementadas**:

```sql
-- Usuarios solo ven sus propios datos
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Transacciones: solo las propias
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Progreso: solo el propio
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
```

### 5. Headers de Seguridad

Implementados en middleware:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (restrictivo)
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6. Validación de Webhooks

**Stripe**:

```typescript
stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

**Mercado Pago**:

- Validación de payload
- Verificación de origen

---

## Checklist de Seguridad

### Protección de Datos

- [x] ✅ Sanitización de todas las entradas
- [x] ✅ Validación con Zod en API routes
- [x] ✅ RLS activado en Supabase
- [x] ✅ Encriptación en tránsito (HTTPS)
- [x] ✅ Variables sensibles en .env

### Control de Acceso

- [x] ✅ Middleware de autenticación
- [x] ✅ Verificación de roles
- [x] ✅ Padres solo ven a sus hijos
- [x] ✅ Estudiantes solo ven sus datos
- [x] ✅ Admins tienen acceso total

### Prevención de Ataques

- [x] ✅ XSS Prevention (DOMPurify)
- [x] ✅ SQL Injection Prevention (Supabase + sanitización)
- [x] ✅ CSRF Protection (SameSite cookies)
- [x] ✅ Rate Limiting
- [x] ✅ File Upload Validation

### Headers de Seguridad

- [x] ✅ CSP (Content Security Policy)
- [x] ✅ X-Frame-Options
- [x] ✅ X-Content-Type-Options
- [x] ✅ Referrer-Policy
- [x] ✅ Permissions-Policy

---

## Uso de Funciones de Seguridad

### Sanitizar Entrada de Usuario

```typescript
import { sanitizeInput, sanitizeEmail } from '@/lib/security/sanitization';

const safeName = sanitizeInput(userInput);
const safeEmail = sanitizeEmail(emailInput);
```

### Verificar Acceso a Recurso

```typescript
import { verifyResourceAccess, getUserAuthContext } from '@/lib/security/authorization';

const context = await getUserAuthContext(userId);
const hasAccess = await verifyResourceAccess(context, 'transaction', transactionId);

if (!hasAccess) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/security/sanitization';

if (!checkRateLimit(userId, 10, 60000)) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

---

## Recomendaciones Adicionales

### Para Producción

1. **Habilitar HTTPS**: Obligatorio en Vercel
2. **Configurar CORS**: Solo dominios permitidos
3. **Monitorear Logs**: Revisar intentos de acceso no autorizado
4. **Auditorías Regulares**: Revisar permisos y accesos
5. **Actualizar Dependencias**: `npm audit fix`

### Buenas Prácticas

- Nunca exponer API keys en el cliente
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en backend
- Validar TODOS los inputs del usuario
- Implementar logging de eventos de seguridad
- Hacer backups regulares de la base de datos

### Monitoreo

```sql
-- Ver intentos de acceso no autorizado
SELECT * FROM webhook_events WHERE processed = false;

-- Ver transacciones sospechosas
SELECT * FROM transactions WHERE status = 'failed';
```

---

## Vulnerabilidades Comunes PREVENIDAS

✅ **SQL Injection**: Supabase usa prepared statements + sanitización
✅ **XSS**: DOMPurify + CSP headers
✅ **CSRF**: SameSite cookies + token validation
✅ **Clickjacking**: X-Frame-Options: DENY
✅ **MIME Sniffing**: X-Content-Type-Options: nosniff
✅ **Path Traversal**: Validación de rutas
✅ **Brute Force**: Rate limiting
✅ **Session Hijacking**: Secure cookies + HTTPS
✅ **Data Exposure**: RLS + role-based access

---

## Contacto de Seguridad

Si encuentras una vulnerabilidad, reporta a:
📧 <security@coneticaeducativa.com>

**NO publiques vulnerabilidades públicamente.**
