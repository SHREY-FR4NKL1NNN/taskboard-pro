const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const verifyFirebaseToken = require('../middleware/authMiddleware');

// Get notifications for logged-in user
router.get('/', verifyFirebaseToken, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.uid }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark as read
router.put('/:id/read', verifyFirebaseToken, async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(notification);
});

module.exports = router;