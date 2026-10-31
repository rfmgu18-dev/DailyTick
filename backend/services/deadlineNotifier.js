const cron = require('node-cron');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { addNotification } = require('../controllers/notificationController');

// Configuración de umbrales de notificación (en minutos)
const NOTIFICATION_THRESHOLDS = [30, 15, 0]; // 30 min, 15 min, en deadline

// Tracking en memoria para evitar duplicados
// Formato: Map<habitId, { last30Min: timestamp, last15Min: timestamp, last0Min: timestamp }>
const notificationTracking = new Map();

// Mapa de días procesados para resetear tracking al nuevo día
let lastProcessedDate = null;

/**
 * Iniciar el scheduler de deadlines
 * Se ejecuta cada 15 minutos
 */
function startDeadlineScheduler() {
  // Ejecutar cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    console.log('🔔 Ejecutando verificación de deadlines...');
    await checkDeadlines();
  });

  console.log('✅ Scheduler de deadlines iniciado (cada 15 min)');
}

/**
 * Función principal que verifica todos los deadlines
 */
async function checkDeadlines() {
  try {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Resetear tracking si cambió el día
    if (lastProcessedDate !== todayKey) {
      console.log('📅 Nuevo día detectado, reseteando tracking de notificaciones');
      notificationTracking.clear();
      lastProcessedDate = todayKey;
    }

    // Obtener usuarios con notificaciones activas
    const users = await User.find({ notificationsEnabled: true });
    console.log(`👥 Verificando ${users.length} usuarios con notificaciones activas`);

    let totalNotificationsSent = 0;

    for (const user of users) {
      const notificationsSent = await checkUserDeadlines(user);
      totalNotificationsSent += notificationsSent;
    }

    console.log(`✅ Verificación completada. ${totalNotificationsSent} notificaciones enviadas.`);
  } catch (error) {
    console.error('❌ Error en checkDeadlines:', error);
  }
}

/**
 * Verificar deadlines de un usuario específico
 */
async function checkUserDeadlines(user) {
  try {
    const habits = await getHabitsWithDeadlines(user._id);
    console.log(`👤 Usuario ${user.name}: ${habits.length} hábitos con deadlines`);

    let notificationsSent = 0;

    for (const habit of habits) {
      console.log(`  📋 Hábito: ${habit.name}, Deadline: ${habit.schedule.deadline}, Frecuencia: ${habit.frequency.join(',')}`);

      // Verificar si el hábito está programado para hoy
      if (!isHabitScheduledForToday(habit)) {
        console.log(`    ❌ No programado para hoy`);
        continue;
      }

      // Verificar si ya está completado hoy
      if (isHabitCompletedToday(habit)) {
        console.log(`    ❌ Ya completado hoy`);
        continue;
      }

      // Calcular tiempo hasta el deadline
      const timeUntilDeadline = getTimeUntilDeadline(habit.schedule.deadline);
      console.log(`    ⏰ Tiempo restante: ${timeUntilDeadline} minutos`);

      // Si el deadline ya pasó, no enviar notificación
      if (timeUntilDeadline < 0) {
        console.log(`    ❌ Deadline ya pasó`);
        continue;
      }

      // Verificar umbrales y enviar notificaciones
      for (const threshold of NOTIFICATION_THRESHOLDS) {
        if (shouldSendNotification(habit._id, threshold, timeUntilDeadline)) {
          await sendDeadlineNotification(user._id, habit, threshold);
          markNotificationSent(habit._id, threshold);
          notificationsSent++;
          console.log(`    ✅ Notificación enviada: ${habit.name} (${threshold} min restantes)`);
        }
      }

      // Si faltan menos de 30 minutos y no se ha enviado notificación, enviar una de última oportunidad
      if (timeUntilDeadline <= 30 && timeUntilDeadline > 0 && notificationsSent === 0) {
        const lastSent = notificationTracking.get(habit._id.toString());
        if (!lastSent || !lastSent.lastSent) {
          await sendDeadlineNotification(user._id, habit, timeUntilDeadline);
          markNotificationSent(habit._id, 'last');
          notificationsSent++;
          console.log(`    ✅ Notificación de última oportunidad enviada: ${habit.name} (${timeUntilDeadline} min restantes)`);
        }
      }
    }

    return notificationsSent;
  } catch (error) {
    console.error(`❌ Error verificando deadlines del usuario ${user._id}:`, error);
    return 0;
  }
}

/**
 * Obtener hábitos activos con deadlines configurados de un usuario
 */
