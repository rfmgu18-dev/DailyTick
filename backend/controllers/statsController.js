const Habit = require('../models/Habit');
const User = require('../models/User');

async function getUserStats(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const habits = await Habit.find({ user: req.session.userId, active: true });

    const currentStreak = await calculateCurrentStreak(habits);
    const completionRate = await calculateCompletionRate(habits);
    const weeklyData = await getWeeklyData(habits);
    const mostConsistentHabit = findMostConsistentHabit(habits);
    const monthlyCompletions = getMonthlyCompletions(habits);

    res.json({
      currentStreak,
      completionRate,
      weeklyData,
      mostConsistentHabit,
      monthlyCompletions,
      totalHabits: habits.length,
      totalCompleted: user.totalHabitsCompleted,
      achievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
}

async function calculateCurrentStreak(habits) {
  if (habits.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  const todayCompleted = habits.some(habit => {
    return habit.completions.some(comp => {
      const compDate = new Date(comp.date);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === currentDate.getTime() && comp.completed;
    });
  });

  if (!todayCompleted) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateCompleted = habits.some(habit => {
      return habit.completions.some(comp => {
        const compDate = new Date(comp.date);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === currentDate.getTime() && comp.completed;
      });
    });

    if (dateCompleted) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

async function calculateCompletionRate(habits) {
  if (habits.length === 0) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

  let totalScheduled = 0;
  let totalCompleted = 0;

  // Calcular para cada día de los últimos 30 días
  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    currentDate.setHours(0, 0, 0, 0);

    const dayOfWeek = currentDate.getDay();
    const dayLetter = dayMap[dayOfWeek];

    // Hábitos programados para este día
    const scheduledHabits = habits.filter(habit => habit.frequency.includes(dayLetter));
    totalScheduled += scheduledHabits.length;

    // Hábitos completados este día
    scheduledHabits.forEach(habit => {
      const completion = habit.completions.find(comp => {
        const compDate = new Date(comp.date);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === currentDate.getTime() && comp.completed;
      });

      if (completion) {
        totalCompleted++;
      }
    });
  }

  return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
}

async function getWeeklyData(habits) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyData = [];
  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    
    let dayCompleted = 0;
    let dayTotal = 0;

    habits.forEach(habit => {
      if (habit.frequency.includes(dayNames[i])) {
        dayTotal++;
        const completed = habit.completions.some(comp => {
          const compDate = new Date(comp.date);
          compDate.setHours(0, 0, 0, 0);
          return compDate.getTime() === currentDate.getTime() && comp.completed;
        });
        if (completed) dayCompleted++;
      }
    });

    weeklyData.push({
      day: dayNames[i],
      completed: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0,
      total: dayTotal
    });
  }

  return weeklyData;
}

function findMostConsistentHabit(habits) {
  if (habits.length === 0) return null;

  let mostConsistent = null;
  let highestRate = 0;

  habits.forEach(habit => {
    if (habit.completions.length > 0) {
      const completed = habit.completions.filter(c => c.completed).length;
      const rate = (completed / habit.completions.length) * 100;
      
      if (rate > highestRate) {
        highestRate = rate;
        mostConsistent = {
          name: habit.name,
          emoji: habit.emoji,
          rate: Math.round(rate),
          totalCompletions: completed
        };
      }
    }
  });

  return mostConsistent;
}

function getMonthlyCompletions(habits) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  oneMonthAgo.setHours(0, 0, 0, 0);

  let monthlyTotal = 0;

  habits.forEach(habit => {
    habit.completions.forEach(completion => {
      const compDate = new Date(completion.date);
      if (compDate >= oneMonthAgo && completion.completed) {
        monthlyTotal++;
      }
    });
  });

  return monthlyTotal;
}

async function getMonthlyData(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { year, month } = req.params;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const habits = await Habit.find({ user: req.session.userId, active: true });

    const monthlyData = {};

    // Mapeo de días de la semana (0 = Domingo, 1 = Lunes, etc.)
    const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };

    // Inicializar datos para cada día del mes
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const dayLetter = dayMap[dayOfWeek];

      // Calcular hábitos programados para este día según su frequency
      const scheduledHabits = habits.filter(habit => habit.frequency.includes(dayLetter));

      monthlyData[dateKey] = {
        total: scheduledHabits.length,
        completed: 0,
        rate: 0,
        habits: []
      };

      // Buscar completions para este día
      scheduledHabits.forEach(habit => {
        const completion = habit.completions.find(comp => {
          const compDate = new Date(comp.date);
          compDate.setHours(0, 0, 0, 0);
          const targetDate = new Date(year, month, day);
          targetDate.setHours(0, 0, 0, 0);
          return compDate.getTime() === targetDate.getTime();
        });

        const isCompleted = completion ? completion.completed : false;

        if (isCompleted) {
          monthlyData[dateKey].completed++;
        }

        monthlyData[dateKey].habits.push({
          name: habit.name,
          emoji: habit.emoji,
          completed: isCompleted
        });
      });

      // Calcular tasa de completión
      monthlyData[dateKey].rate = monthlyData[dateKey].total > 0
        ? Math.round((monthlyData[dateKey].completed / monthlyData[dateKey].total) * 100)
        : 0;
    }

    res.json({ monthlyData, startDate, endDate });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos mensuales', error: error.message });
  }
}

module.exports = {
  getUserStats,
  getMonthlyData
};
