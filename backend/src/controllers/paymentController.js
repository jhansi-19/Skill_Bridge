const Payment = require('../models/Payment');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../services/paymentService');
const { createNotification } = require('../services/notificationService');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayKeyId,
} = require('../services/razorpayService');

/**
 * 1. Create a Razorpay Order for project payment
 * Called by client when they are ready to pay for submitted work (or milestones).
 */
exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { projectId, amount } = req.body;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the project client can initiate payment');
  }

  const payAmount = Number(amount) || project.budget;
  if (!payAmount || payAmount <= 0) {
    throw new ApiError(400, 'Invalid payment amount');
  }

  const order = await createRazorpayOrder({
    amount: payAmount,
    currency: 'INR',
    receipt: `rcpt_${project._id.toString().slice(-6)}`,
    notes: {
      projectId: project._id.toString(),
      projectTitle: project.title,
      clientId: req.user._id.toString(),
      freelancerId: project.hiredFreelancer ? project.hiredFreelancer.toString() : '',
    },
  });

  res.json({
    success: true,
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    keyId: order.keyId,
    isMock: order.isMock,
    payAmount,
  });
});

/**
 * 2. Verify Razorpay Payment & Transfer money to Student Freelancer
 * Called after Razorpay checkout succeeds (or in test simulation mode).
 * Directly transfers the money to student freelancer's earnings and completes project.
 */
exports.verifyAndTransferRazorpay = asyncHandler(async (req, res) => {
  const {
    projectId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    milestoneId,
  } = req.body;

  const project = await Project.findById(projectId).populate('client hiredFreelancer');
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.client._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  // Verify signature (supports real Razorpay test keys or built-in test mode)
  const isValid = verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    throw new ApiError(400, 'Invalid Razorpay payment signature');
  }

  const transferAmount = Number(amount) || project.budget;
  const paymentId = razorpay_payment_id || `pay_test_${Date.now()}`;
  const orderId = razorpay_order_id || `order_test_${Date.now()}`;

  // 1. Create completed Payment record
  const payment = await Payment.create({
    project: project._id,
    client: req.user._id,
    freelancer: project.hiredFreelancer ? project.hiredFreelancer._id : null,
    amount: transferAmount,
    type: 'razorpay',
    status: 'completed',
    invoiceNumber: generateInvoiceNumber(),
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: razorpay_signature,
    milestoneId: milestoneId || null,
    metadata: {
      gateway: 'Razorpay (Test Mode)',
      paymentId,
      orderId,
      paidAt: new Date(),
    },
  });

  // 2. Mark project as Paid & Completed
  project.paymentStatus = 'paid';
  project.status = 'completed';
  project.paidAt = new Date();
  project.razorpayOrderId = orderId;
  project.razorpayPaymentId = paymentId;

  // If milestone was specified, mark it released/completed
  if (milestoneId) {
    const ms = project.milestones?.id(milestoneId);
    if (ms) {
      ms.status = 'completed';
    }
  }

  // Update legacy escrow fields for backwards compatibility
  if (project.escrow) {
    project.escrow.fundedAmount = transferAmount;
    project.escrow.releasedAmount = transferAmount;
    project.escrow.status = 'released';
  }

  await project.save();

  // 3. Directly transfer funds to student freelancer's earnings & increment completed count
  if (project.hiredFreelancer) {
    await User.findByIdAndUpdate(project.hiredFreelancer._id, {
      $inc: { earnings: transferAmount, completedProjects: 1 },
    });
  }

  // 4. Send real-time socket notification to student freelancer
  const io = req.app.get('io');
  if (project.hiredFreelancer) {
    await createNotification({
      userId: project.hiredFreelancer._id,
      title: '🎉 Payment Received via Razorpay!',
      message: `${req.user.name} transferred $${transferAmount} via Razorpay for "${project.title}". Funds added to your balance!`,
      type: 'payment',
      link: `/invoices/${payment._id}`,
      io,
    });
  }

  res.json({
    success: true,
    message: `Payment of $${transferAmount} transferred successfully via Razorpay!`,
    payment,
    project,
  });
});

/**
 * 3. Submit Work Deliverable (Student Freelancer)
 * Student submits their completed work (links, notes, files).
 */
exports.submitDeliverable = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { milestoneId, notes, attachments } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.hiredFreelancer?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the hired student freelancer can submit work deliverables');
  }

  const deliverable = {
    notes,
    attachments: attachments || [],
    submittedAt: new Date(),
    status: 'submitted',
  };

  // Add deliverable directly to project
  project.deliverables = project.deliverables || [];
  project.deliverables.push(deliverable);

  // If milestone exists, also update milestone
  if (milestoneId) {
    const milestone = project.milestones?.id(milestoneId);
    if (milestone) {
      milestone.status = 'submitted';
      milestone.deliverables = milestone.deliverables || [];
      milestone.deliverables.push(deliverable);
    }
  }

  project.status = 'in_progress';
  await project.save();

  const io = req.app.get('io');
  await createNotification({
    userId: project.client,
    title: '📦 Work Submitted for Review',
    message: `${req.user.name} submitted completed work for "${project.title}". Please review and complete payment via Razorpay.`,
    type: 'delivery',
    link: `/projects/${project._id}`,
    io,
  });

  res.json({
    success: true,
    message: 'Work deliverables submitted successfully! Waiting for client review & Razorpay payment.',
    project,
  });
});

