const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalByHabit,
  updateGoal,
  deleteGoal,
  calculateGoalProgress,
  checkGoalCompletion,
  getAllGoalsStats
} = require('../controllers/goalController');

router.post('/', createGoal);
router.get('/', getGoals);
router.get('/stats/all', getAllGoalsStats);
router.get('/habit/:habitId', getGoalByHabit);
router.get('/:goalId/progress', calculateGoalProgress);
router.put('/:goalId/check', checkGoalCompletion);
router.put('/:goalId', updateGoal);
router.delete('/:goalId', deleteGoal);

module.exports = router;
