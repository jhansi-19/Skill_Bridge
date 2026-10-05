const Bid = require('../models/Bid');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

exports.createBid = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'open') throw new ApiError(400, 'Project is not accepting bids');
  if (project.client.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot bid on your own project');
  }

  const existing = await Bid.findOne({ project: project._id, freelancer: req.user._id });
  if (existing) throw new ApiError(400, 'You already submitted a bid');

  const bid = await Bid.create({
    project: project._id,
    freelancer: req.user._id,
    amount: req.body.amount,
    proposal: req.body.proposal,
    estimatedDelivery: req.body.estimatedDelivery,
  });

  const io = req.app.get('io');
  await createNotification({
    userId: project.client,
    title: 'New Bid Received',
    message: `${req.user.name} bid $${req.body.amount} on "${project.title}"`,
    type: 'bid',
    link: `/projects/${project._id}`,
    io,
  });

  res.status(201).json({ success: true, bid });
});

exports.getProjectBids = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isOwner = project.client.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized');

  const bids = await Bid.find({ project: project._id })
    .populate('freelancer', 'name avatar username ratings skills bio')
    .sort('-createdAt');
  res.json({ success: true, bids });
});

exports.getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ freelancer: req.user._id })
    .populate('project', 'title budget status client category')
    .populate({
      path: 'project',
      populate: { path: 'client', select: 'name avatar' },
    })
    .sort('-createdAt');
  res.json({ success: true, bids });
});

exports.updateBidStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const bid = await Bid.findById(req.params.id).populate('project freelancer');
  if (!bid) throw new ApiError(404, 'Bid not found');

  const project = bid.project;
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  bid.status = status;
  await bid.save();

  const io = req.app.get('io');
  await createNotification({
    userId: bid.freelancer._id,
    title: `Bid ${status}`,
    message: `Your bid on "${project.title}" was ${status}`,
    type: 'bid',
    link: `/projects/${project._id}`,
    io,
  });

  res.json({ success: true, bid });
});

exports.withdrawBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) throw new ApiError(404, 'Bid not found');
  if (bid.freelancer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  if (bid.status !== 'pending') throw new ApiError(400, 'Cannot withdraw this bid');

  bid.status = 'withdrawn';
  await bid.save();
  res.json({ success: true, bid });
});
