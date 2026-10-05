const Payment = require('../models/Payment');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');

const generateInvoiceNumber = () => {
  return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const mockFundProject = async (projectId, clientId, amount) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== clientId?.toString()) throw new ApiError(403, 'Not authorized');
  if (!['open', 'in_progress'].includes(project.status)) {
    throw new ApiError(400, 'Project cannot be funded in current status');
  }

  const payment = await Payment.create({
    project: projectId,
    client: clientId,
    freelancer: project.hiredFreelancer,
    amount,
    type: 'fund',
    status: 'mock_completed',
    invoiceNumber: generateInvoiceNumber(),
    metadata: { method: 'mock', stripeReady: true },
  });

  project.escrow.fundedAmount += amount;
  project.escrow.totalAmount = project.budget;
  if (project.escrow.fundedAmount >= project.budget) {
    project.escrow.status = 'funded';
  } else {
    project.escrow.status = 'partial';
  }
  await project.save();

  return { payment, project };
};

const mockReleasePayment = async (projectId, clientId, amount, milestoneId = null) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.client.toString() !== clientId?.toString()) throw new ApiError(403, 'Not authorized');
  if (project.escrow.fundedAmount - project.escrow.releasedAmount < amount) {
    throw new ApiError(400, 'Insufficient escrow balance');
  }

  const payment = await Payment.create({
    project: projectId,
    client: clientId,
    freelancer: project.hiredFreelancer,
    amount,
    type: 'release',
    status: 'mock_completed',
    milestoneId,
    invoiceNumber: generateInvoiceNumber(),
    metadata: { method: 'mock', stripeReady: true },
  });

  project.escrow.releasedAmount += amount;
  if (project.escrow.releasedAmount >= project.escrow.fundedAmount) {
    project.escrow.status = 'released';
  }
  await project.save();

  return { payment, project };
};

module.exports = { mockFundProject, mockReleasePayment, generateInvoiceNumber };