/**
 * 4. Request Revision (Client)
 * Client asks student for edits before transferring payment.
 */
exports.requestRevision = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { milestoneId, revisionComment } = req.body;

  if (!revisionComment) throw new ApiError(400, 'Revision feedback comment is required');

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  // Update latest deliverable with comment
  if (project.deliverables && project.deliverables.length > 0) {
    const last = project.deliverables[project.deliverables.length - 1];
    last.status = 'revision_requested';
    last.revisionComment = revisionComment;
    last.reviewedAt = new Date();
  }

  if (milestoneId) {
    const milestone = project.milestones?.id(milestoneId);
    if (milestone) {
      milestone.status = 'revision_requested';
      if (milestone.deliverables && milestone.deliverables.length > 0) {
        const last = milestone.deliverables[milestone.deliverables.length - 1];
        last.status = 'revision_requested';
        last.revisionComment = revisionComment;
        last.reviewedAt = new Date();
      }
    }
  }

  await project.save();

  const io = req.app.get('io');
  if (project.hiredFreelancer) {
    await createNotification({
      userId: project.hiredFreelancer,
      title: '🔄 Revision Requested',
      message: `Client requested changes on "${project.title}": "${revisionComment}"`,
      type: 'revision',
      link: `/projects/${project._id}`,
      io,
    });
  }

  res.json({ success: true, message: 'Revision request sent to freelancer', project });
});

/**
 * 5. Get User Payments & Invoices list
 */
exports.getPayments = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'admin'
      ? {}
      : { $or: [{ client: req.user._id }, { freelancer: req.user._id }] };

  const payments = await Payment.find(query)
    .populate('project', 'title category')
    .populate('client', 'name email')
    .populate('freelancer', 'name email')
    .sort('-createdAt')
    .limit(50);

  res.json({ success: true, payments });
});

/**
 * 6. Get Invoice by Payment ID
 */
exports.getInvoiceById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('project', 'title category budget client hiredFreelancer')
    .populate('client', 'name email companyName companyAddress')
    .populate('freelancer', 'name email education');

  if (!payment) throw new ApiError(404, 'Invoice / Payment record not found');

  const userId = req.user._id.toString();
  const clientId = payment.client?._id?.toString();
  const freelancerId = payment.freelancer?._id?.toString();

  if (userId !== clientId && userId !== freelancerId && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this invoice');
  }

  const invoice = {
    invoiceNumber: payment.invoiceNumber || `INV-${payment._id.toString().substring(0, 8).toUpperCase()}`,
    date: payment.createdAt,
    status: 'PAID',
    type: payment.type,
    amount: payment.amount,
    serviceFee: 0,
    totalAmount: payment.amount,
    transactionId: payment.razorpayPaymentId || `pay_${payment._id.toString().slice(-8)}`,
    orderId: payment.razorpayOrderId || `order_${payment._id.toString().slice(-8)}`,
    project: {
      id: payment.project?._id,
      title: payment.project?.title || 'Freelance Services',
      category: payment.project?.category || 'General',
    },
    client: {
      name: payment.client?.name,
      email: payment.client?.email,
      company: payment.client?.companyName || 'Individual Client',
    },
    freelancer: {
      name: payment.freelancer?.name,
      email: payment.freelancer?.email,
      institution: payment.freelancer?.education?.[0]?.institution || 'Verified Student Freelancer',
    },
    paymentMethod: 'Razorpay Payment Gateway (Test Mode)',
  };

  res.json({ success: true, invoice });
});

/**
 * Legacy compatibility endpoints (mapped cleanly to Razorpay / direct transfer)
 */
exports.fundProject = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Please use Razorpay payment when work is submitted' });
});

exports.fundMilestone = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Please use Razorpay payment when work is submitted' });
});

exports.approveDeliverable = asyncHandler(async (req, res) => {
  // Directly call verifyAndTransferRazorpay fallback
  req.body.projectId = req.params.projectId;
  return exports.verifyAndTransferRazorpay(req, res);
});

exports.releasePayment = asyncHandler(async (req, res) => {
  req.body.projectId = req.params.projectId;
  return exports.verifyAndTransferRazorpay(req, res);
});

exports.completeProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  project.status = 'completed';
  await project.save();
  res.json({ success: true, project });
});

exports.addMilestone = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  project.milestones.push(req.body);
  await project.save();
  res.json({ success: true, project });
});
