const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser, updateProfile, changePassword, updateSettings, deleteAccount } = require('../controllers/authController');

// POST /api/auth/register - Registro
router.post('/register', register);

// POST /api/auth/login - Login
router.post('/login', login);

// POST /api/auth/logout - Logout
router.post('/logout', logout);

// GET /api/auth/me - Obtener usuario actual
router.get('/me', getCurrentUser);

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile', updateProfile);

// PUT /api/auth/password - Cambiar contraseña
router.put('/password', changePassword);

// PUT /api/auth/settings - Actualizar configuración
router.put('/settings', updateSettings);

// DELETE /api/auth/account - Eliminar cuenta
router.delete('/account', deleteAccount);

module.exports = router;