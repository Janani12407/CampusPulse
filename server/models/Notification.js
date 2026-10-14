const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['VolunteerApproved', 'VolunteerRejected', 'General'],
    default: 'General',
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // frontend route to navigate to when clicked, e.g. /volunteering
    default: '',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
