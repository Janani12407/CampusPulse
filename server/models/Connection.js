const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique pair
connectionSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
