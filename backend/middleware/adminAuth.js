const User = require('../models/User');

async function isAdmin(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error de autenticación', error: error.message });
  }
}

module.exports = isAdmin;
