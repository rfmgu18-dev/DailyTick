const Goal = require('../models/Goal');
const Habit = require('../models/Habit');

async function createGoal(req, res) {
  try {
    console.log('=== CREACIÓN DE META ===');
    console.log('Body recibido:', req.body);
    console.log('Usuario sesión:', req.session.userId);

    if (!req.session.userId) {
      console.log('Error: No autenticado');
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId, title, description, conditionType, timesCondition, hoursCondition } = req.body;

    console.log('habitId:', habitId);
    console.log('title:', title);
    console.log('conditionType:', conditionType);

    if (!habitId || !title || !conditionType) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({ message: 'Hábito, título y tipo de condición son requeridos' });
    }

    // Verificar que el hábito pertenece al usuario
    console.log('Buscando hábito...');
    const habit = await Habit.findOne({ _id: habitId, user: req.session.userId });
    console.log('Hábito encontrado:', habit);

    if (!habit) {
      console.log('Error: Hábito no encontrado');
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    console.log('Creando meta...');
    const goal = await Goal.create({
      user: req.session.userId,
      habit: habitId,
      title,
      description: description || '',
      conditionType,
      timesCondition: timesCondition || { targetTimes: 1, period: 'week', currentCount: 0 },
      hoursCondition: hoursCondition || { startHour: null, endHour: null, totalHours: 0, currentHours: 0 },
      status: 'active',
      progress: 0
    });

    console.log('Meta creada exitosamente:', goal);
    res.status(201).json({ message: 'Meta creada exitosamente', goal });
  } catch (error) {
    console.error('Error al crear meta:', error);
    res.status(500).json({ message: 'Error al crear meta', error: error.message });
  }
}

async function getGoals(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const goals = await Goal.find({ user: req.session.userId })
      .populate('habit', 'name emoji category')
      .sort({ createdAt: -1 });

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener metas', error: error.message });
  }
}

async function getGoalByHabit(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId } = req.params;

    const goals = await Goal.find({ user: req.session.userId, habit: habitId })
      .populate('habit', 'name emoji category')
      .sort({ createdAt: -1 });

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener metas', error: error.message });
  }
}

async function updateGoal(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { goalId } = req.params;
    const { title, description, timesCondition, hoursCondition, status } = req.body;

    const goal = await Goal.findOne({ _id: goalId, user: req.session.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (timesCondition) goal.timesCondition = { ...goal.timesCondition, ...timesCondition };
    if (hoursCondition) goal.hoursCondition = { ...goal.hoursCondition, ...hoursCondition };
    if (status) goal.status = status;

    await goal.save();

    res.json({ message: 'Meta actualizada', goal });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar meta', error: error.message });
  }
}

async function deleteGoal(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { goalId } = req.params;

    const goal = await Goal.findOne({ _id: goalId, user: req.session.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    await Goal.findByIdAndDelete(goalId);

    res.json({ message: 'Meta eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar meta', error: error.message });
  }
}

async function calculateGoalProgress(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { goalId } = req.params;

    const goal = await Goal.findOne({ _id: goalId, user: req.session.userId })
      .populate('habit');

    if (!goal) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    const progress = await calculateProgress(goal);

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Error al calcular progreso', error: error.message });
  }
}

async function calculateProgress(goal) {
  const habit = await Habit.findById(goal.habit._id);
  let progress = 0;

  if (goal.conditionType === 'times') {
    // Calcular progreso basado en veces (frecuencia)
    const now = new Date();
    let startDate, endDate;

    // Calcular periodo basado en timesCondition.period
    const periodDays = getPeriodDays(goal.timesCondition.period);
    endDate = now;
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - periodDays);

    // Contar completiones en el periodo
    const completionsInPeriod = habit.completions.filter(comp => {
      const compDate = new Date(comp.date);
      return compDate >= startDate && compDate <= endDate && comp.completed;
    }).length;

    progress = Math.min((completionsInPeriod / goal.timesCondition.targetTimes) * 100, 100);
    
    // Actualizar currentCount
    goal.timesCondition.currentCount = completionsInPeriod;
    
  } else if (goal.conditionType === 'hours') {
    // Calcular progreso basado en horas
    if (goal.hoursCondition.totalHours > 0) {
      // Usar duration.value del hábito como horas actuales
      const currentHours = habit.duration.value || 0;
      progress = Math.min((currentHours / goal.hoursCondition.totalHours) * 100, 100);
      
      goal.hoursCondition.currentHours = currentHours;
    }
  }

  await goal.save();
  return Math.round(progress);
}

function getPeriodDays(period) {
  switch (period) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    default: return 7;
  }
}

async function checkGoalCompletion(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { goalId } = req.params;

    const goal = await Goal.findOne({ _id: goalId, user: req.session.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Meta no encontrada' });
    }

    const progress = await calculateProgress(goal);

    if (progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
      goal.progress = 100;
      await goal.save();
    } else {
      goal.progress = progress;
      await goal.save();
    }

    res.json({ goal, progress });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar completación', error: error.message });
  }
}

async function getAllGoalsStats(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const goals = await Goal.find({ user: req.session.userId })
      .populate('habit', 'name emoji category');

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      failed: goals.filter(g => g.status === 'failed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      successRate: 0,
      goalsByStatus: []
    };

    if (stats.total > 0) {
      stats.successRate = Math.round((stats.completed / stats.total) * 100);
    }

    // Detalle de metas por estado
    goals.forEach(goal => {
      stats.goalsByStatus.push({
        id: goal._id,
        title: goal.title,
        habitName: goal.habit.name,
        habitEmoji: goal.habit.emoji,
        status: goal.status,
        progress: goal.progress,
        conditionType: goal.conditionType
      });
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
}

module.exports = {
  createGoal,
  getGoals,
  getGoalByHabit,
  updateGoal,
  deleteGoal,
  calculateGoalProgress,
  checkGoalCompletion,
  getAllGoalsStats
};
