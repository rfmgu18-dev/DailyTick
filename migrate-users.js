require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/models/User');

async function migrateUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`📊 Encontrados ${users.length} usuarios`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      // Historial de Actividad
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

      // Estadísticas Avanzadas
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

      // Información de Usuario
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

      // Preferencias de Hábitos
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

      // Contadores de Hábitos
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

      // Gamificación Mejorada
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
        console.log(`✅ Usuario actualizado: ${user.email}`);
      }
    }

    console.log(`\n🎉 Migración completada. ${updatedCount} usuarios actualizados.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateUsers();
