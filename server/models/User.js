const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4,
  },
  graduationYear: {
    type: Number,
    required: [true, 'Graduation year is required'],
    min: 2020,
    max: 2035,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'club'],
    default: 'student',
  },
  clubs: [{
    type: String,
  }],
  interests: [{
    type: String,
  }],
  bio: {
    type: String,
    maxlength: 500,
  },
  profilePicture: {
    type: String,
  },
  github: {
    type: String,
    default: '',
    trim: true,
  },
  instagram: {
    type: String,
    default: '',
    trim: true,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPlaced: {
    type: Boolean,
    default: false,
  },
  placementDetails: {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    offerType: { type: String, enum: ['On-Campus', 'Off-Campus', 'Internship'], default: 'On-Campus' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
