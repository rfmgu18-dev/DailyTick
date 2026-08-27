# DailyTick - Habit Tracker & Daily Log

Una aplicación web FullStack moderna para seguimiento de hábitos, diseñada para ayudar a construir rutinas sólidas y medir la consistencia a través de una interfaz limpia e intuitiva.

## 🚀 Características Completas

### 🎯 Gestión de Hábitos
- ✅ **Creación Personalizada**: Crea hábitos con emojis, categorías, frecuencias y duraciones
- 🎨 **Selector de Emoji**: Amplia selección de emojis para personalizar tus hábitos
- 📅 **Frecuencia Flexible**: Configura hábitos para días específicos de la semana
- ⏱️ **Duración Configurable**: Establece tiempos con diferentes unidades (min, seg, horas)
- �️ **Gestión Completa**: Edita y elimina hábitos fácilmente

### 📊 Estadísticas Avanzadas
- 🔥 **Rachas en Tiempo Real**: Seguimiento automático de días consecutivos
- 📈 **Tasa de Cumplimiento**: Porcentaje real basado en tu historial
- 📊 **Gráficos Semanales**: Visualización de progreso semanal con datos reales
- 🏆 **Hábito Más Consistente**: Identifica tus hábitos más exitosos
- 📅 **Análisis Mensual**: Estadísticas detalladas por mes

### 📅 Calendario Interactivo
- 🗓️ **Vista Mensual**: Visualización completa de tu progreso mensual
- 🔄 **Navegación Fluida**: Cambia entre meses fácilmente
- 🎨 **Indicadores Visuales**: Colores según nivel de cumplimiento (verde, amarillo, naranja, rojo)
- � **Detalles por Día**: Click en cualquier día para ver hábitos específicos
- 📍 **Día Actual**: Destacado con anillo azul

### 🎮 Sistema de Gamificación
- 🏆 **10 Logros Desbloqueables**: 
  - 🎯 Primer Paso - Crear tu primer hábito
  - 🔥 Primera Semana - Racha de 7 días
  - 🏆 Maestro de Hábitos - Completar hábito 30 veces
  - ⭐ Día Perfecto - Completar todos los hábitos en un día
  - 📈 Mes Consistente - 80% cumplimiento mensual
  - 🌅 Madrugador - Completar hábitos antes de las 8am
  - 🦉 Búho Nocturno - Completar hábitos después de las 10pm
  - 🧭 Explorador - Crear 10 hábitos diferentes
  - 💎 Maestro de Rachas - Racha de 30 días
  - 💯 Club del 100 - Completar 100 hábitos
- ⭐ **Sistema de Puntos**: Gana puntos por cada logro desbloqueado
- 📊 **Niveles Progresivos**: Sube de nivel acumulando puntos
- 🎉 **Notificaciones**: Alertas visuales cuando desbloqueas logros

### ⚙️ Ajustes de Usuario
- 👤 **Edición de Perfil**: Actualiza nombre y email
- 🔐 **Seguridad**: Cambia tu contraseña fácilmente
- � **Temas**: Elige entre tema claro y oscuro
- 🔔 **Notificaciones**: Configura preferencias de recordatorios
- 🗑️ **Eliminación de Cuenta**: Opción para eliminar tu cuenta y datos

### 🎨 Interfaz Mejorada
- ✨ **Emojis en Checkboxes**: El emoji del hábito aparece al marcarlo como completado
- � **Diseño Minimalista**: Interfaz limpia y moderna
- 🔄 **Animaciones Suaves**: Transiciones fluidas en todas las interacciones
- 📱 **Responsive**: Optimizado para móviles y escritorio
- 🎨 **Colores Inteligentes**: Indicadores visuales de progreso

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript Vanilla
- **Backend**: Node.js, Express.js
- **Base de datos**: MongoDB Atlas con Mongoose
- **Autenticación**: Express Sessions + bcrypt
- **API**: RESTful API completa

## 📦 Instalación