async function getHabitsWithDeadlines(userId) {
  try {
    const habits = await Habit.find({
      user: userId,
      active: true,
      'schedule.deadline': { $ne: null, $ne: '' }
    });

    return habits;
  } catch (error) {
    console.error('Error obteniendo hábitos con deadlines:', error);
    return [];
  }
}

/**
 * Verificar si el hábito está programado para el día actual
 */
function isHabitScheduledForToday(habit) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayMap = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
  const todayLetter = dayMap[dayOfWeek];

  return habit.frequency.includes(todayLetter);
}

/**
 * Verificar si el hábito ya fue completado hoy
 */
function isHabitCompletedToday(habit) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completion = habit.completions.find(comp => {
    const compDate = new Date(comp.date);
    compDate.setHours(0, 0, 0, 0);
    return compDate.getTime() === today.getTime() && comp.completed;
  });

  return !!completion;
}

/**
 * Calcular minutos restantes hasta el deadline
 * Retorna número negativo si el deadline ya pasó
 */
function getTimeUntilDeadline(deadline) {
  if (!deadline) return -1;

  const now = new Date();
  const [hours, minutes] = deadline.split(':').map(Number);

  const deadlineDate = new Date();
  deadlineDate.setHours(hours, minutes, 0, 0);

  // Si el deadline es menor que la hora actual, es mañana
  if (deadlineDate < now) {
    deadlineDate.setDate(deadlineDate.getDate() + 1);
  }

  const diffMs = deadlineDate - now;
  const diffMinutes = Math.floor(diffMs / 60000); // Convertir a minutos

  return diffMinutes;
}

/**
 * Verificar si se debe enviar una notificación según el umbral
 * Evita duplicados verificando si ya se envió en este periodo
 */
function shouldSendNotification(habitId, threshold, timeUntilDeadline) {
  // Enviar si el tiempo restante está dentro de una ventana de 2 minutos del umbral
  const windowSize = 2; // minutos
  const isWithinThreshold = Math.abs(timeUntilDeadline - threshold) <= windowSize;

  if (!isWithinThreshold) {
    return false;
  }

  // Verificar si ya se envió esta notificación hoy
  const tracking = notificationTracking.get(habitId.toString());
  if (!tracking) {
    return true; // No hay tracking, es la primera vez
  }

  const thresholdKey = threshold === 0 ? 'last0Min' : threshold === 15 ? 'last15Min' : 'last30Min';
  const lastSent = tracking[thresholdKey];

  if (!lastSent) {
    return true; // No se envió este umbral hoy
  }

  // Verificar si pasó suficiente tiempo (más de 1 hora) para permitir otra notificación
  const oneHourMs = 60 * 60 * 1000;
  const timeSinceLastSent = Date.now() - lastSent;

  return timeSinceLastSent > oneHourMs;
}

/**
 * Marcar que se envió una notificación para un umbral específico
 */
function markNotificationSent(habitId, threshold) {
  const habitIdStr = habitId.toString();
  const tracking = notificationTracking.get(habitIdStr) || {};

  if (threshold === 'last') {
    tracking.lastSent = Date.now();
  } else {
    const thresholdKey = threshold === 0 ? 'last0Min' : threshold === 15 ? 'last15Min' : 'last30Min';
    tracking[thresholdKey] = Date.now();
  }

  notificationTracking.set(habitIdStr, tracking);
}

/**
 * Enviar notificación de deadline al usuario
 */
async function sendDeadlineNotification(userId, habit, threshold) {
  try {
    let message = '';
    let type = 'info';

    if (threshold === 30) {
      message = `⏰ Faltan 30 minutos para que "${habit.name}" se complete. ¡Apúrate!`;
      type = 'warning';
    } else if (threshold === 15) {
      message = `⚠️ Faltan 15 minutos para que "${habit.name}" se complete. ¡Última oportunidad!`;
      type = 'warning';
    } else if (threshold === 0) {
      message = `❌ Deadline pasado: "${habit.name}" no completado`;
      type = 'error';
    } else {
      // Para última oportunidad con tiempo específico
      message = `⏰ Faltan ${threshold} minutos para que "${habit.name}" se complete. ¡Apúrate!`;
      type = 'warning';
    }

    await addNotification(userId, message, type);
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
}

/**
 * Función para testing manual - verificar deadlines ahora
 */
async function testDeadlineCheck() {
  console.log('🧪 Ejecutando test de verificación de deadlines...');
  await checkDeadlines();
}

module.exports = {
  startDeadlineScheduler,
  checkDeadlines,
  testDeadlineCheck
};
