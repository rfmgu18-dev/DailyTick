const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/adminAuth');
const {
  getAllUsers,
  getUserById,
  resetUserPassword,
  updateUserEmail,
  deleteUserAccount,
  getUserStats,
  promoteToAdmin
} = require('../controllers/adminController');

// Aplicar middleware de admin a todas las rutas
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/password', resetUserPassword);
router.put('/users/:id/email', updateUserEmail);
router.delete('/users/:id', deleteUserAccount);
router.get('/users/:id/stats', getUserStats);

module.exports = router;
