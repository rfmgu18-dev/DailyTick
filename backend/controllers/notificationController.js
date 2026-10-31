const User = require('../models/User');
const Habit = require('../models/Habit');

async function getNotifications(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Convertir a objetos planos con _id incluido
    const notificationsWithId = notifications.map(n => ({
      _id: n._id.toString(),
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt
    }));

    res.json({ notifications: notificationsWithId, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { notificationId } = req.params;

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const notification = user.notifications.id(notificationId);
    if (notification) {
      notification.read = true;
      await user.save();
    }

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar notificación', error: error.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.notifications.forEach(n => n.read = true);
    await user.save();

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar notificaciones', error: error.message });
  }
}

async function deleteNotification(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { notificationId } = req.params;
    console.log('🗑️ Intentando eliminar notificación:', notificationId);

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Usar pull() para eliminar el subdocumento del array
    const result = await User.findByIdAndUpdate(
      req.session.userId,
      { $pull: { notifications: { _id: notificationId } } }
    );

    if (result) {
      console.log('✅ Notificación eliminada');
      res.json({ message: 'Notificación eliminada' });
    } else {
      console.log('❌ Notificación no encontrada con ID:', notificationId);
      res.status(404).json({ message: 'Notificación no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
  }
}

async function addNotification(userId, message, type = 'info') {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.notifications.push({
        message,
        type,
        read: false,
        createdAt: new Date()
      });
      await user.save();
    }
  } catch (error) {
    console.error('Error al agregar notificación:', error);
  }
}

async function sendImmediateNotification(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { message, type } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'El mensaje es requerido' });
    }

    await addNotification(req.session.userId, message, type || 'info');

    res.json({ message: 'Notificación enviada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar notificación', error: error.message });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  sendImmediateNotification
};
