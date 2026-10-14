const mongoose = require('mongoose');

const volunteerNeedSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Optional, can be standalone
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: '',
  },
  dateTime: {
    type: Date,
  },
  location: {
    type: String,
    default: '',
  },
  slotsTotal: {
    type: Number,
    required: true,
    min: 1,
  },
  slotsFilled: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Open', 'Full'],
    default: 'Open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VolunteerNeed', volunteerNeedSchema);
