const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalClients,
    totalProjects,
    openProjects,
    totalBids,
    totalPayments,
    revenue,
    pendingReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'client' }),
    Project.countDocuments(),
    Project.countDocuments({ status: 'open' }),
    Bid.countDocuments(),
    Payment.countDocuments({ status: 'mock_completed' }),
    Payment.aggregate([
      { $match: { status: 'mock_completed', type: 'fund' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Report.countDocuments({ status: 'pending' }),
  ]);

  const recentUsers = await User.find()
    .select('name email role createdAt avatar')
    .sort('-createdAt')
    .limit(10);

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalStudents,
      totalClients,
      totalProjects,
      openProjects,
      totalBids,
      totalPayments,
      escrowVolume: revenue[0]?.total || 0,
      pendingReports,
    },
    recentUsers,
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).select('-password -refreshToken').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

exports.banUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBanned: req.body.isBanned },
    { new: true }
  ).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user });
});

exports.getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('project', 'title')
    .sort('-createdAt');
  res.json({ success: true, reports });
});

exports.updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!report) throw new ApiError(404, 'Report not found');
  res.json({ success: true, report });
});

exports.createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: req.body.reportedUser,
    project: req.body.project,
    reason: req.body.reason,
    description: req.body.description,
  });
  res.status(201).json({ success: true, report });
});

exports.getReviewsForModeration = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('reviewer', 'name')
    .populate('targetUser', 'name')
    .populate('project', 'title')
    .sort('-createdAt')
    .limit(50);
  res.json({ success: true, reviews });
});
