const express = require('express');
const router = express.Router();
const { getAchievements, getLevelProgress } = require('../controllers/achievementController');

// GET /api/achievements - Obtener todos los logros disponibles y del usuario
router.get('/', getAchievements);

// GET /api/achievements/level-progress - Obtener progreso hacia el siguiente nivel
router.get('/level-progress', getLevelProgress);

module.exports = router;