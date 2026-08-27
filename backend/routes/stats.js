const express = require('express');
const router = express.Router();
const { getUserStats, getMonthlyData } = require('../controllers/statsController');

// GET /api/stats - Obtener estadísticas completas del usuario
router.get('/', getUserStats);

// GET /api/stats/month/:year/:month - Obtener datos de un mes específico
router.get('/month/:year/:month', getMonthlyData);

module.exports = router;