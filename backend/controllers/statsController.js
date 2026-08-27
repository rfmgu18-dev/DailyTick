const Habit = require('../models/Habit');
const User = require('../models/User');

// Obtener estadísticas completas del usuario
const getUserStats = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const habits = await Habit.find({ user: req.session.userId, active: true });

    // Calcular racha actual
    const currentStreak = await calculateCurrentStreak(req.session.userId, habits);

    // Calcular tasa de cumplimiento general
    const completionRate = await calculateCompletionRate(req.session.userId, habits);

    // Obtener datos de la semana actual
    const weeklyData = await getWeeklyData(req.session.userId, habits);

    // Encontrar hábito más consistente
    const mostConsistentHabit = await findMostConsistentHabit(habits);

    // Total de hábitos completados en el último mes
    const monthlyCompletions = await getMonthlyCompletions(req.session.userId, habits);

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
};

// Calcular racha actual (días consecutivos con al menos un hábito completado)
const calculateCurrentStreak = async (userId, habits) => {
  if (habits.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Verificar si hay algún hábito completado hoy
  const todayCompleted = habits.some(habit => {
    return habit.completions.some(comp => {
      const compDate = new Date(comp.date);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === currentDate.getTime() && comp.completed;
    });
  });

  if (!todayCompleted) {
    // Si no hay nada completado hoy, verificar ayer para empezar la racha
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Contar días consecutivos hacia atrás
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
};

// Calcular tasa de cumplimiento general (últimos 30 días)
const calculateCompletionRate = async (userId, habits) => {
  if (habits.length === 0) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  let totalPossible = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    habit.completions.forEach(completion => {
      const compDate = new Date(completion.date);
      if (compDate >= thirtyDaysAgo && completion.completed) {
        totalCompleted++;
      }
      if (compDate >= thirtyDaysAgo) {
        totalPossible++;
      }
    });
  });

  return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
};

// Obtener datos de la semana actual (completados por día)
const getWeeklyData = async (userId, habits) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 6 = Sábado
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
      const habitForDay = habit.frequency.includes(dayNames[i]);
      if (habitForDay) {
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
};

// Encontrar el hábito más consistente
const findMostConsistentHabit = async (habits) => {
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
};

// Obtener completados del último mes
const getMonthlyCompletions = async (userId, habits) => {
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
};

// Obtener datos para un mes específico (para calendario)
const getMonthlyData = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { year, month } = req.params; // month: 0-11
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const habits = await Habit.find({ user: req.session.userId, active: true });
    
    const monthlyData = {};
    
    // Inicializar todos los días del mes
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      monthlyData[dateKey] = {
        total: 0,
        completed: 0,
        rate: 0,
        habits: []
      };
    }
    
    // Llenar datos reales
    habits.forEach(habit => {
      habit.completions.forEach(completion => {
        const compDate = new Date(completion.date);
        if (compDate >= startDate && compDate <= endDate) {
          const dateKey = compDate.toISOString().split('T')[0];
          
          if (monthlyData[dateKey]) {
            monthlyData[dateKey].total++;
            if (completion.completed) {
              monthlyData[dateKey].completed++;
            }
            monthlyData[dateKey].rate = monthlyData[dateKey].total > 0 
              ? Math.round((monthlyData[dateKey].completed / monthlyData[dateKey].total) * 100) 
              : 0;
            
            monthlyData[dateKey].habits.push({
              name: habit.name,
              emoji: habit.emoji,
              completed: completion.completed
            });
          }
        }
      });
    });
    
    res.json({ monthlyData, startDate, endDate });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos mensuales', error: error.message });
  }
};

module.exports = {
  getUserStats,
  getMonthlyData
};