# 🚀 Guía para Subir Conética Educativa a GitHub

## Paso 1: Crear el Repositorio en GitHub

1. **Abre tu navegador** y ve a [github.com](https://github.com)
2. **Inicia sesión** con tu cuenta de GitHub
3. Haz clic en el botón **"+"** en la esquina superior derecha
4. Selecciona **"New repository"**
5. Configura el repositorio:
   - **Repository name:** `conetica-educativa`
   - **Description:** `Conética Educativa™ - Plataforma educativa con método y práctica guiada para estudiantes, padres y escuelas en Aguascalientes`
   - **Visibility:** Public (o Private si prefieres)
   - ⚠️ **NO marques** "Initialize this repository with a README" (ya tenemos estos archivos)
6. Haz clic en **"Create repository"**

## Paso 2: Copiar la URL del Repositorio

Después de crear el repositorio, GitHub te mostrará una página con instrucciones. Copia la URL que aparece, será algo como:

```text
https://github.com/TU_USUARIO/conetica-educativa.git
```

## Paso 3: Ejecutar los Comandos Git

Abre tu terminal en la carpeta del proyecto y ejecuta los siguientes comandos **UNO POR UNO**:

### 3.1 Agregar el repositorio remoto

```bash
cd /Users/miguelneftalilopezesparza/.gemini/antigravity/scratch/conetica-educativa
git remote add origin https://github.com/TU_USUARIO/conetica-educativa.git
```

> ⚠️ **Importante:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub

### 3.2 Verificar que se agregó correctamente

```bash
git remote -v
```

### 3.3 Subir el código a GitHub

```bash
git push -u origin main
```

Si te pide autenticación, usa tu **Personal Access Token** de GitHub (no tu contraseña).

## Paso 4: Verificar

1. Regresa a tu navegador
2. Recarga la página de tu repositorio en GitHub
3. Deberías ver todos los archivos del proyecto

## 🎉 ¡Listo

Tu proyecto Conética Educativa ahora está en GitHub.

---

## 📝 Notas Importantes

### Archivos Protegidos

El archivo `.env` **NO se subirá** a GitHub (está en `.gitignore`). Esto es correcto para proteger tus credenciales.

### Próximos Pasos Recomendados

1. Configurar GitHub Actions para CI/CD
2. Conectar con Vercel para deployment automático
3. Configurar branch protection rules en GitHub

### Troubleshooting

**Si git push falla con error de autenticación:**

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de `repo`
3. Usa ese token como contraseña cuando git te lo pida

**Si necesitas cambiar la URL del repositorio:**

```bash
git remote set-url origin https://github.com/NUEVO_USUARIO/conetica-educativa.git
```
