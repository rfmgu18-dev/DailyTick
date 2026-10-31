require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./backend/config/database');
const { startDeadlineScheduler } = require('./backend/services/deadlineNotifier');

const app = express();

// Confiar en proxy para sesiones en producción (Render)
app.set('trust proxy', 1);

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend'), { index: false }));

app.use(require('express-session')({
  secret: process.env.SESSION_SECRET || 'dailytick-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // none en producción para cross-domain
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/habits', require('./backend/routes/habits'));
app.use('/api/stats', require('./backend/routes/stats'));
app.use('/api/achievements', require('./backend/routes/achievements'));
app.use('/api/admin', require('./backend/routes/admin'));
app.use('/api/goals', require('./backend/routes/goals'));
app.use('/api/notifications', require('./backend/routes/notifications'));

// Endpoint temporal para migración en producción (sin autenticación)
app.post('/api/migrate', async (req, res) => {
  try {
    const User = require('./backend/models/User');
    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      if (!user.lastLoginDate) {
        user.lastLoginDate = user.createdAt;
        needsUpdate = true;
      }
      if (!user.firstLoginDate) {
        user.firstLoginDate = user.createdAt;
        needsUpdate = true;
      }
      if (user.totalActiveDays === undefined) {
        user.totalActiveDays = 0;
        needsUpdate = true;
      }
      if (user.currentInactiveDays === undefined) {
        user.currentInactiveDays = 0;
        needsUpdate = true;
      }
      if (user.completionRate === undefined) {
        user.completionRate = 0;
        needsUpdate = true;
      }
      if (user.bestStreak === undefined) {
        user.bestStreak = user.streak || 0;
        needsUpdate = true;
      }
      if (user.mostCompletedHabit === undefined) {
        user.mostCompletedHabit = '';
        needsUpdate = true;
      }
      if (user.favoriteCategory === undefined) {
        user.favoriteCategory = '';
        needsUpdate = true;
      }
      if (user.totalHoursDedicated === undefined) {
        user.totalHoursDedicated = 0;
        needsUpdate = true;
      }
      if (user.timezone === undefined) {
        user.timezone = 'UTC';
        needsUpdate = true;
      }
      if (user.language === undefined) {
        user.language = 'es';
        needsUpdate = true;
      }
      if (user.country === undefined) {
        user.country = '';
        needsUpdate = true;
      }
      if (user.defaultHabitDuration === undefined) {
        user.defaultHabitDuration = 30;
        needsUpdate = true;
      }
      if (user.preferredNotificationTime === undefined) {
        user.preferredNotificationTime = '09:00';
        needsUpdate = true;
      }
      if (!user.customCategories) {
        user.customCategories = [];
        needsUpdate = true;
      }
      if (user.totalHabitsCreated === undefined) {
        user.totalHabitsCreated = 0;
        needsUpdate = true;
      }
      if (user.activeHabitsCount === undefined) {
        user.activeHabitsCount = 0;
        needsUpdate = true;
      }
      if (user.archivedHabitsCount === undefined) {
        user.archivedHabitsCount = 0;
        needsUpdate = true;
      }
      if (user.totalXP === undefined) {
        user.totalXP = user.points || 0;
        needsUpdate = true;
      }
      if (!user.badges) {
        user.badges = [];
        needsUpdate = true;
      }
      if (user.currentLevelProgress === undefined) {
        user.currentLevelProgress = 0;
        needsUpdate = true;
      }
      if (!user.customAchievements) {
        user.customAchievements = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
      }
    }

    res.json({ message: `Migración completada. ${updatedCount} usuarios actualizados.`, updatedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error en migración', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  // Iniciar el scheduler de deadlines después de que el servidor esté listo
  startDeadlineScheduler();
});

module.exports = app;
