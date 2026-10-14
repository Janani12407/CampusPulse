const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars from project root
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/news', require('./routes/news'));
app.use('/api/events', require('./routes/events'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/placements', require('./routes/placements'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/stats - Real live Campus Pulse statistics
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Event = require('./models/Event');
    const VolunteerNeed = require('./models/VolunteerNeed');
    const BlogPost = require('./models/BlogPost');

    const [totalStudents, placedStudents, upcomingEvents, openVolunteers, blogCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ isPlaced: true }),
      Event.countDocuments({ dateTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      VolunteerNeed.countDocuments({ status: 'Open' }),
      BlogPost.countDocuments()
    ]);

    // Distinct clubs count from student clubs + club accounts
    const clubUsers = await User.countDocuments({ role: 'club' });
    const distinctUserClubs = await User.distinct('clubs');
    const validClubs = (distinctUserClubs || []).filter(c => c && typeof c === 'string' && c.trim() !== '');
    const totalClubs = Math.max(clubUsers, validClubs.length);

    res.json({
      totalStudents,
      placedStudents,
      upcomingEvents,
      openVolunteers,
      totalClubs,
      blogCount
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/trending - Aggregates trending tags
app.get('/api/trending', async (req, res) => {
  try {
    const BlogPost = require('./models/BlogPost');
    const NewsPost = require('./models/NewsPost');
    const Event = require('./models/Event');

    const [blogs, news, events] = await Promise.all([
      BlogPost.find({}, 'tags title category placementDetails'),
      NewsPost.find({}, 'tags title category'),
      Event.find({}, 'tags title category')
    ]);

    const tagCounts = {};

    const addTag = (tag) => {
      if (!tag || typeof tag !== 'string') return;
      const cleaned = tag.trim().replace(/^#/, '');
      if (!cleaned) return;
      tagCounts[cleaned] = (tagCounts[cleaned] || 0) + 1;
    };

    blogs.forEach(b => {
      if (Array.isArray(b.tags)) b.tags.forEach(addTag);
      if (b.placementDetails?.company) addTag(b.placementDetails.company);
    });

    news.forEach(n => {
      if (Array.isArray(n.tags)) n.tags.forEach(addTag);
      if (n.category) addTag(n.category);
    });

    events.forEach(e => {
      if (Array.isArray(e.tags)) e.tags.forEach(addTag);
      if (e.category) addTag(e.category);
    });

    const sortedTags = Object.keys(tagCounts)
      .filter(tag => tag && tag.trim() !== '')
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 5);

    res.json(sortedTags.map(t => `#${t}`));
  } catch (err) {
    console.error('Trending fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Campus Pulse server running on port ${PORT}`);
});