const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  toggleHabitCompletion,
  updateHabit,
  deleteHabit,
  getHabitsByDate
} = require('../controllers/habitController');

// GET /api/habits - Obtener todos los hábitos del usuario
router.get('/', getHabits);

// GET /api/habits/:date - Obtener hábitos de una fecha específica
router.get('/:date', getHabitsByDate);

// POST /api/habits - Crear nuevo hábito
router.post('/', createHabit);

// PUT /api/habits/:habitId/toggle - Marcar/desmarcar hábito como completado
router.put('/:habitId/toggle', toggleHabitCompletion);

// PUT /api/habits/:habitId - Actualizar hábito
router.put('/:habitId', updateHabit);

// DELETE /api/habits/:habitId - Eliminar hábito
router.delete('/:habitId', deleteHabit);

module.exports = router;