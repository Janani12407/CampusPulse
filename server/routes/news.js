const express = require('express');
const { body, validationResult } = require('express-validator');
const NewsPost = require('../models/NewsPost');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin or club
const authorizeNewsCreator = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'club') {
    return res.status(403).json({ message: 'Unauthorized. Only admins and clubs can post news.' });
  }
  next();
};

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const news = await NewsPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'name department year profilePicture');

    const total = await NewsPost.countDocuments(query);

    // Compute exact comment count for each news post
    const CommentModel = require('../models/Comment');
    const newsIds = news.map(n => n._id);
    const commentCounts = await CommentModel.aggregate([
      { $match: { parentType: 'NewsPost', parentId: { $in: newsIds } } },
      { $group: { _id: '$parentId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const enrichedNews = news.map(n => {
      const obj = n.toObject();
      return {
        ...obj,
        commentsCount: countMap[n._id.toString()] || 0,
        likesCount: obj.likes?.length || 0,
      };
    });

    res.json({
      news: enrichedNews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/news/:id/like — toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await NewsPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'News post not found' });

    const userId = req.user._id.toString();
    const hasLiked = post.likes && post.likes.some(id => id.toString() === userId);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      if (!post.likes) post.likes = [];
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({
      likesCount: post.likes.length,
      liked: !hasLiked,
      likes: post.likes
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/news
router.post('/', auth, authorizeNewsCreator, [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  body('category').isIn(['Academic', 'Events', 'Admin', 'Clubs']).withMessage('Valid category required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const news = new NewsPost({
      ...req.body,
      authorId: req.user._id
    });
    await news.save();

    await news.populate('authorId', 'name department year profilePicture');
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const Comment = require('../models/Comment');

// GET /api/news/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ parentType: 'NewsPost', parentId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name profilePicture department year');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/news/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    if (!req.body.text || !req.body.text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const comment = new Comment({
      parentType: 'NewsPost',
      parentId: req.params.id,
      authorId: req.user._id,
      text: req.body.text
    });
    await comment.save();
    await comment.populate('authorId', 'name profilePicture department year');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
