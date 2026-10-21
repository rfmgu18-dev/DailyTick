# DailyTick - Habit Tracker & Daily Log

![DailyTick](https://img.shields.io/badge/Version-1.0.0-success)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

Una aplicación web FullStack moderna y completa para seguimiento de hábitos con sistema de gamificación, estadísticas en tiempo real y una interfaz de usuario pulida y moderna.

## � Capturas

### Interfaz Principal
- Dashboard con hábitos del día
- Barra de progreso de cumplimiento diario
- Sidebar con información del usuario (racha, nivel, puntos)
- Navegación intuitiva entre secciones

### Gestión de Hábitos
- Creación de hábitos personalizados con emojis
- Configuración de frecuencia (días de la semana)
- Duración personalizada por hábito
- Edición y eliminación de hábitos
- Marcado rápido de hábitos completados

### Estadísticas
- Racha actual de días consecutivos
- Tasa de cumplimiento (últimos 30 días)
- Gráfico semanal de progreso
- Hábito más consistente
- Total de hábitos activos

### Calendario Interactivo
- Vista mensual con color de progreso por día
- Navegación entre meses
- Detalle de hábitos completados por día
- Colores según porcentaje de cumplimiento

### Sistema de Logros
- 10 logros desbloqueables
- Sistema de puntos por hábitos completados
- Niveles de progreso
- Notificaciones de logros desbloqueados

### Temas
- Modo claro con gradientes suaves
- Modo oscuro con tema cósmico
- Persistencia de preferencia de tema
- Transiciones suaves entre temas

## 🚀 Características Principales

### ✅ Gestión de Hábitos
- Crear hábitos personalizados con nombre, emoji, categoría y duración
- Configurar frecuencia por día de la semana (L, M, X, J, V, S, D)
- Marcar/desmarcar hábitos como completados
- Editar y eliminar hábitos existentes
- Hábitos por defecto para nuevos usuarios

### 📊 Estadísticas Avanzadas
- **Racha**: Días consecutivos completando hábitos
- **Tasa de cumplimiento**: Porcentaje de hábitos completados en los últimos 30 días
- **Gráfico semanal**: Visualización del progreso de los últimos 7 días
- **Hábito más consistente**: Identifica el hábito con mayor tasa de cumplimiento
- **Total de hábitos**: Cantidad de hábitos activos

### 📅 Calendario Mensual
- Vista visual del progreso mensual
- Colores según porcentaje de cumplimiento:
  - 100%: Verde intenso
  - 75-99%: Verde medio
  - 50-74%: Verde claro
  - 25-49%: Verde muy claro
  - 0-24%: Blanco/Verde pálido
- Navegación entre meses con botones ◀ ▶
- Click en un día para ver detalle de hábitos

### 🎮 Sistema de Gamificación
- **Puntos**: 1 punto por cada hábito completado
- **Niveles**: Cada 100 puntos subes de nivel
- **Logros desbloqueables**:
  - 🎯 Primer Paso - Crear tu primer hábito
  - 🔥 Primera Semana - Racha de 7 días
  - 🏆 Maestro de Hábitos - Completar un hábito 30 veces
  - ⭐ Día Perfecto - Completar todos los hábitos en un día
  - 📈 Mes Consistente - 80% de cumplimiento en un mes
  - 🌅 Madrugador - Completar hábitos antes de las 8am por 7 días
  - 🦉 Búho Nocturno - Completar hábitos después de las 10pm por 7 días
  - 🧭 Explorador - Crear 10 hábitos diferentes
  - 💎 Maestro de Rachas - Racha de 30 días
  - 💯 Club del 100 - Completar 100 hábitos en total

### 🎨 Diseño y UX
- Interfaz moderna con gradientes y efectos suaves
- Animaciones fluidas en todas las interacciones
- Glassmorphism en tarjetas y modales
- Efectos hover elegantes
- Transiciones suaves entre secciones
- Scrollbar personalizado
- Diseño responsive para móviles y desktop
- Tema claro y oscuro con persistencia

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Estructura semántica
- **Tailwind CSS**: Framework de estilos utility-first
- **JavaScript Vanilla**: Lógica de la aplicación sin frameworks
- **CSS3**: Animaciones y efectos personalizados

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web para API REST
- **Express-Session**: Gestión de sesiones de usuario
- **JWT**: Autenticación con tokens

### Base de Datos
- **MongoDB Atlas**: Base de datos NoSQL en la nube
- **Mongoose**: ODM para MongoDB con esquemas

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta en MongoDB Atlas
- Git (opcional)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/rfmgu18-dev/DailyTick.git
cd DailyTick
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` en la raíz del proyecto:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/dailytick
PORT=3000
SESSION_SECRET=tu-secreto-aqui
JWT_SECRET=tu-secreto-jwt-aqui
NODE_ENV=development
```

4. **Iniciar el servidor**
```bash
npm start
```

La aplicación estará disponible en http://localhost:3000

## 🔐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | URL de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Puerto del servidor | `3000` |
| `SESSION_SECRET` | Secreto para encriptar sesiones | `mi-secreto-secreto` |
| `JWT_SECRET` | Secreto para generar tokens JWT | `mi-secreto-jwt` |
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |

## 📁 Estructura del Proyecto

```
DailyTick/
├── backend/
│   ├── config/
│   │   └── database.js       # Configuración de MongoDB
│   ├── controllers/
│   │   ├── achievementController.js  # Lógica de logros
│   │   ├── authController.js         # Autenticación
│   │   ├── habitController.js        # CRUD de hábitos
│   │   └── statsController.js        # Estadísticas
│   ├── models/
│   │   ├── Habit.js          # Modelo de hábito
│   │   └── User.js           # Modelo de usuario
│   └── routes/
│       ├── achievements.js   # Rutas de logros
│       ├── auth.js          # Rutas de autenticación
│       ├── habits.js        # Rutas de hábitos
│       └── stats.js         # Rutas de estadísticas
├── frontend/
│   ├── css/
│   │   └── styles.css       # Estilos personalizados
│   ├── js/
│   │   └── app.js           # Lógica del frontend
│   └── index.html           # Página principal
├── landing.html             # Landing page
├── server.js                # Servidor Express
├── package.json             # Dependencias
└── .env                     # Variables de entorno (no incluido en repo)
```

## 🔌 API Endpoints

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
- `GET /api/habits` - Obtener todos los hábitos
- `GET /api/habits/:date` - Obtener hábitos de una fecha
- `POST /api/habits` - Crear hábito
- `POST /api/habits/default` - Crear hábitos por defecto
- `PUT /api/habits/:habitId` - Actualizar hábito
- `PUT /api/habits/:habitId/toggle` - Marcar/desmarcar hábito
- `DELETE /api/habits/:habitId` - Eliminar hábito

### Estadísticas
- `GET /api/stats` - Obtener estadísticas generales
- `GET /api/stats/month/:year/:month` - Obtener datos mensuales

### Logros
- `GET /api/achievements` - Obtener logros del usuario
- `GET /api/achievements/level-progress` - Obtener progreso de nivel

## 🎯 Estado del Proyecto

**✅ PROYECTO COMPLETO Y FUNCIONAL**

Todas las funcionalidades han sido implementadas y probadas:
- ✅ Sistema de autenticación completo
- ✅ CRUD de hábitos funcional
- ✅ Estadísticas en tiempo real
- ✅ Calendario interactivo
- ✅ Sistema de gamificación con 10 logros
- ✅ Temas claro y oscuro
- ✅ Diseño responsive
- ✅ Animaciones y efectos suaves
- ✅ Validaciones de datos
- ✅ Manejo de errores

## 🚀 Despliegue

### Despliegue en Producción

1. **Configurar variables de entorno** con valores de producción
2. **Cambiar NODE_ENV a production**
3. **Usar un servidor de archivos estáticos** para el frontend
4. **Configurar HTTPS** en producción
5. **Usar una base de datos de producción** en MongoDB Atlas

### Plataformas sugeridas
- **Render.com**: Gratis para Node.js
- **Heroku**: Gratis para Node.js
- **Vercel**: Excelente para frontend
- **Railway**: Balanceado para fullstack

## 📝 Notas de Desarrollo

### Características Técnicas
- Gestión de sesiones con express-session
- Autenticación con JWT tokens
- Validaciones con Mongoose
- Animaciones CSS personalizadas
- Responsive design con Tailwind
- API RESTful
- Manejo de errores robusto

### Mejoras Implementadas
- Corrección de lógica de calendario (cálculo de hábitos programados vs completados)
- Sistema de puntos por hábito completado (1 punto = 1 hábito)
- Persistencia de tema de usuario
- Sincronización de barra de progreso
- Corrección de tasa de cumplimiento
- Navegación de meses en calendario
- Mejoras en CSS con efectos sutiles

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Rubén Maldonado** - [GitHub](https://github.com/rfmgu18-dev)

## 🙏 Agradecimientos

- Tailwind CSS por el framework de estilos
- MongoDB por la base de datos NoSQL
- Express.js por el framework web
- La comunidad de open source

---

**Hecho con ❤️ y JavaScript**
