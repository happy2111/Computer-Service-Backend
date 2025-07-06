const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Генерируем VAPID ключи один раз и сохраняем в .env файл

webpush.setVapidDetails(
  'mailto:support@applepark.uz', // Замените на ваш email
  process.env.VAPID_PUBLIC_KEY ,
  process.env.VAPID_PRIVATE_KEY
);

// Сохранение подписки
router.post('/subscribe', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user._id;

    await PushSubscription.findOneAndUpdate(
      { userId },
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Подписка успешно сохранена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function sendPushNotifications(payload) {
  const subscriptions = await PushSubscription.find();

  const notifications = subscriptions.map(subscription => {
    return webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      JSON.stringify(payload)
    ).catch(error => {
      if (error.statusCode === 410) {
        // Подписка больше недействительна, удаляем её
        return PushSubscription.findByIdAndDelete(subscription._id);
      }
      console.error('Ошибка отправки уведомления:', error);
    });
  });

  await Promise.all(notifications);
}

module.exports = {
  router,
  sendPushNotifications
};
