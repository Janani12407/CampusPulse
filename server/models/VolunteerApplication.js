const mongoose = require('mongoose');

const volunteerApplicationSchema = new mongoose.Schema({
  volunteerNeedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VolunteerNeed',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce one application per user per need
volunteerApplicationSchema.index({ volunteerNeedId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerApplication', volunteerApplicationSchema);
