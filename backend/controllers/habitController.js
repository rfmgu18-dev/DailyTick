const Habit = require('../models/Habit');
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('./achievementController');

// Obtener todos los hábitos del usuario
const getHabits = async (req, res) => {
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
};

// Crear nuevo hábito
const createHabit = async (req, res) => {
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
};

// Marcar hábito como completado
const toggleHabitCompletion = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { habitId } = req.params;
    const { date } = req.body; // Fecha en formato ISO (YYYY-MM-DD)

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.session.userId
    });

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Buscar si ya existe un registro para esa fecha
    const existingCompletion = habit.completions.find(
      c => new Date(c.date).toDateString() === targetDate.toDateString()
    );

    if (existingCompletion) {
      // Toggle: si existe, cambiar estado
      const wasCompleted = existingCompletion.completed;
      existingCompletion.completed = !existingCompletion.completed;
      if (existingCompletion.completed) {
        existingCompletion.completedAt = new Date();
        // Incrementar contador del usuario
        await User.findByIdAndUpdate(req.session.userId, {
          $inc: { totalHabitsCompleted: 1 }
        });
      } else {
        existingCompletion.completedAt = null;
        // Decrementar contador del usuario
        await User.findByIdAndUpdate(req.session.userId, {
          $inc: { totalHabitsCompleted: -1 }
        });
      }
    } else {
      // Si no existe, crear nuevo registro
      habit.completions.push({
        date: targetDate,
        completed: true,
        completedAt: new Date()
      });
      // Incrementar contador del usuario
      await User.findByIdAndUpdate(req.session.userId, {
        $inc: { totalHabitsCompleted: 1 }
      });
    }

    await habit.save();

    // Verificar logros después de completar hábito
    const newAchievements = await checkAndUnlockAchievements(req.session.userId);

    res.json({ 
      message: 'Estado del hábito actualizado', 
      habit,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar hábito', error: error.message });
  }
};

// Actualizar hábito
const updateHabit = async (req, res) => {
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
};

// Eliminar hábito (soft delete)
const deleteHabit = async (req, res) => {
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
};

// Obtener hábitos de un día específico
const getHabitsByDate = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { date } = req.params; // Formato: YYYY-MM-DD
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const habits = await Habit.find({
      user: req.session.userId,
      active: true
    });

    // Filtrar por frecuencia y añadir estado de completado
    const dayOfWeek = targetDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
    const dayLetter = dayMap[dayOfWeek];

    const filteredHabits = habits.filter(habit => 
      habit.frequency.includes(dayLetter)
    ).map(habit => {
      const completion = habit.completions.find(
        c => new Date(c.date).toDateString() === targetDate.toDateString()
      );
      
      return {
        ...habit.toObject(),
        completedToday: completion ? completion.completed : false,
        completedAt: completion ? completion.completedAt : null
      };
    });

    res.json({ habits: filteredHabits, date: targetDate });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
  }
};

module.exports = {
  getHabits,
  createHabit,
  toggleHabitCompletion,
  updateHabit,
  deleteHabit,
  getHabitsByDate
};