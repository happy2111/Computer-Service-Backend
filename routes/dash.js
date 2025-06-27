const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const User = require('../models/User');
const ContactMessage = require('../models/Contact');
const ServiceRequest = require('../models/ServiceRequest');
const Masters = require('../models/Masters');

// GET /dashboard/stats
router.get('/stats', authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await ContactMessage.countDocuments();
    const totalRequests = await ServiceRequest.countDocuments();
    const rating = 4.9; // Статичное значение

    res.json({
      totalUsers,
      totalMessages,
      totalRequests,
      rating
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

router.get("/masters", authMiddleware, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const masters = await Masters.find().sort({name: 1})
    res.json(masters);
  }
  catch (error) {
    next(error);
  }
})

router.post("/masters", authMiddleware, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ msg: "Barcha maydonlar to‘ldirilishi shart" });
    }
    const newMaster = new Masters({ name, phone });
    await newMaster.save();
    res.status(201).json(newMaster);
  } catch (error) {
    next(error);
  }
})

// Статистика по мастерам: сколько устройств привязано к каждому
router.get("/masters/stats", authMiddleware, authorizeRoles("admin"), async (req, res, next) => {
  try {
    // Получаем всех мастеров
    const masters = await Masters.find();
    // Агрегируем устройства по мастерам
    const users = await User.find({}, { device: 1 });
    // Считаем количество устройств для каждого мастера
    const masterStats = masters.map(master => {
      let count = 0;
      users.forEach(user => {
        if (Array.isArray(user.device)) {
          count += user.device.filter(d => d.master === master.name).length;
        }
      });
      return {
        master: master.name,
        phone: master.phone,
        deviceCount: count
      };
    });
    res.json(masterStats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
