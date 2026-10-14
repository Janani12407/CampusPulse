const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Generate a JWT token for a user
 */
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Build a regex to validate college email domain.
 * Domain is loaded from the COLLEGE_EMAIL_DOMAIN env var.
 * E.g., "college.edu" → /^[a-zA-Z0-9._%+-]+@college\.edu$/i
 */
function getEmailRegex() {
  const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
  // Escape dots in domain for regex
  const escapedDomain = domain.replace(/\./g, '\\.');
  return new RegExp(`^[a-zA-Z0-9._%+-]+@${escapedDomain}$`, 'i');
}

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').notEmpty().withMessage('Department is required'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
    body('graduationYear').isInt({ min: 2020, max: 2035 }).withMessage('A valid graduation year is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, password, department, year, graduationYear } = req.body;

      // Validate college email domain
      const emailRegex = getEmailRegex();
      if (!emailRegex.test(email)) {
        const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
        return res.status(400).json({
          message: `Email must be a valid ${domain} address`,
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }

      // Create user — password hashing is handled by the pre-save hook
      const user = new User({
        name,
        email,
        passwordHash: password,
        department,
        year: parseInt(year),
        graduationYear: parseInt(graduationYear),
      });
      await user.save();

      const token = generateToken(user._id);
      res.status(201).json({ token, user });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      res.json({ token, user });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// GET /api/auth/me — get current user from token
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
