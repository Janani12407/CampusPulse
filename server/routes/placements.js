const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/placements/stats
// Returns live placement stats for the current graduating class.
//
// Note on field mapping: this project's User model stores placement info as
// a nested `placementDetails.company` field (not a flat `company` field),
// so the aggregation below matches on `placementDetails.company`.
//
// currentGradYear can be overridden with ?year=2027 for testing a specific
// batch; otherwise it's auto-detected as the graduationYear with the most
// isPlaced=true students right now.
router.get('/stats', async (req, res) => {
  try {
    let currentGradYear = req.query.year ? parseInt(req.query.year) : null;

    if (!currentGradYear) {
      const classYearAgg = await User.aggregate([
        { $match: { isPlaced: true, graduationYear: { $exists: true, $ne: null } } },
        { $group: { _id: '$graduationYear', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      currentGradYear = classYearAgg.length > 0 ? classYearAgg[0]._id : new Date().getFullYear();
    }

    // Count total placed students for the current graduating class
    const placedCount = await User.countDocuments({
      graduationYear: currentGradYear,
      isPlaced: true
    });

    // Top recruiters for current graduating batch
    const topRecruiters = await User.aggregate([
      {
        $match: {
          graduationYear: currentGradYear,
          isPlaced: true,
          'placementDetails.company': { $exists: true, $ne: '' }
        }
      },
      { $group: { _id: '$placementDetails.company', hiredCount: { $sum: 1 } } },
      { $sort: { hiredCount: -1 } },
      { $limit: 3 }
    ]);

    // Count total placed students across all batches for global stats
    const totalPlacedAllBatches = await User.countDocuments({ isPlaced: true });

    res.json({
      currentGradYear,
      placedCount,
      totalPlacedAllBatches,
      topRecruiters: topRecruiters.map(r => ({ company: r._id, hiredCount: r.hiredCount }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;