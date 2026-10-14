const express = require('express');
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const { type, company, role, department, year, page = 1, limit = 10 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (company) query['placementDetails.company'] = { $regex: company, $options: 'i' };
    if (role) query['placementDetails.role'] = { $regex: role, $options: 'i' };
    if (department) query['placementDetails.department'] = department;
    if (year) query['placementDetails.yearOfPlacement'] = parseInt(year);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'name department profilePicture');

    const total = await BlogPost.countDocuments(query);

    res.json({
      blogs,
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

// GET /api/blogs/:id
router.get('/:id', async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id)
      .populate('authorId', 'name department profilePicture year bio clubs')
      .populate('linkedEventId', 'title dateTime location');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/blogs
router.post('/', auth, [
  body('title').notEmpty(),
  body('body').notEmpty(),
  body('type').isIn(['General', 'PlacementExperience'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const blog = new BlogPost({
      ...req.body,
      authorId: req.user._id
    });
    
    // Only admins can set verifiedPlacement initially, or we set default false
    if (blog.type === 'PlacementExperience' && blog.placementDetails) {
      if (req.user.role !== 'admin') {
        blog.placementDetails.verifiedPlacement = false;
      }
    }

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/blogs/:id/verify (Admin only)
router.put('/:id/verify', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog || blog.type !== 'PlacementExperience') return res.status(404).json({ message: 'Not found or not a placement experience' });

    blog.placementDetails.verifiedPlacement = req.body.verified;
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/blogs/:id/upvote (toggle upvote for the logged-in user)
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = blog.upvotes.some((id) => id.toString() === userId);

    if (alreadyUpvoted) {
      blog.upvotes = blog.upvotes.filter((id) => id.toString() !== userId);
    } else {
      blog.upvotes.push(req.user._id);
    }

    await blog.save();
    res.json({ upvoteCount: blog.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/blogs/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ parentType: 'BlogPost', parentId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('authorId', 'name profilePicture department');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/blogs/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    if (!req.body.text) return res.status(400).json({ message: 'Text required' });
    const comment = new Comment({
      parentType: 'BlogPost',
      parentId: req.params.id,
      authorId: req.user._id,
      text: req.body.text
    });
    await comment.save();
    await comment.populate('authorId', 'name profilePicture department');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
