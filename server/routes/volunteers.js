const express = require('express');
const { body, validationResult } = require('express-validator');
const VolunteerNeed = require('../models/VolunteerNeed');
const VolunteerApplication = require('../models/VolunteerApplication');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const volunteerService = require('../services/volunteerService');

const router = express.Router();

// GET /api/volunteers — list open volunteer needs
router.get('/', async (req, res) => {
  try {
    const needs = await VolunteerNeed.find({ status: 'Open' })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'name department')
      .populate('eventId', 'title dateTime');
    res.json(needs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/volunteers/all — list ALL volunteer needs (including Full)
router.get('/all', async (req, res) => {
  try {
    const needs = await VolunteerNeed.find()
      .sort({ createdAt: -1 })
      .populate('creatorId', 'name department')
      .populate('eventId', 'title dateTime');
    res.json(needs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/volunteers/creator/dashboard — MUST be above /:id
router.get('/creator/dashboard', auth, async (req, res) => {
  try {
    const needs = await VolunteerNeed.find({ creatorId: req.user._id })
      .sort({ createdAt: -1 });
    
    // Get all applications for these needs
    const applications = await VolunteerApplication.find({ volunteerNeedId: { $in: needs.map(n => n._id) } })
      .populate('userId', 'name department year profilePicture')
      .populate('volunteerNeedId', 'title description slotsTotal slotsFilled status');

    res.json({ needs, applications });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/volunteers/applications/:appId/approve
router.put('/applications/:appId/approve', auth, async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.appId).populate('volunteerNeedId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify ownership
    if (application.volunteerNeedId.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Use atomic service
    const result = await volunteerService.approveApplication(req.params.appId);

    await Notification.create({
      recipientId: application.userId,
      type: 'VolunteerApproved',
      message: `You've been approved for "${application.volunteerNeedId.title}"! 🎉`,
      link: '/volunteering',
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/volunteers/applications/:appId/reject
router.put('/applications/:appId/reject', auth, async (req, res) => {
  try {
    const application = await VolunteerApplication.findById(req.params.appId).populate('volunteerNeedId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify ownership
    if (application.volunteerNeedId.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = 'Rejected';
    await application.save();

    await Notification.create({
      recipientId: application.userId,
      type: 'VolunteerRejected',
      message: `Your application for "${application.volunteerNeedId.title}" wasn't accepted this time.`,
      link: '/volunteering',
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/volunteers/:id — AFTER named routes
router.get('/:id', async (req, res) => {
  try {
    const need = await VolunteerNeed.findById(req.params.id)
      .populate('creatorId', 'name department profilePicture')
      .populate('eventId', 'title dateTime location');
    if (!need) return res.status(404).json({ message: 'Volunteer need not found' });
    res.json(need);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/volunteers
router.post('/', auth, [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('slotsTotal').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const need = new VolunteerNeed({
      ...req.body,
      creatorId: req.user._id
    });
    await need.save();
    res.status(201).json(need);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/volunteers/:id/apply
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const existing = await VolunteerApplication.findOne({ volunteerNeedId: req.params.id, userId: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const need = await VolunteerNeed.findById(req.params.id);
    if (!need) return res.status(404).json({ message: 'Not found' });
    if (need.status === 'Full' || need.slotsFilled >= need.slotsTotal) {
      return res.status(400).json({ message: 'All slots filled' });
    }

    const app = new VolunteerApplication({
      volunteerNeedId: req.params.id,
      userId: req.user._id,
      status: 'Pending'
    });
    await app.save();
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
