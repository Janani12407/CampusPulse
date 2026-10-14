const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  parentType: {
    type: String,
    enum: ['BlogPost', 'NewsPost', 'EventUpdate'],
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
