import { Project } from '../models/Project.js';
import { Job } from '../models/Job.js';
import { AppError } from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * @route   GET /api/projects/my-projects
 * @desc    Get all active and past contracts for authenticated client or freelancer
 * @access  Private
 */
export const getMyProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Retrieve projects where user is either the client or the freelancer
    const projects = await Project.find({
      $or: [{ client: userId }, { freelancer: userId }]
    })
      .populate('client', 'name company avatar email')
      .populate('freelancer', 'name email avatar')
      .populate('job', 'title category categoryName projectType status')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: 'Contracts retrieved successfully',
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get detailed project contract
 * @access  Private (Participants only)
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('client', 'name company avatar email')
      .populate('freelancer', 'name email avatar')
      .populate('job');

    if (!project) {
      return next(new AppError(`Project with id '${id}' not found`, 404));
    }

    // Authorization: User must be either the client or freelancer on this contract
    const isClient = project.client._id.toString() === req.user._id.toString();
    const isFreelancer = project.freelancer._id.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return next(new AppError('Unauthorized: You are not a participant in this contract', 403));
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Project retrieved',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/milestones/:milestoneId/deliver
 * @desc    Submit milestone deliverable files and notes
 * @access  Private (Freelancer participant only)
 */
export const submitMilestoneDeliverable = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const { deliverableNote, deliverableUrl } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError(`Project with id '${id}' not found`, 404));
    }

    // Check that user is the assigned freelancer
    if (project.freelancer.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: Only the assigned freelancer can submit deliverables', 403));
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return next(new AppError(`Milestone with id '${milestoneId}' not found on this project`, 404));
    }

    if (milestone.status === 'released') {
      return next(new AppError('This milestone has already been approved and released', 400));
    }

    milestone.deliverableNote = deliverableNote;
    if (deliverableUrl) milestone.deliverableUrl = deliverableUrl;
    milestone.submittedAt = new Date();
    milestone.status = 'submitted';

    project.status = 'milestone_review';
    await project.save();

    await project.populate('freelancer', 'name avatar');
    await project.populate('client', 'name company avatar');

    return successResponse(res, {
      statusCode: 200,
      message: 'Deliverable submitted for client review',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/milestones/:milestoneId/approve
 * @desc    Client approves milestone deliverable and releases escrow payment
 * @access  Private (Client participant only)
 */
export const approveMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError(`Project with id '${id}' not found`, 404));
    }

    // Check that user is the client who owns this project
    if (project.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: Only the hiring client can approve milestone releases', 403));
    }

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return next(new AppError(`Milestone with id '${milestoneId}' not found`, 404));
    }

    if (milestone.status === 'released') {
      return next(new AppError('This milestone has already been released', 400));
    }

    milestone.status = 'released';
    milestone.releasedAt = new Date();

    // Deduct released amount from escrow holding
    if (project.escrowAmount >= milestone.amount) {
      project.escrowAmount -= milestone.amount;
    }

    // Check if all milestones are now released
    const allReleased = project.milestones.every(m => m.status === 'released');
    if (allReleased) {
      project.status = 'completed';
      // Mark job as completed
      await Job.findByIdAndUpdate(project.job, { status: 'completed' });
    } else {
      project.status = 'active';
    }

    await project.save();

    await project.populate('freelancer', 'name email avatar');
    await project.populate('client', 'name company avatar');

    return successResponse(res, {
      statusCode: 200,
      message: 'Milestone approved and funds released',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/fund-escrow
 * @desc    Client funds escrow balance for the project contract
 * @access  Private (Client participant only)
 */
export const fundEscrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError(`Project with id '${id}' not found`, 404));
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: Only the hiring client can fund escrow', 403));
    }

    const fundingAmount = Number(amount) || project.totalAmount;
    project.escrowAmount += fundingAmount;
    await project.save();

    return successResponse(res, {
      statusCode: 200,
      message: `Escrow successfully funded with $${fundingAmount.toLocaleString()}`,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyProjects,
  getProjectById,
  submitMilestoneDeliverable,
  approveMilestone,
  fundEscrow
};