1. **Navegar al directorio del proyecto**
   ```bash
   cd C:\www\DailyTick
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # El archivo .env ya está configurado con MongoDB Atlas
   # No necesitas MongoDB local
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   # O para desarrollo con auto-reload
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
DailyTick/
├── backend/
│   ├── config/
│   │   └── database.js              # Configuración de MongoDB Atlas
│   ├── controllers/
│   │   ├── authController.js       # Lógica de autenticación y ajustes
│   │   ├── habitController.js      # Lógica de hábitos y gamificación
│   │   ├── statsController.js      # Lógica de estadísticas avanzadas
│   │   └── achievementController.js # Lógica de logros y niveles
│   ├── models/
│   │   ├── User.js                 # Modelo de usuario con gamificación
│   │   └── Habit.js                # Modelo de hábito con historial
│   └── routes/
│       ├── auth.js                 # Rutas de autenticación
│       ├── habits.js               # Rutas de hábitos
│       ├── stats.js                # Rutas de estadísticas
│       └── achievements.js         # Rutas de logros
├── frontend/
│   ├── css/
│   │   └── styles.css              # Estilos personalizados con animaciones
│   ├── js/
│   │   └── app.js                  # Lógica completa del frontend
│   └── index.html                 # Interfaz de usuario completa
├── public/                         # Archivos estáticos
├── server.js                       # Punto de entrada del servidor
├── package.json                    # Dependencias de Node
├── .env                            # Variables de entorno (MongoDB Atlas)
└── .gitignore                      # Archivos a ignorar en Git
```

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/password` - Cambiar contraseña
- `PUT /api/auth/settings` - Actualizar configuración
- `DELETE /api/auth/account` - Eliminar cuenta

### Hábitos
- `GET /api/habits` - Obtener todos los hábitos del usuario
- `GET /api/habits/:date` - Obtener hábitos de una fecha específica
- `POST /api/habits` - Crear nuevo hábito
- `PUT /api/habits/:habitId/toggle` - Marcar/desmarcar hábito como completado
- `PUT /api/habits/:habitId` - Actualizar hábito
- `DELETE /api/habits/:habitId` - Eliminar hábito

### Estadísticas
- `GET /api/stats` - Obtener estadísticas completas (racha, tasa, gráficos)
- `GET /api/stats/month/:year/:month` - Obtener datos mensuales para calendario

### Logros
- `GET /api/achievements` - Obtener logros disponibles y del usuario
- `GET /api/achievements/level-progress` - Obtener progreso de nivel

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación Completa
- [x] Registro de usuarios con validación
- [x] Login/Logout con gestión de sesiones
- [x] Encriptación de contraseñas con bcrypt
- [x] Actualización de perfil (nombre, email)
- [x] Cambio de contraseña
- [x] Configuración de tema (claro/oscuro)
- [x] Configuración de notificaciones
- [x] Eliminación segura de cuenta

### ✅ Gestión de Hábitos Avanzada
- [x] Creación con personalización completa
- [x] Selector de emoji mejorado con 100+ opciones
- [x] 8 categorías predefinidas
- [x] Configuración de frecuencia por días
- [x] Configuración de duración flexible
- [x] Marcado como completado con gamificación
- [x] Eliminación de hábitos
- [x] Historial de completados por fecha

### ✅ Estadísticas en Tiempo Real
- [x] Cálculo dinámico de racha actual
- [x] Tasa de cumplimiento (últimos 30 días)
- [x] Gráficos semanales con datos reales
- [x] Identificación de hábito más consistente
- [x] Completados mensuales
- [x] Datos históricos completos

### ✅ Calendario Interactivo
- [x] Vista mensual completa
- [x] Navegación entre meses (anterior/siguiente)
- [x] Indicadores visuales por nivel de cumplimiento
- [x] Detalles de días específicos
- [x] Colores: verde (100%), amarillo (50%+), naranja (menos 50%), rojo (0%)
- [x] Destacado del día actual

### ✅ Sistema de Gamificación
- [x] 10 logros únicos desbloqueables
- [x] Sistema de puntos por logro
- [x] Niveles progresivos (cada 100 puntos)
- [x] Verificación automática de logros
- [x] Notificaciones visuales de logros
- [x] Barra de progreso de nivel
- [x] Modal de logros con estados

### ✅ Ajustes de Usuario
- [x] Formulario de edición de perfil
- [x] Cambio de contraseña seguro
- [x] Selector de tema
- [x] Toggle de notificaciones
- [x] Zona de peligro para eliminar cuenta

### ✅ Frontend Profesional
- [x] Interfaz de Login/Registro mejorada
- [x] Dashboard principal con navegación lateral
- [x] Modal de creación de hábitos rediseñado
- [x] Lista de hábitos con checkboxes animados
- [x] Emojis dentro de checkboxes al completar
- [x] Selector de emoji con grid interactivo
- [x] Diseño minimalista y moderno
- [x] Animaciones y transiciones suaves
- [x] Responsive design completo
- [x] Tema claro/oscuro funcional

## 🎨 Diseño y UX

La aplicación sigue principios de diseño modernos:
- **Minimalismo**: Interfaz limpia sin elementos innecesarios
- **Consistencia**: Paleta de colores coherente (azules, grises, acentos)
- **Feedback Visual**: Respuestas inmediatas a acciones del usuario
- **Accesibilidad**: Contrastes adecuados y tipografía legible
- **Animaciones**: Transiciones suaves que mejoran la experiencia
- **Responsive**: Funciona perfectamente en cualquier dispositivo

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (salt rounds: 10)
- Sesiones gestionadas con express-session (24 horas)
- Validación de datos en backend y frontend
- Protección contra inyección (usando MongoDB)
- Verificación de credenciales en operaciones sensibles
- Soft delete para mantener integridad de datos

## 📝 Notas Técnicas

- **Arquitectura**: CommonJS para máxima compatibilidad
- **Base de Datos**: MongoDB Atlas para datos en la nube
- **Sesiones**: 24 horas de duración por defecto
- **Gamificación**: Verificación automática de logros al completar hábitos
- **Estadísticas**: Cálculos en tiempo real basados en historial
- **Calendario**: Generación dinámica de datos mensuales
- **Performance**: Índices en MongoDB para búsquedas eficientes

## 🚀 Estado del Proyecto

**✅ PROYECTO COMPLETO Y FUNCIONAL**

Todas las funcionalidades planificadas han sido implementadas:
- ✅ Backend completo con todos los endpoints
- ✅ Frontend profesional con todas las interfaces
- ✅ Gamificación completa con sistema de logros
- ✅ Estadísticas en tiempo real
- ✅ Calendario interactivo
- ✅ Ajustes de usuario completos
- ✅ Diseño mejorado según feedback de wireframes
- ✅ Conexión a MongoDB Atlas
- ✅ Sistema de emojis mejorado
- ✅ Animaciones y transiciones suaves

## 🤝 Contribuciones

Este es un proyecto final para desarrollo FullStack. La aplicación está completa y lista para uso.

## 📄 Licencia

ISC

---

**Desarrollado como proyecto final de programación FullStack**
*Frontend: HTML + Tailwind CSS + JavaScript | Backend: Node.js + Express + MongoDB Atlas*
*Versión completa con gamificación, estadísticas avanzadas y calendario interactivo*