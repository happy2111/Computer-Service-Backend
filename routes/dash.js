const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const User = require('../models/User');
const ContactMessage = require('../models/Contact');

router.get('/stats', authMiddleware, authorizeRoles("admin", "master"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await ContactMessage.countDocuments();
    let users = await User.find().select('device');
    let totalDevices;
    if (req.user.role === 'master') {
      totalDevices = users.reduce((acc, user) => {
        return acc + user.device.filter(device => device.master && device.master.toString() === req.user._id.toString()).length;
      }, 0);
    } else {
      totalDevices = users.reduce((acc, user) => {
        return acc + (user.device ? user.device.length : 0);
      }, 0);
    }


    const rating = 4.9;
    res.json({
      totalUsers,
      totalMessages,
      totalDevices,
      rating,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

module.exports = router;
