const Dispute = require('../models/Dispute');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../services/paymentService');
const { createNotification } = require('../services/notificationService');

exports.createDispute = asyncHandler(async (req, res) => {
  const { projectId, milestoneId, reason, description, evidence } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const clientId = project.client.toString();
  const freelancerId = project.hiredFreelancer ? project.hiredFreelancer.toString() : null;
  const userId = req.user._id.toString();

  if (userId !== clientId && userId !== freelancerId && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to raise dispute on this project');
  }

  // Calculate disputed amount based on project funded escrow
  const amountInDispute = project.escrow.fundedAmount - project.escrow.releasedAmount;
  if (amountInDispute <= 0) {
    throw new ApiError(400, 'No funded escrow funds available to dispute');
  }

  const dispute = await Dispute.create({
    project: projectId,
    milestoneId: milestoneId || null,
    raisedBy: req.user._id,
    client: project.client,
    freelancer: project.hiredFreelancer,
    reason,
    description,
    amountInDispute,
    evidence: evidence || [],
    status: 'open',
  });

  const io = req.app.get('io');
  const otherPartyId = userId === clientId ? freelancerId : clientId;

  if (otherPartyId) {
    await createNotification({
      userId: otherPartyId,
      title: '⚠️ Dispute Raised on Project',
      message: `${req.user.name} opened a dispute for "${project.title}". SkillBridge mediation team is reviewing.`,
      type: 'dispute',
      link: `/projects/${project._id}`,
      io,
    });
  }

  res.status(201).json({ success: true, dispute });
});

exports.getDisputes = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role !== 'admin') {
    filter = {
      $or: [{ client: req.user._id }, { freelancer: req.user._id }, { raisedBy: req.user._id }],
    };
  }

  const disputes = await Dispute.find(filter)
    .populate('project', 'title budget status escrow')
    .populate('client', 'name email avatar')
    .populate('freelancer', 'name email avatar')
    .populate('raisedBy', 'name role')
    .sort('-createdAt');

  res.json({ success: true, count: disputes.length, disputes });
});

exports.getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('project')
    .populate('client', 'name email avatar')
    .populate('freelancer', 'name email avatar')
    .populate('raisedBy', 'name role');

  if (!dispute) throw new ApiError(404, 'Dispute not found');

  res.json({ success: true, dispute });
});

exports.resolveDispute = asyncHandler(async (req, res) => {
  const { decision, adminDecisionNotes } = req.body; // 'refund_client' or 'release_freelancer'
  const dispute = await Dispute.findById(req.params.id).populate('project');

  if (!dispute) throw new ApiError(404, 'Dispute not found');
  if (dispute.status.startsWith('resolved')) {
    throw new ApiError(400, 'Dispute has already been resolved');
  }

  const project = dispute.project;
  const io = req.app.get('io');

  if (decision === 'refund_client') {
    // 1. Create refund payment
    await Payment.create({
      project: project._id,
      client: dispute.client,
      amount: dispute.amountInDispute,
      type: 'refund',
      status: 'mock_completed',
      invoiceNumber: generateInvoiceNumber(),
      metadata: { disputeId: dispute._id, decisionNotes: adminDecisionNotes },
    });

    project.escrow.status = 'released';
    project.status = 'cancelled';
    await project.save();

    dispute.status = 'resolved_refund_client';
    dispute.adminDecision = adminDecisionNotes || 'Funds fully refunded to client following arbitration.';
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Notify parties
    await createNotification({
      userId: dispute.client,
      title: '✅ Dispute Resolved (Refunded)',
      message: `Your dispute for "${project.title}" has been resolved. $${dispute.amountInDispute} has been refunded to your account.`,
      type: 'dispute',
      link: `/projects/${project._id}`,
      io,
    });
    if (dispute.freelancer) {
      await createNotification({
        userId: dispute.freelancer,
        title: 'ℹ️ Dispute Decision Update',
        message: `Admin mediation completed on "${project.title}". Decision: Client Refunded.`,
        type: 'dispute',
        link: `/projects/${project._id}`,
        io,
      });
    }
  } else if (decision === 'release_freelancer') {
    // 1. Create release payment to student freelancer
    await Payment.create({
      project: project._id,
      client: dispute.client,
      freelancer: dispute.freelancer,
      amount: dispute.amountInDispute,
      type: 'release',
      status: 'mock_completed',
      invoiceNumber: generateInvoiceNumber(),
      metadata: { disputeId: dispute._id, decisionNotes: adminDecisionNotes },
    });

    if (dispute.freelancer) {
      await User.findByIdAndUpdate(dispute.freelancer, {
        $inc: { earnings: dispute.amountInDispute },
      });
    }

    project.escrow.releasedAmount += dispute.amountInDispute;
    project.escrow.status = 'released';
    project.status = 'completed';
    await project.save();

    dispute.status = 'resolved_release_freelancer';
    dispute.adminDecision = adminDecisionNotes || 'Escrow funds awarded and released to student freelancer.';
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    if (dispute.freelancer) {
      await createNotification({
        userId: dispute.freelancer,
        title: '🎉 Dispute Resolved in Your Favor!',
        message: `$${dispute.amountInDispute} escrow funds released to your wallet for "${project.title}".`,
        type: 'dispute',
        link: `/projects/${project._id}`,
        io,
      });
    }
    await createNotification({
      userId: dispute.client,
      title: 'ℹ️ Dispute Decision Update',
      message: `Admin mediation completed on "${project.title}". Escrow released to freelancer.`,
      type: 'dispute',
      link: `/projects/${project._id}`,
      io,
    });
  } else {
    throw new ApiError(400, 'Invalid decision choice. Use "refund_client" or "release_freelancer"');
  }

  res.json({ success: true, message: 'Dispute resolved successfully', dispute });
});
