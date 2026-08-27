const User = require('../models/User');
const Habit = require('../models/Habit');

// Definición de logros disponibles
const ACHIEVEMENTS = {
  FIRST_HABIT: {
    id: 'first_habit',
    name: 'Primer Paso',
    description: 'Crear tu primer hábito',
    icon: '🎯',
    points: 10
  },
  FIRST_WEEK: {
    id: 'first_week',
    name: 'Primera Semana',
    description: 'Mantener una racha de 7 días',
    icon: '🔥',
    points: 50
  },
  HABIT_MASTER: {
    id: 'habit_master',
    name: 'Maestro de Hábitos',
    description: 'Completar un hábito 30 veces',
    icon: '🏆',
    points: 100
  },
  PERFECT_DAY: {
    id: 'perfect_day',
    name: 'Día Perfecto',
    description: 'Completar todos los hábitos en un día',
    icon: '⭐',
    points: 25
  },
  CONSISTENT_MONTH: {
    id: 'consistent_month',
    name: 'Mes Consistente',
    description: 'Lograr 80% de cumplimiento en un mes',
    icon: '📈',
    points: 75
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completar hábitos antes de las 8am por 7 días',
    icon: '🌅',
    points: 40
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Completar hábitos después de las 10pm por 7 días',
    icon: '🦉',
    points: 40
  },
  HABIT_EXPLORER: {
    id: 'habit_explorer',
    name: 'Explorador',
    description: 'Crear 10 hábitos diferentes',
    icon: '🧭',
    points: 60
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Maestro de Rachas',
    description: 'Mantener una racha de 30 días',
    icon: '💎',
    points: 150
  },
  CENTURY_CLUB: {
    id: 'century_club',
    name: 'Club del 100',
    description: 'Completar 100 hábitos en total',
    icon: '💯',
    points: 200
  }
};

// Obtener todos los logros disponibles y los del usuario
const getAchievements = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const achievementsList = Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: user.achievements.includes(achievement.id),
      unlockedAt: user.achievements.includes(achievement.id) ? 'Desbloqueado' : 'Pendiente'
    }));

    res.json({
      achievements: achievementsList,
      userPoints: user.points,
      userLevel: user.level,
      totalUnlocked: user.achievements.length,
      totalAvailable: Object.keys(ACHIEVEMENTS).length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener logros', error: error.message });
  }
};

// Verificar y desbloquear logros
const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    const habits = await Habit.find({ user: userId, active: true });

    if (!user || !habits) return;

    const newAchievements = [];

    // Verificar FIRST_HABIT
    if (habits.length >= 1 && !user.achievements.includes('first_habit')) {
      user.achievements.push('first_habit');
      user.points += ACHIEVEMENTS.FIRST_HABIT.points;
      newAchievements.push(ACHIEVEMENTS.FIRST_HABIT);
    }

    // Verificar FIRST_WEEK (racha de 7 días)
    if (user.streak >= 7 && !user.achievements.includes('first_week')) {
      user.achievements.push('first_week');
      user.points += ACHIEVEMENTS.FIRST_WEEK.points;
      newAchievements.push(ACHIEVEMENTS.FIRST_WEEK);
    }

    // Verificar STREAK_MASTER (racha de 30 días)
    if (user.streak >= 30 && !user.achievements.includes('streak_master')) {
      user.achievements.push('streak_master');
      user.points += ACHIEVEMENTS.STREAK_MASTER.points;
      newAchievements.push(ACHIEVEMENTS.STREAK_MASTER);
    }

    // Verificar HABIT_MASTER (un hábito completado 30 veces)
    for (const habit of habits) {
      const completions = habit.completions.filter(c => c.completed).length;
      if (completions >= 30 && !user.achievements.includes('habit_master')) {
        user.achievements.push('habit_master');
        user.points += ACHIEVEMENTS.HABIT_MASTER.points;
        newAchievements.push(ACHIEVEMENTS.HABIT_MASTER);
        break;
      }
    }

    // Verificar HABIT_EXPLORER (10 hábitos diferentes)
    if (habits.length >= 10 && !user.achievements.includes('habit_explorer')) {
      user.achievements.push('habit_explorer');
      user.points += ACHIEVEMENTS.HABIT_EXPLORER.points;
      newAchievements.push(ACHIEVEMENTS.HABIT_EXPLORER);
    }

    // Verificar CENTURY_CLUB (100 completados totales)
    if (user.totalHabitsCompleted >= 100 && !user.achievements.includes('century_club')) {
      user.achievements.push('century_club');
      user.points += ACHIEVEMENTS.CENTURY_CLUB.points;
      newAchievements.push(ACHIEVEMENTS.CENTURY_CLUB);
    }

    // Verificar PERFECT_DAY (todos los hábitos completados en un día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayHabits = habits.filter(habit => {
      const dayOfWeek = today.getDay();
      const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
      return habit.frequency.includes(dayMap[dayOfWeek]);
    });

    if (todayHabits.length > 0) {
      const allCompletedToday = todayHabits.every(habit => {
        return habit.completions.some(comp => {
          const compDate = new Date(comp.date);
          compDate.setHours(0, 0, 0, 0);
          return compDate.getTime() === today.getTime() && comp.completed;
        });
      });

      if (allCompletedToday && !user.achievements.includes('perfect_day')) {
        user.achievements.push('perfect_day');
        user.points += ACHIEVEMENTS.PERFECT_DAY.points;
        newAchievements.push(ACHIEVEMENTS.PERFECT_DAY);
      }
    }

    // Calcular nivel basado en puntos
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();

    return newAchievements;
  } catch (error) {
    console.error('Error verificando logros:', error);
    return [];
  }
};

// Obtener progreso hacia el siguiente nivel
const getLevelProgress = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const pointsForNextLevel = user.level * 100;
    const pointsInCurrentLevel = user.points % 100;
    const progress = (pointsInCurrentLevel / 100) * 100;

    res.json({
      currentLevel: user.level,
      currentPoints: user.points,
      pointsForNextLevel,
      pointsInCurrentLevel,
      progress,
      nextLevel: user.level + 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener progreso', error: error.message });
  }
};

module.exports = {
  getAchievements,
  checkAndUnlockAchievements,
  getLevelProgress,
  ACHIEVEMENTS
};