const Review = require('../models/Review');
const User = require('../models/User');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

const updateUserRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { targetUser: userId, isHidden: false } },
    {
      $group: {
        _id: '$targetUser',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = stats[0]?.average || 0;
  const count = stats[0]?.count || 0;
  await User.findByIdAndUpdate(userId, {
    ratings: { average: Math.round(average * 10) / 10, count },
  });
};

exports.createReview = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.status !== 'completed') {
    throw new ApiError(400, 'Can only review completed projects');
  }

  let targetUser;
  if (req.body.type === 'freelancer') {
    if (project.client.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only client can review freelancer');
    }
    targetUser = project.hiredFreelancer;
  } else {
    if (project.hiredFreelancer?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only freelancer can review client');
    }
    targetUser = project.client;
  }

  const review = await Review.create({
    reviewer: req.user._id,
    targetUser,
    project: project._id,
    rating: req.body.rating,
    comment: req.body.comment,
    type: req.body.type,
  });

  await updateUserRating(targetUser);

  const io = req.app.get('io');
  await createNotification({
    userId: targetUser,
    title: 'New Review',
    message: `You received a ${req.body.rating}-star review`,
    type: 'review',
    link: `/freelancers/${targetUser}`,
    io,
  });

  res.status(201).json({ success: true, review });
});

exports.moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isHidden: req.body.isHidden, isModerated: true },
    { new: true }
  );
  if (!review) throw new ApiError(404, 'Review not found');
  await updateUserRating(review.targetUser);
  res.json({ success: true, review });
});
