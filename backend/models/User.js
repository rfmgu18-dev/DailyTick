const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Para gamificación y logros
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
  // Sistema de puntos y niveles
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  // Logros personalizados del usuario
  customAchievements: [{
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: '🏆'
    },
    points: {
      type: Number,
      default: 10
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: {
      type: Date
    },
    targetValue: {
      type: Number,
      default: 1
    },
    currentValue: {
      type: Number,
      default: 0
    },
    metric: {
      type: String,
      enum: ['habits_completed', 'streak_days', 'total_points'],
      default: 'habits_completed'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Configuración de usuario
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
});

// Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para actualizar racha del usuario
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

  this.streak = streak;
  await this.save();
  return streak;
};

module.exports = mongoose.model('User', userSchema);