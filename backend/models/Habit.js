const mongoose = require('mongoose');

// Esquema de hábito más simple
const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    default: '✓'
  },
  category: {
    type: String,
    default: 'Otro'
  },
  frequency: {
    type: [String],
    default: ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  },
  duration: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
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

// Índices para mejorar búsquedas
habitSchema.index({ user: 1, active: 1 });
habitSchema.index({ user: 1, 'completions.date': 1 });

module.exports = mongoose.model('Habit', habitSchema);
