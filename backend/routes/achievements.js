const express = require('express');
const router = express.Router();
const { 
  getAchievements, 
  getLevelProgress,
  createCustomAchievement,
  getCustomAchievements,
  updateCustomAchievement,
  deleteCustomAchievement,
  unlockCustomAchievement
} = require('../controllers/achievementController');

// GET /api/achievements - Obtener todos los logros disponibles y del usuario
router.get('/', getAchievements);

// GET /api/achievements/level-progress - Obtener progreso hacia el siguiente nivel
router.get('/level-progress', getLevelProgress);

// POST /api/achievements/custom - Crear logro personalizado
router.post('/custom', createCustomAchievement);

// GET /api/achievements/custom - Obtener logros personalizados del usuario
router.get('/custom', getCustomAchievements);

// PUT /api/achievements/custom/:achievementId - Actualizar logro personalizado
router.put('/custom/:achievementId', updateCustomAchievement);

// DELETE /api/achievements/custom/:achievementId - Eliminar logro personalizado
router.delete('/custom/:achievementId', deleteCustomAchievement);

// POST /api/achievements/custom/:achievementId/unlock - Desbloquear logro personalizado manualmente
router.post('/custom/:achievementId/unlock', unlockCustomAchievement);

module.exports = router;