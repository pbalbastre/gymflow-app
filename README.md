# GymFlow 💪

Una Progressive Web App (PWA) premium para registrar y monitorear entrenamientos en el gimnasio. Optimizada para iPhone 16.

## Características

### Básicas
- ✅ Registrar ejercicios (nombre, series, repeticiones, peso)
- ✅ Crear y guardar entrenamientos
- ✅ Historial de entrenamientos
- ✅ Categorización por grupos musculares

### Avanzadas
- 📊 Gráficos de progreso semanal
- ⏱️ Temporizador para descansos con presets personalizables
- 📅 Vista de entrenamientos por fecha
- 🧮 Calculadora de 1RM (una repetición máxima)
- 📝 Notas por entrenamiento
- 🏆 Récords personales por ejercicio
- 💾 Exportar/Importar datos
- 🌙 Diseño oscuro premium con glassmorphism

## Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con variables CSS, gradientes y animaciones
- **JavaScript (Vanilla)** - Lógica de la aplicación
- **PWA** - Instalable y funciona offline
- **LocalStorage** - Persistencia de datos local

## Instalación en iPhone

1. Abre Safari y ve a la URL de la aplicación
2. Toca el botón de compartir (cuadrado con flecha hacia arriba)
3. Selecciona "Agregar a pantalla de inicio"
4. La app aparecerá en tu iPhone como una app nativa

## Uso Local

```bash
# Navega a la carpeta del proyecto
cd gym-app

# Inicia un servidor local (puedes usar cualquier servidor HTTP)
# Opción 1: Python
python3 -m http.server 8000

# Opción 2: Node.js (si tienes http-server instalado)
npx http-server -p 8000

# Opción 3: PHP
php -S localhost:8000
```

Luego abre tu navegador en `http://localhost:8000`

## Características de Diseño

- **Tema oscuro premium** con colores cuidadosamente seleccionados
- **Glassmorphism effects** para profundidad visual
- **Gradientes vibrantes** en elementos interactivos
- **Micro-animaciones** fluidas para mejor UX
- **Tipografía moderna** (Inter + Outfit de Google Fonts)
- **Optimizado para iPhone 16** con soporte para safe areas

## Se usa un subconjunto de la Bbase de datos de ejercicios de:
https://github.com/wrkout/exercises.json
autor: @olliejennings

## Estructura del Proyecto

```
gym-app/
├── index.html          # Estructura principal
├── styles.css          # Sistema de diseño y estilos
├── app.js              # Lógica de la aplicación
├── manifest.json       # Configuración PWA
├── service-worker.js   # Service Worker para offline
├── icons/              # Iconos de la app
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

## Próximas Características

- 📅 Calendario mensual de entrenamientos
- 📋 Plantillas de rutinas predefinidas
- 📈 Más gráficos y estadísticas
- 🔔 Notificaciones push
- ☁️ Sincronización en la nube (opcional)

## Licencia

MIT License - Libre para uso personal y comercial

---

Desarrollado con ❤️ para amantes del fitness
