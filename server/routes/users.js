const express = require('express');
const User = require('../models/User');
const RSVP = require('../models/RSVP');
const VolunteerApplication = require('../models/VolunteerApplication');
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id/activity
router.get('/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Fetch user details
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch RSVP'd events
    const rsvps = await RSVP.find({ userId }).populate('eventId', 'title dateTime category').sort({ createdAt: -1 });
    
    // Fetch Volunteering
    const volunteering = await VolunteerApplication.find({ userId })
      .populate('volunteerNeedId', 'title description')
      .sort({ createdAt: -1 });

    // Fetch Blog Posts
    const blogs = await BlogPost.find({ authorId: userId })
      .sort({ createdAt: -1 });

    const Connection = require('../models/Connection');
    const [followersCount, followingCount] = await Promise.all([
      Connection.countDocuments({ followingId: userId }),
      Connection.countDocuments({ followerId: userId })
    ]);

    res.json({
      user,
      followersCount,
      followingCount,
      activity: {
        rsvps,
        volunteering,
        blogs
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/me/profile — gets full profile including activity
router.get('/me/profile', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-passwordHash');
    
    // Fetch RSVP'd events
    const rsvps = await RSVP.find({ userId }).populate('eventId', 'title dateTime category').sort({ createdAt: -1 });
    
    // Fetch Volunteering
    const volunteering = await VolunteerApplication.find({ userId })
      .populate('volunteerNeedId', 'title description')
      .sort({ createdAt: -1 });

    // Fetch Blog Posts
    const blogs = await BlogPost.find({ authorId: userId })
      .sort({ createdAt: -1 });

    const Connection = require('../models/Connection');
    const [followersCount, followingCount] = await Promise.all([
      Connection.countDocuments({ followingId: userId }),
      Connection.countDocuments({ followerId: userId })
    ]);

    res.json({
      user,
      followersCount,
      followingCount,
      activity: {
        rsvps,
        volunteering,
        blogs
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/search — search users by name
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      name: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id } // exclude self
    }).select('name department year profilePicture').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me/profile — update own profile
router.put('/me/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['bio', 'department', 'year', 'clubs', 'interests', 'github', 'instagram', 'isPlaced', 'placementDetails', 'profilePicture', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'clubs') {
          if (typeof req.body.clubs === 'string') {
            updates.clubs = req.body.clubs.split(',').map(c => c.trim()).filter(Boolean);
          } else if (Array.isArray(req.body.clubs)) {
            updates.clubs = req.body.clubs.map(c => typeof c === 'string' ? c.trim() : c).filter(Boolean);
          }
        } else if (field === 'avatar') {
          updates.profilePicture = req.body.avatar;
          updates.avatar = req.body.avatar;
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/:id/follow — toggle follow/unfollow
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentId = req.user._id;
    if (targetId === currentId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const Connection = require('../models/Connection');
    const existing = await Connection.findOne({ followerId: currentId, followingId: targetId });

    if (existing) {
      await Connection.findOneAndDelete({ followerId: currentId, followingId: targetId });
      await User.findByIdAndUpdate(currentId, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: currentId } });
      return res.json({ isFollowing: false, message: 'Unfollowed' });
    } else {
      await Connection.create({ followerId: currentId, followingId: targetId });
      await User.findByIdAndUpdate(currentId, { $addToSet: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentId } });
      return res.json({ isFollowing: true, message: 'Followed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

