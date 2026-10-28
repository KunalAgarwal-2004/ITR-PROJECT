import { Proposal } from '../models/Proposal.js';
import { Job } from '../models/Job.js';
import { Project } from '../models/Project.js';
import { AppError } from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';

/**
 * @route   POST /api/proposals
 * @desc    Submit a proposal for a job posting
 * @access  Private (Freelancer)
 */
export const submitProposal = async (req, res, next) => {
  try {
    const { jobId, coverLetter, bidAmount, estimatedDuration } = req.body;

    if (!jobId || !jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Valid Job ID is required', 400));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError(`Job with id '${jobId}' not found`, 404));
    }

    if (job.status !== 'open') {
      return next(new AppError('Proposals can only be submitted for open jobs', 400));
    }

    // Prevent client from submitting a proposal to their own job
    if (job.client.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot submit a proposal to your own job posting', 400));
    }

    // Check for duplicate proposal submission
    const existingProposal = await Proposal.findOne({
      job: jobId,
      freelancer: req.user._id
    });

    if (existingProposal) {
      return next(
        new AppError(
          'You have already submitted a proposal for this job. Duplicate submissions are not permitted.',
          409
        )
      );
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount: Number(bidAmount),
      estimatedDuration,
      status: 'pending'
    });

    // Increment proposals count on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { proposalsCount: 1 } });

    await proposal.populate('freelancer', 'name email avatar');

    return successResponse(res, {
      statusCode: 201,
      message: 'Proposal submitted successfully',
      data: proposal
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Duplicate proposal: You have already submitted a bid for this job', 409));
    }
    next(error);
  }
};

/**
 * @route   GET /api/proposals/my-proposals
 * @desc    Get all proposals submitted by the authenticated freelancer
 * @access  Private (Freelancer)
 */
export const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate({
        path: 'job',
        select: 'title category categoryName budgetMin budgetMax projectType status',
        populate: {
          path: 'client',
          select: 'name company avatar'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: 'Freelancer proposals retrieved',
      data: proposals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/proposals/job/:jobId
 * @desc    Get all proposals for a specific job (Job owner only)
 * @access  Private (Client)
 */
export const getProposalsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError(`Job with id '${jobId}' not found`, 404));
    }

    // Ownership check: Only the client who posted the job can view proposals
    if (job.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: You can only view proposals for jobs you posted', 403));
    }

    const proposals = await Proposal.find({ job: jobId })
      .populate('freelancer', 'name email avatar bio rating totalJobsCompleted')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: 'Job proposals retrieved',
      data: proposals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/proposals/:id/accept
 * @desc    Accept proposal and automatically generate active Project contract (Job owner only)
 * @access  Private (Client)
 */
export const acceptProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findById(id).populate('job');
    if (!proposal) {
      return next(new AppError(`Proposal with id '${id}' not found`, 404));
    }

    const job = proposal.job;
    if (!job) {
      return next(new AppError('Associated job for this proposal not found', 404));
    }

    // Ownership check
    if (job.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: Only the client who posted the job can accept proposals', 403));
    }

    if (proposal.status === 'accepted') {
      return next(new AppError('This proposal has already been accepted', 400));
    }

    // 1. Update proposal status
    proposal.status = 'accepted';
    await proposal.save();

    // 2. Reject other proposals for this job
    await Proposal.updateMany(
      { job: job._id, _id: { $ne: proposal._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // 3. Update job status to in-progress
    job.status = 'in-progress';
    await job.save();

    // 4. Create active Project contract
    const project = await Project.create({
      job: job._id,
      client: job.client,
      freelancer: proposal.freelancer,
      proposal: proposal._id,
      title: job.title,
      totalAmount: proposal.bidAmount,
      escrowAmount: proposal.bidAmount, // Simulated initial escrow allocation
      status: 'active',
      milestones: [
        {
          title: 'Full Scope Completion & Deliverables Review',
          amount: proposal.bidAmount,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 2 weeks
          status: 'in_progress'
        }
      ]
    });

    await project.populate('freelancer', 'name email avatar');
    await project.populate('client', 'name company avatar');

    return successResponse(res, {
      statusCode: 200,
      message: 'Proposal accepted and project contract generated successfully',
      data: {
        proposal,
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/proposals/:id/reject
 * @desc    Reject a proposal (Job owner only)
 * @access  Private (Client)
 */
export const rejectProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findById(id).populate('job');
    if (!proposal) {
      return next(new AppError(`Proposal with id '${id}' not found`, 404));
    }

    if (proposal.job.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: Only the job poster can decline proposals', 403));
    }

    proposal.status = 'rejected';
    await proposal.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Proposal marked as rejected',
      data: proposal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/proposals/:id/withdraw
 * @desc    Withdraw a proposal (Freelancer who submitted only)
 * @access  Private (Freelancer)
 */
export const withdrawProposal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return next(new AppError(`Proposal with id '${id}' not found`, 404));
    }

    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: You can only withdraw your own proposals', 403));
    }

    if (proposal.status === 'accepted') {
      return next(new AppError('Cannot withdraw a proposal that has already been accepted', 400));
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    await Job.findByIdAndUpdate(proposal.job, { $inc: { proposalsCount: -1 } });

    return successResponse(res, {
      statusCode: 200,
      message: 'Proposal successfully withdrawn',
      data: proposal
    });
  } catch (error) {
    next(error);
  }
};

export default {
  submitProposal,
  getMyProposals,
  getProposalsByJob,
  acceptProposal,
  rejectProposal,
  withdrawProposal
};
