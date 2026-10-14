const express = require('express');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/connections/:userId/followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const followers = await Connection.find({ followingId: req.params.userId })
      .populate('followerId', 'name profilePicture department');
    res.json(followers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/connections/:userId/following
router.get('/:userId/following', async (req, res) => {
  try {
    const following = await Connection.find({ followerId: req.params.userId })
      .populate('followingId', 'name profilePicture department');
    res.json(following);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/connections/:userId/follow
router.post('/:userId/follow', auth, async (req, res) => {
  if (req.user._id.toString() === req.params.userId) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const existing = await Connection.findOne({ followerId: req.user._id, followingId: req.params.userId });
    if (existing) return res.status(400).json({ message: 'Already following' });

    const connection = new Connection({
      followerId: req.user._id,
      followingId: req.params.userId
    });
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/connections/:userId/unfollow
router.delete('/:userId/unfollow', auth, async (req, res) => {
  try {
    await Connection.findOneAndDelete({ followerId: req.user._id, followingId: req.params.userId });
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
