const Project = require('../models/Project');
const Bid = require('../models/Bid');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { createNotification } = require('../services/notificationService');
const { findOrCreateConversation } = require('../services/conversationService');

exports.createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    client: req.user._id,
    status: req.body.status || 'draft',
  });
  res.status(201).json({ success: true, project });
});

exports.getProjects = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minBudget,
    maxBudget,
    skills,
    status = 'open',
    page = 1,
    limit = 12,
    sort = '-createdAt',
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (minBudget || maxBudget) {
    query.budget = {};
    if (minBudget) query.budget.$gte = parseFloat(minBudget);
    if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
  }
  if (skills) query.skillsRequired = { $in: skills.split(',').map((s) => s.trim()) };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('client', 'name avatar companyName ratings')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(query),
  ]);

  res.json({
    success: true,
    projects,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

exports.getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ client: req.user._id })
    .populate('hiredFreelancer', 'name avatar username')
    .sort('-createdAt');
  res.json({ success: true, projects });
});

// For students: projects where they are the hired freelancer
exports.getMyHiredProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ hiredFreelancer: req.user._id })
    .populate('client', 'name avatar companyName')
    .sort('-updatedAt');
  res.json({ success: true, projects });
});

exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('client', 'name avatar companyName ratings companyWebsite')
    .populate('hiredFreelancer', 'name avatar username ratings');
  if (!project) throw new ApiError(404, 'Project not found');
  res.json({ success: true, project });
});

exports.updateProject = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const allowed = [
    'title',
    'description',
    'budget',
    'category',
    'skillsRequired',
    'deadline',
    'status',
    'milestones',
    'projectType',
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) project[key] = req.body[key];
  });
  await project.save();
  res.json({ success: true, project });
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  if (project.status === 'in_progress') {
    throw new ApiError(400, 'Cannot delete project in progress');
  }
  await Bid.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

exports.uploadAttachments = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const files = req.files || [];
  const attachments = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file.buffer, 'projects');
    attachments.push({
      url: result.url,
      publicId: result.publicId,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }
  project.attachments.push(...attachments);
  await project.save();
  res.json({ success: true, attachments: project.attachments });
});

exports.publishProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  project.status = 'open';
  await project.save();
  res.json({ success: true, project });
});

exports.hireFreelancer = asyncHandler(async (req, res) => {
  const { bidId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const bid = await Bid.findById(bidId).populate('freelancer');
  if (!bid || bid.project.toString() !== project._id.toString()) {
    throw new ApiError(404, 'Bid not found');
  }

  bid.status = 'accepted';
  await bid.save();
  await Bid.updateMany(
    { project: project._id, _id: { $ne: bidId } },
    { status: 'rejected' }
  );

  project.hiredFreelancer = bid.freelancer._id;
  project.status = 'in_progress';
  project.escrow.totalAmount = project.budget;
  await project.save();

  const io = req.app.get('io');
  await findOrCreateConversation(req.user._id, bid.freelancer._id, project._id);
  await createNotification({
    userId: bid.freelancer._id,
    title: 'Project Awarded',
    message: `You were hired for "${project.title}"`,
    type: 'project',
    link: `/projects/${project._id}`,
    io,
  });

  res.json({ success: true, project, bid });
});
