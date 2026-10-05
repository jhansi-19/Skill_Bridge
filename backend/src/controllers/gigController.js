const Gig = require('../models/Gig');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInvoiceNumber } = require('../services/paymentService');
const { createNotification } = require('../services/notificationService');

exports.createGig = asyncHandler(async (req, res) => {
  const { title, category, description, coverImage, gallery, tags, packages } = req.body;

  if (!packages || !packages.basic || !packages.standard || !packages.premium) {
    throw new ApiError(400, 'All 3 packages (Basic, Standard, Premium) are required');
  }

  const gig = await Gig.create({
    title,
    freelancer: req.user._id,
    category: category || 'web-development',
    description,
    coverImage: coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    gallery: gallery || [],
    tags: tags || [],
    packages,
  });

  res.status(201).json({ success: true, gig });
});

exports.getGigs = asyncHandler(async (req, res) => {
  const { category, search, sort } = req.query;
  const filter = { status: 'active' };

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'rating') sortOption = { 'ratings.average': -1 };
  if (sort === 'orders') sortOption = { ordersCount: -1 };
  if (sort === 'price_asc') sortOption = { 'packages.basic.price': 1 };
  if (sort === 'price_desc') sortOption = { 'packages.basic.price': -1 };

  const gigs = await Gig.find(filter)
    .populate('freelancer', 'name username avatar education badges ratings')
    .sort(sortOption)
    .limit(50);

  res.json({ success: true, count: gigs.length, gigs });
});

exports.getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate(
    'freelancer',
    'name username avatar bio education badges ratings completedProjects hourlyRate'
  );

  if (!gig) throw new ApiError(404, 'Gig not found');

  res.json({ success: true, gig });
});

exports.updateGig = asyncHandler(async (req, res) => {
  let gig = await Gig.findById(req.params.id);
  if (!gig) throw new ApiError(404, 'Gig not found');

  if (gig.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this gig');
  }

  gig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, gig });
});

exports.deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) throw new ApiError(404, 'Gig not found');

  if (gig.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  await gig.deleteOne();
  res.json({ success: true, message: 'Gig deleted' });
});

exports.orderGig = asyncHandler(async (req, res) => {
  const { tier } = req.body; // 'basic', 'standard', or 'premium'
  const gig = await Gig.findById(req.params.id).populate('freelancer');
  if (!gig) throw new ApiError(404, 'Gig not found');

  const selectedPackage = gig.packages[tier];
  if (!selectedPackage) throw new ApiError(400, 'Invalid package tier selected');

  const projectTitle = `${gig.title} (${tier.toUpperCase()} Package)`;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + selectedPackage.deliveryDays);

  // 1. Create project directly with the hired freelancer
  const project = await Project.create({
    title: projectTitle,
    description: `Ordered from Gig: "${gig.title}".\nPackage: ${selectedPackage.title}\nDetails: ${selectedPackage.description}`,
    budget: selectedPackage.price,
    category: gig.category,
    skillsRequired: gig.tags,
    client: req.user._id,
    hiredFreelancer: gig.freelancer._id,
    status: 'in_progress',
    deadline: deadlineDate,
    milestones: [
      {
        title: `${selectedPackage.title} Delivery`,
        description: selectedPackage.description,
        amount: selectedPackage.price,
        status: 'funded',
        dueDate: deadlineDate,
      },
    ],
    escrow: {
      totalAmount: selectedPackage.price,
      fundedAmount: selectedPackage.price,
      releasedAmount: 0,
      status: 'funded',
    },
  });

  // 2. Create Payment Record (Escrow Funded)
  const payment = await Payment.create({
    project: project._id,
    client: req.user._id,
    freelancer: gig.freelancer._id,
    amount: selectedPackage.price,
    type: 'fund',
    status: 'mock_completed',
    invoiceNumber: generateInvoiceNumber(),
    metadata: {
      gigId: gig._id,
      tier,
      packageName: selectedPackage.title,
      method: 'mock_escrow',
    },
  });

  // 3. Increment gig orders count
  await Gig.findByIdAndUpdate(gig._id, { $inc: { ordersCount: 1 } });

  // 4. Notify student freelancer
  const io = req.app.get('io');
  await createNotification({
    userId: gig.freelancer._id,
    title: '🎉 New Gig Order Received!',
    message: `${req.user.name} ordered your ${tier.toUpperCase()} package ($${selectedPackage.price}) for "${gig.title}"`,
    type: 'order',
    link: `/projects/${project._id}`,
    io,
  });

  res.status(201).json({
    success: true,
    message: 'Gig order placed successfully!',
    project,
    payment,
  });
});
