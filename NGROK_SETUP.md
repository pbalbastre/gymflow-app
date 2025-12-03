# 🚀 Guía Rápida: Configurar Ngrok para GymFlow

## ✅ Paso 1: Crear Cuenta en Ngrok (2 minutos)

1. Ve a: **https://dashboard.ngrok.com/signup**
2. Puedes registrarte con:
   - Google
   - GitHub
   - Email
3. Es **100% GRATIS** - no necesitas tarjeta de crédito

---

## 🔑 Paso 2: Obtener tu Authtoken (1 minuto)

1. Una vez registrado, ve a: **https://dashboard.ngrok.com/get-started/your-authtoken**
2. Copia el token (se ve así: `2abc123def456ghi789jkl_mnopqrSTUVwxyzABCDEF`)

---

## ⚙️ Paso 3: Configurar Ngrok (30 segundos)

Ejecuta este comando en la terminal (reemplaza `TU_AUTHTOKEN` con el token que copiaste):

```bash
cd /Users/patricia/Antigravity/Trainer/gym-app
./ngrok config add-authtoken TU_AUTHTOKEN
```

---

## 🎯 Paso 4: Iniciar Ngrok

Una vez configurado, ejecuta:

```bash
./ngrok http 8000
```

Verás algo como esto:

```
ngrok                                                                   

Session Status                online
Account                       Tu Email (Plan: Free)
Version                       3.x.x
Region                        Europe (eu)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

## 📱 Paso 5: Acceder desde tu iPhone

1. Copia la URL que aparece en **"Forwarding"** (ej: `https://abc123.ngrok-free.app`)
2. Ábrela en **Safari** en tu iPhone
3. ¡La app GymFlow cargará!

---

## 💡 Notas Importantes

### ⏱️ Duración de la Sesión
- **Plan Gratuito**: La URL cambia cada vez que reinicias ngrok
- Si cierras ngrok y lo vuelves a abrir, tendrás una nueva URL
- Las sesiones duran hasta que cierres ngrok (sin límite de tiempo en v3)

### 🔄 Reiniciar Ngrok
Si necesitas parar y reiniciar:
```bash
# Presiona Ctrl+C para detener ngrok
# Luego vuelve a ejecutar:
./ngrok http 8000
```

### 📊 Panel de Control
Mientras ngrok está corriendo, puedes ver estadísticas en:
**http://127.0.0.1:4040**

---

## 🆘 Solución de Problemas

### Error: "command not found: ./ngrok"
```bash
cd /Users/patricia/Antigravity/Trainer/gym-app
chmod +x ngrok
./ngrok http 8000
```

### El servidor HTTP no está corriendo
Verifica que el servidor Python esté activo:
```bash
python3 -m http.server 8000
```

### Cambiar el puerto
Si el puerto 8000 está ocupado:
```bash
# Terminal 1
python3 -m http.server 8080

# Terminal 2
./ngrok http 8080
```

---

## 🎉 ¡Listo!

Una vez configurado, podrás:
- ✅ Probar GymFlow en tu iPhone
- ✅ Ver cambios en tiempo real
- ✅ Compartir la URL con amigos (temporal)
- ✅ Desarrollar y probar rápidamente

---

## 📝 Comando Resumido (después de configurar)

```bash
# En una terminal (si no está corriendo):
python3 -m http.server 8000

# En otra terminal:
./ngrok http 8000
```

---

**¿Necesitas ayuda?** Solo dime en qué paso estás y te asisto. 🚀
