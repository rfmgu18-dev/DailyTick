const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  notifications: [{
    message: {
      type: String
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error']
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Historial de Actividad
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  firstLoginDate: {
    type: Date,
    default: Date.now
  },
  totalActiveDays: {
    type: Number,
    default: 0
  },
  currentInactiveDays: {
    type: Number,
    default: 0
  },
  // Estadísticas Avanzadas
  completionRate: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  mostCompletedHabit: {
    type: String,
    default: ''
  },
  favoriteCategory: {
    type: String,
    default: ''
  },
  totalHoursDedicated: {
    type: Number,
    default: 0
  },
  // Información de Usuario
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'es'
  },
  country: {
    type: String,
    default: ''
  },
  // Preferencias de Hábitos
  defaultHabitDuration: {
    type: Number,
    default: 30
  },
  preferredNotificationTime: {
    type: String,
    default: '09:00'
  },
  customCategories: [{
    type: String
  }],
  // Contadores de Hábitos
  totalHabitsCreated: {
    type: Number,
    default: 0
  },
  activeHabitsCount: {
    type: Number,
    default: 0
  },
  archivedHabitsCount: {
    type: Number,
    default: 0
  },
  // Gamificación Mejorada
  totalXP: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String
  }],
  currentLevelProgress: {
    type: Number,
    default: 0
  },
  customAchievements: [{
    type: String
  }]
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

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

  const todayCompleted = habits.some(habit => {
    return habit.completions.some(comp => {
      const compDate = new Date(comp.date);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === currentDate.getTime() && comp.completed;
    });
  });

  // Si hoy se completó algún hábito, contar como día 1 de la racha
  if (todayCompleted) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Si no se completó hoy, empezar a contar desde ayer
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Contar días anteriores
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
