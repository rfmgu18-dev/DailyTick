const User = require('../models/User');
const Habit = require('../models/Habit');

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

async function getAchievements(req, res) {
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
}

async function checkAndUnlockAchievements(userId) {
  try {
    const user = await User.findById(userId);
    const habits = await Habit.find({ user: userId, active: true });

    if (!user || !habits) return;

    const newAchievements = [];

    function unlockAchievement(achievementKey) {
      const achievement = ACHIEVEMENTS[achievementKey];
      if (!user.achievements.includes(achievement.id)) {
        user.achievements.push(achievement.id);
        user.points += achievement.points;
        newAchievements.push(achievement);
      }
    }

    if (habits.length >= 1) unlockAchievement('FIRST_HABIT');
    if (user.streak >= 7) unlockAchievement('FIRST_WEEK');
    if (user.streak >= 30) unlockAchievement('STREAK_MASTER');
    if (habits.length >= 10) unlockAchievement('HABIT_EXPLORER');
    if (user.totalHabitsCompleted >= 100) unlockAchievement('CENTURY_CLUB');

    if (!user.achievements.includes('habit_master')) {
      for (const habit of habits) {
        const completions = habit.completions.filter(c => c.completed).length;
        if (completions >= 30) {
          unlockAchievement('HABIT_MASTER');
          break;
        }
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
    const todayHabits = habits.filter(habit => 
      habit.frequency.includes(dayMap[today.getDay()])
    );

    if (todayHabits.length > 0) {
      const allCompletedToday = todayHabits.every(habit => {
        return habit.completions.some(comp => {
          const compDate = new Date(comp.date);
          compDate.setHours(0, 0, 0, 0);
          return compDate.getTime() === today.getTime() && comp.completed;
        });
      });

      if (allCompletedToday) unlockAchievement('PERFECT_DAY');
    }

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
}

async function getLevelProgress(req, res) {
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
}

module.exports = {
  getAchievements,
  checkAndUnlockAchievements,
  getLevelProgress,
  ACHIEVEMENTS
};
