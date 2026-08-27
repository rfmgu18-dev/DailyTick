const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  emoji: {
    type: String,
    default: '✓'
  },
  category: {
    type: String,
    enum: ['Salud', 'Productividad', 'Aprendizaje', 'Bienestar', 'Otro'],
    default: 'Otro'
  },
  frequency: {
    type: [String], // ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    default: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  },
  duration: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      enum: ['min', 'seg', 'horas'],
      default: 'min'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Para rastrear completados por fecha
  completions: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }]
});

// Índice para búsquedas eficientes
habitSchema.index({ user: 1, active: 1 });
habitSchema.index({ user: 1, 'completions.date': 1 });

module.exports = mongoose.model('Habit', habitSchema);