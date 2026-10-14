const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — the logged-in user's notifications, most recent first
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ recipientId: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/:id/read — mark a single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipientId: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/read-all — mark all of the logged-in user's notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
