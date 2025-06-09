const express = require('express');
const router = express.Router();

const User = require('../models/User');
const ContactMessage = require('../models/Contact');
const ServiceRequest = require('../models/ServiceRequest');

// GET /dashboard/stats
router.get('/stats', async (req, res) => {
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
