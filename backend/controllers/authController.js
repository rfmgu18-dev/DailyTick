const User = require('../models/User');
const Habit = require('../models/Habit');
const jwt = require('jsonwebtoken');

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dailytick-jwt-secret', {
    expiresIn: '30d'
  });
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password });

    await Habit.create([
      {
        user: user._id,
        name: 'Beber 2L de agua',
        emoji: '💧',
        category: 'Salud',
        frequency: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        duration: { value: 1, unit: 'horas' },
        active: true,
        completions: []
      },
      {
        user: user._id,
        name: 'Meditar 10 minutos',
        emoji: '🧘',
        category: 'Bienestar',
        frequency: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        duration: { value: 10, unit: 'min' },
        active: true,
        completions: []
      }
    ]);

    req.session.userId = user._id;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    req.session.userId = user._id;

    res.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        totalHabitsCompleted: user.totalHabitsCompleted,
        achievements: user.achievements
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
}

async function getCurrentUser(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos' });
    }

    const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
}

async function changePassword(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
  }
}

async function updateSettings(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { theme, notificationsEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.session.userId,
      { 
        theme: theme || 'light',
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Configuración actualizada', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
  }
}

async function deleteAccount(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Contraseña requerida para eliminar cuenta' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    await Habit.deleteMany({ user: req.session.userId });
    await User.findByIdAndDelete(req.session.userId);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
    });

    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cuenta', error: error.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  updateSettings,
  deleteAccount
};
