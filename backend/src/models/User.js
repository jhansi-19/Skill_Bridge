const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  liveUrl: String,
  githubUrl: String,
  figmaEmbedUrl: String,
  videoUrl: String,
  technologies: [String],
});

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, required: true },
  earnedAt: { type: Date, default: Date.now },
  badgeIcon: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startYear: Number,
  endYear: Number,
});

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['student', 'client', 'admin'],
      default: 'student',
    },
    skills: [{ type: String, trim: true }],
    badges: [badgeSchema],
    bio: { type: String, maxlength: 2000 },
    education: [educationSchema],
    experience: [experienceSchema],
    portfolio: [portfolioItemSchema],
    resume: { type: String },
    hourlyRate: { type: Number, default: 25 },
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String,
      website: String,
    },
    companyName: String,
    companyDescription: String,
    companyWebsite: String,
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    completedProjects: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: { type: String, select: false },
    isBanned: { type: Boolean, default: false },
    lastActive: Date,
  },
  { timestamps: true }
);

userSchema.index({ skills: 1 });
userSchema.index({ 'ratings.average': -1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.verificationToken;
  delete obj.verificationExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
