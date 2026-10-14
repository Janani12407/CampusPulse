const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const EventUpdate = require('../models/EventUpdate');
const auth = require('../middleware/auth');
const rsvpService = require('../services/rsvpService');

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ dateTime: 1 })
      .populate('organizerId', 'name profilePicture');
    
    const enrichedEvents = await Promise.all(events.map(async (ev) => {
      const confirmedCount = await RSVP.countDocuments({ eventId: ev._id, status: 'Confirmed' });
      return { ...ev.toObject(), confirmedCount };
    }));

    res.json(enrichedEvents);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name profilePicture department year bio');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const confirmedCount = await RSVP.countDocuments({ eventId: event._id, status: 'Confirmed' });
    const waitlistedCount = await RSVP.countDocuments({ eventId: event._id, status: 'Waitlisted' });

    res.json({ ...event.toObject(), confirmedCount, waitlistedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events
router.post('/', auth, [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('category').notEmpty(),
  body('dateTime').isISO8601(),
  body('location').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const event = new Event({
      ...req.body,
      organizerId: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/events/:id — update event (organizer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can edit this event' });
    }

    const allowedFields = ['title', 'description', 'category', 'dateTime', 'location', 'capacity', 'ticketPrice', 'bannerImage'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/events/:id — delete event (organizer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can delete this event' });
    }

    // Clean up related records
    await Promise.all([
      RSVP.deleteMany({ eventId: event._id }),
      EventUpdate.deleteMany({ eventId: event._id }),
    ]);
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events/:id/my-rsvp — get current user's RSVP status for this event
router.get('/:id/my-rsvp', auth, async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({ eventId: req.params.id, userId: req.user._id });
    if (!rsvp) return res.json({ status: null });

    let waitlistPosition = null;
    if (rsvp.status === 'Waitlisted') {
      // Count how many waitlisted RSVPs were created before this one
      const ahead = await RSVP.countDocuments({
        eventId: req.params.id,
        status: 'Waitlisted',
        createdAt: { $lt: rsvp.createdAt }
      });
      waitlistPosition = ahead + 1;
    }
    res.json({ status: rsvp.status, waitlistPosition });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const rsvp = await rsvpService.createRSVP(req.params.id, req.user._id);
    res.status(201).json(rsvp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/events/:id/rsvp
router.delete('/:id/rsvp', auth, async (req, res) => {
  try {
    const result = await rsvpService.cancelRSVP(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/events/:id/updates
router.get('/:id/updates', async (req, res) => {
  try {
    const updates = await EventUpdate.find({ eventId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name profilePicture role');
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events/:id/updates
router.post('/:id/updates', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const rsvp = await RSVP.findOne({ eventId: req.params.id, userId: req.user._id, status: 'Confirmed' });
    
    if (event.organizerId.toString() !== req.user._id.toString() && !rsvp) {
      return res.status(403).json({ message: 'Only organizer and confirmed attendees can post updates' });
    }

    const update = new EventUpdate({
      eventId: req.params.id,
      authorId: req.user._id,
      text: req.body.text,
      imageUrl: req.body.imageUrl
    });
    await update.save();
    await update.populate('authorId', 'name profilePicture role');
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events/:id/attendees
router.get('/:id/attendees', async (req, res) => {
  try {
    const rsvps = await RSVP.find({ eventId: req.params.id, status: 'Confirmed' })
      .populate('userId', 'name profilePicture department year');
    res.json(rsvps.map(r => r.userId));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
