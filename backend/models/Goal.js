const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  
  // Tipo de condición: 'times' (veces) o 'hours' (horas)
  conditionType: {
    type: String,
    enum: ['times', 'hours'],
    required: true
  },
  
  // Condición por veces (frecuencia)
  timesCondition: {
    targetTimes: {
      type: Number,
      default: 1
    },
    period: {
      type: String,
      enum: ['day', 'week', 'month'],
      default: 'week'
    },
    currentCount: {
      type: Number,
      default: 0
    }
  },
  
  // Condición por horas (bloque de tiempo)
  hoursCondition: {
    startHour: {
      type: String
    },
    endHour: {
      type: String
    },
    totalHours: {
      type: Number,
      default: 0
    },
    currentHours: {
      type: Number,
      default: 0
    }
  },
  
  // Estado
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'paused'],
    default: 'active'
  },
  
  progress: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date,
    default: null
  }
});

// Índices para mejorar búsquedas
goalSchema.index({ user: 1, habit: 1 });
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ habit: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
