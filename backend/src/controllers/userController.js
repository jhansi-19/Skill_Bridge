const User = require('../models/User');
const Project = require('../models/Project');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

async function findUserByIdOrUsername(identifier) {
  if (OBJECT_ID_PATTERN.test(identifier)) {
    const byId = await User.findById(identifier);
    if (byId) return byId;
  }
  return User.findOne({ username: identifier });
}

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrUsername(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user: user.toPublicJSON() });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'name',
    'username',
    'bio',
    'skills',
    'education',
    'experience',
    'portfolio',
    'socialLinks',
    'companyName',
    'companyDescription',
    'companyWebsite',
  ];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (updates.username) {
    const exists = await User.findOne({
      username: updates.username,
      _id: { $ne: req.user._id },
    });
    if (exists) throw new ApiError(400, 'Username taken');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, user: user.toPublicJSON() });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer, 'avatars');
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: result.url }, { new: true });
  res.json({ success: true, avatar: user.avatar });
});

exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer, 'resumes');
  const user = await User.findByIdAndUpdate(req.user._id, { resume: result.url }, { new: true });
  res.json({ success: true, resume: user.resume });
});

exports.searchFreelancers = asyncHandler(async (req, res) => {
  const { skills, minRating, page = 1, limit = 12, search } = req.query;
  const query = { role: 'student', isBanned: false };

  if (skills) query.skills = { $in: skills.split(',').map((s) => s.trim()) };
  if (minRating) query['ratings.average'] = { $gte: parseFloat(minRating) };
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { username: new RegExp(search, 'i') },
      { bio: new RegExp(search, 'i') },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ 'ratings.average': -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role === 'student') {
    const Bid = require('../models/Bid');
    const [activeBids, completedProjects] = await Promise.all([
      Bid.countDocuments({ freelancer: userId, status: 'pending' }),
      Project.countDocuments({ hiredFreelancer: userId, status: 'in_progress' }),
    ]);
    return res.json({
      success: true,
      stats: {
        activeBids,
        activeProjects: completedProjects,
        earnings: req.user.earnings,
        completedProjects: req.user.completedProjects,
        rating: req.user.ratings,
      },
    });
  }

  if (role === 'client') {
    const Bid = require('../models/Bid');
    const projects = await Project.find({ client: userId });
    const projectIds = projects.map((p) => p._id);
    const pendingBids = await Bid.countDocuments({
      project: { $in: projectIds },
      status: 'pending',
    });
    return res.json({
      success: true,
      stats: {
        postedProjects: projects.length,
        openProjects: projects.filter((p) => p.status === 'open').length,
        pendingBids,
        hiredCount: projects.filter((p) => p.hiredFreelancer).length,
      },
    });
  }

  res.json({ success: true, stats: {} });
});

exports.getUserReviews = asyncHandler(async (req, res) => {
  const user = await findUserByIdOrUsername(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  const reviews = await Review.find({
    targetUser: user._id,
    isHidden: false,
  })
    .populate('reviewer', 'name avatar username')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});
