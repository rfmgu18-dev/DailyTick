const User = require('../models/User');
const Habit = require('../models/Habit');
const bcrypt = require('bcryptjs');

async function getAllUsers(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
}

async function getUserById(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const habits = await Habit.find({ user: id, active: true });

    res.json({ user, habitsCount: habits.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
}

async function resetUserPassword(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña reseteada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al resetear contraseña', error: error.message });
  }
}

async function updateUserEmail(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: 'El nuevo email es requerido' });
    }

    const existingUser = await User.findOne({ email: newEmail, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { email: newEmail },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Email actualizado exitosamente', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar email', error: error.message });
  }
}

async function deleteUserAccount(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;

    // No permitir eliminar al propio admin
    if (id === req.session.userId) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await Habit.deleteMany({ user: id });
    await User.findByIdAndDelete(id);

    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cuenta', error: error.message });
  }
}

async function getUserStats(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const adminUser = await User.findById(req.session.userId);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
    }

    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const habits = await Habit.find({ user: id, active: true });

    res.json({
      user,
      stats: {
        totalHabits: habits.length,
        streak: user.streak,
        totalHabitsCompleted: user.totalHabitsCompleted,
        points: user.points,
        level: user.level,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
}

async function promoteToAdmin(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.role = 'admin';
    user.isAdmin = true;
    await user.save();

    res.json({ message: 'Usuario promovido a administrador', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al promover usuario', error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  resetUserPassword,
  updateUserEmail,
  deleteUserAccount,
  getUserStats,
  promoteToAdmin
};
