const Habit = require('../models/Habit');
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('./achievementController');

async function getHabits(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const habits = await Habit.find({ 
      user: req.session.userId, 
      active: true 
    }).sort({ createdAt: -1 });

    res.json({ habits });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
  }
}

async function createHabit(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { name, emoji, category, frequency, duration } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre del hábito es requerido' });
    }

    const habit = await Habit.create({
      user: req.session.userId,
      name,
      emoji: emoji || '✓',
      category: category || 'Otro',
      frequency: frequency || ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      duration: duration || { value: 1, unit: 'min' }
    });

    res.status(201).json({ message: 'Hábito creado exitosamente', habit });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear hábito', error: error.message });
  }
}

async function toggleHabitCompletion(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId } = req.params;
    const { date } = req.body;

    // Obtener la fecha actual del servidor (local)
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Validar que solo se pueda modificar hábitos del día actual
    if (date !== todayKey) {
      return res.status(403).json({ message: 'Solo puedes modificar hábitos del día actual' });
    }

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.session.userId
    });

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    // Parsear la fecha usando hora local (no UTC)
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const existingCompletion = habit.completions.find(
      c => {
        const compDate = new Date(c.date);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === targetDate.getTime();
      }
    );

    if (existingCompletion) {
      const wasCompleted = existingCompletion.completed;
      existingCompletion.completed = !existingCompletion.completed;
      if (!wasCompleted && existingCompletion.completed) {
        existingCompletion.completedAt = new Date();
        await User.findByIdAndUpdate(req.session.userId, {
          $inc: { totalHabitsCompleted: 1, points: 1 }
        });
      } else if (wasCompleted && !existingCompletion.completed) {
        existingCompletion.completedAt = null;
        await User.findByIdAndUpdate(req.session.userId, {
          $inc: { totalHabitsCompleted: -1, points: -1 }
        });
      }
    } else {
      habit.completions.push({
        date: targetDate,
        completed: true,
        completedAt: new Date()
      });
      await User.findByIdAndUpdate(req.session.userId, {
        $inc: { totalHabitsCompleted: 1, points: 1 }
      });
    }

    await habit.save();

    const newAchievements = await checkAndUnlockAchievements(req.session.userId);

    res.json({
      message: 'Estado del hábito actualizado',
      habit,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar hábito', error: error.message });
  }
}

async function updateHabit(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId } = req.params;
    const { name, emoji, category, frequency, duration } = req.body;

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.session.userId
    });

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    if (name) habit.name = name;
    if (emoji) habit.emoji = emoji;
    if (category) habit.category = category;
    if (frequency) habit.frequency = frequency;
    if (duration) habit.duration = duration;

    await habit.save();

    res.json({ message: 'Hábito actualizado', habit });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar hábito', error: error.message });
  }
}

async function deleteHabit(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId } = req.params;

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.session.userId
    });

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    habit.active = false;
    await habit.save();

    res.json({ message: 'Hábito eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar hábito', error: error.message });
  }
}

async function getHabitsByDate(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { date } = req.params;

    // Parsear la fecha usando hora local (no UTC)
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const habits = await Habit.find({
      user: req.session.userId,
      active: true
    });

    // Devolver TODOS los hábitos sin filtrar por frecuencia
    const habitsWithStatus = habits.map(habit => {
      const completion = habit.completions.find(
        c => {
          const compDate = new Date(c.date);
          compDate.setHours(0, 0, 0, 0);
          return compDate.getTime() === targetDate.getTime();
        }
      );

      return {
        ...habit.toObject(),
        completedToday: completion ? completion.completed : false,
        completedAt: completion ? completion.completedAt : null
      };
    });

    res.json({ habits: habitsWithStatus, date: targetDate });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
  }
}

async function createDefaultHabits(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const existingHabits = await Habit.find({ user: req.session.userId });

    if (existingHabits.length > 0) {
      return res.status(400).json({ message: 'El usuario ya tiene hábitos' });
    }

    await Habit.create([
      {
        user: user._id,
        name: 'Beber 2L de agua',
        emoji: '💧',
        category: 'Salud',
        frequency: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        duration: { value: 1, unit: 'horas' },
        active: true,
        completions: []
      },
      {
        user: user._id,
        name: 'Meditar 10 minutos',
        emoji: '🧘',
        category: 'Bienestar',
        frequency: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        duration: { value: 10, unit: 'min' },
        active: true,
        completions: []
      }
    ]);

    res.status(201).json({ message: 'Hábitos por defecto creados exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear hábitos por defecto', error: error.message });
  }
}

module.exports = {
  getHabits,
  createHabit,
  toggleHabitCompletion,
  updateHabit,
  deleteHabit,
  getHabitsByDate,
  createDefaultHabits
};
