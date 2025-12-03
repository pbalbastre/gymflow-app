# 🌐 Guía: Desplegar GymFlow en GitHub Pages

## 📋 Requisitos Previos
- Git instalado
- Cuenta de GitHub (gratis)

---

## 🚀 Opción 1: Despliegue Rápido (Recomendado)

### Paso 1: Crear Repositorio en GitHub

1. Ve a **https://github.com/new**
2. Nombre del repositorio: `gymflow-app` (o el que prefieras)
3. Descripción: `Progressive Web App para registrar entrenamientos`
4. Visibilidad: **Public** (para que GitHub Pages funcione gratis)
5. ✅ NO marques "Add README" (ya tenemos uno)
6. Click en **"Create repository"**

---

### Paso 2: Subir el Código

Ejecuta estos comandos en tu terminal:

```bash
cd /Users/patricia/Antigravity/Trainer/gym-app

# Inicializar repositorio Git
git init

# Añadir todos los archivos
git add .

# Hacer el primer commit
git commit -m "🎉 Initial commit: GymFlow PWA v1.0"

# Conectar con GitHub (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/gymflow-app.git

# Cambiar a rama main
git branch -M main

# Subir el código
git push -u origin main
```

---

### Paso 3: Activar GitHub Pages

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/gymflow-app`
2. Click en **Settings** (⚙️)
3. En el menú izquierdo, click en **Pages**
4. En "Source", selecciona: **Deploy from a branch**
5. En "Branch", selecciona: **main** y carpeta **/ (root)**
6. Click en **Save**

---

### Paso 4: ¡Acceder a tu App!

Después de 1-2 minutos, tu app estará disponible en:
```
https://TU_USUARIO.github.io/gymflow-app/
```

O si usas un dominio personalizado, puedes configurarlo en la misma página.

---

## 🔄 Actualizar la App (Futuros Cambios)

Cada vez que hagas cambios en el código:

```bash
cd /Users/patricia/Antigravity/Trainer/gym-app

# Ver qué archivos cambiaron
git status

# Añadir todos los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "✨ Añadida nueva funcionalidad de rutinas"

# Subir cambios
git push
```

GitHub Pages se actualizará automáticamente en 1-2 minutos.

---

## 🎨 Personalización Avanzada

### Usar Dominio Personalizado

1. Compra un dominio (ej: `gymflow.app` en Namecheap, ~$10/año)
2. En GitHub Pages settings, añade tu dominio personalizado
3. Configura los DNS según las instrucciones de GitHub
4. ¡Listo! Tu app estará en `https://gymflow.app`

### Añadir HTTPS Personalizado

GitHub Pages incluye HTTPS automáticamente (SSL gratis con Let's Encrypt)

---

## 📱 Instalar en iPhone desde GitHub Pages

Una vez desplegada:

1. Abre **Safari** en tu iPhone
2. Ve a `https://TU_USUARIO.github.io/gymflow-app/`
3. Toca el botón **Compartir** (□↑)
4. Selecciona **"Agregar a pantalla de inicio"**
5. Personaliza el nombre si quieres
6. ¡La app aparecerá en tu pantalla de inicio como una app nativa!

---

## 🔍 Verificar el Despliegue

### Ver el Estado
En tu repositorio, ve a **Actions** para ver el estado del despliegue.

### Logs de Despliegue
Si algo falla, los logs te mostrarán qué sucedió.

---

## 💡 Consejos

### .gitignore
Ya incluimos los archivos necesarios. Si quieres excluir algo más:

```bash
echo "node_modules/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "ngrok" >> .gitignore
```

### Ramas para Desarrollo
Puedes crear una rama de desarrollo:

```bash
# Crear rama de desarrollo
git checkout -b dev

# Hacer cambios y probar

# Cuando estés listo, fusionar con main
git checkout main
git merge dev
git push
```

### README con URL
Actualiza el README.md con la URL de tu app:

```markdown
## 🌐 Demo en Vivo
[Ver GymFlow App](https://TU_USUARIO.github.io/gymflow-app/)
```

---

## 🆘 Solución de Problemas

### La app no carga / Error 404
- Verifica que el repositorio sea **público**
- Asegúrate de que GitHub Pages esté activado
- Espera 2-3 minutos después de activarlo

### Los cambios no se ven
- Limpia la caché del navegador (Cmd+Shift+R)
- Espera 1-2 minutos para que GitHub Pages se actualice
- Verifica que hiciste `git push`

### Error de permisos al hacer push
```bash
# Usa token personal en lugar de contraseña
# Ve a: https://github.com/settings/tokens
# Genera un token y úsalo como contraseña
```

---

## 🎯 Workflow Completo (Ngrok → GitHub)

```bash
# 1. DESARROLLO LOCAL
python3 -m http.server 8000
./ngrok http 8000
# Prueba en iPhone, haz cambios

# 2. CUANDO ESTÉS SATISFECHO
git status
git add .
git commit -m "🚀 Versión final v1.0"
git push

# 3. ESPERA 2 MINUTOS
# Tu app estará en: https://TU_USUARIO.github.io/gymflow-app/

# 4. INSTALA EN IPHONE
# Safari → URL → Compartir → Añadir a pantalla de inicio
```

---

## 📊 Estadísticas y Analytics (Opcional)

Si quieres ver cuánta gente usa tu app:

1. Crea cuenta en **Google Analytics** o **Plausible** (gratis)
2. Añade el código de tracking a `index.html`
3. Verás estadísticas de uso

---

## 🔐 Hacer el Repositorio Privado (Requiere GitHub Pro)

Si quieres que el código sea privado pero la app pública:
- Necesitas **GitHub Pro** ($4/mes) o **GitHub Student Pack** (gratis para estudiantes)
- GitHub Pages funciona en repos privados con estos planes

---

## ✅ Checklist Final

Antes de desplegar:

- [ ] Código funciona correctamente en local
- [ ] Probado en iPhone con ngrok
- [ ] README.md actualizado
- [ ] Iconos generados correctamente
- [ ] Service Worker configurado
- [ ] manifest.json correcto
- [ ] No hay secretos/tokens en el código

---

**¿Listo para desplegar?** Sígueme estos pasos y en 5 minutos tu app estará online 24/7. 🚀
