const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema de usuario más simple
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Información de gamificación
  streak: {
    type: Number,
    default: 0
  },
  totalHabitsCompleted: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String
  }],
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  theme: {
    type: String,
    default: 'dark'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para calcular racha
userSchema.methods.updateStreak = async function() {
  const Habit = require('./Habit');
  const habits = await Habit.find({ user: this._id, active: true });
  
  if (habits.length === 0) {
    this.streak = 0;
    await this.save();
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Verificar si hay hábitos completados hoy
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

  // Contar días consecutivos
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

  this.streak = streak;
  await this.save();
  return streak;
};

module.exports = mongoose.model('User', userSchema);
