const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification,
  sendImmediateNotification
} = require('../controllers/notificationController');

router.get('/', getNotifications);
router.post('/', sendImmediateNotification);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

module.exports = router;
