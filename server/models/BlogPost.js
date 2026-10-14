const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['General', 'PlacementExperience'],
    required: true,
  },
  tags: [{
    type: String,
  }],
  linkedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Placement Experience structured data
  placementDetails: {
    company: String,
    role: String,
    yearOfPlacement: Number,
    department: String,
    roundsFaced: [{
      roundName: String,
      description: String,
    }],
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    verdictTips: String,
    verifiedPlacement: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
