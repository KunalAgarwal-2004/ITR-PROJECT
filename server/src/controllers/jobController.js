import { Job } from '../models/Job.js';
import { AppError } from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';
import { MARKETPLACE_CATEGORIES } from '../constants/categories.js';
import { escapeRegExp, queryString, parsePagination } from '../utils/queryHelpers.js';

/**
 * @route   GET /api/jobs
 * @desc    Get jobs with multi-attribute search, category, type, and budget filters
 * @access  Public
 */
export const getJobs = async (req, res, next) => {
  try {
    // Only plain string query values are honoured (blocks `?status[$ne]=` operator injection)
    const search = queryString(req.query.search);
    const category = queryString(req.query.category, 'all');
    const projectType = queryString(req.query.projectType, 'all');
    const experienceLevel = queryString(req.query.experienceLevel, 'all');
    const minBudget = queryString(req.query.minBudget);
    const maxBudget = queryString(req.query.maxBudget);
    const status = queryString(req.query.status, 'open');
    const sortBy = queryString(req.query.sortBy, 'newest');
    const { page, limit } = req.query;

    const query = {};
    // Independent $or groups (budget, search) are combined with $and so neither overwrites the other
    const andClauses = [];

    // 1. Status Filter (Defaults to 'open' unless specified 'all')
    if (status && status !== 'all') {
      query.status = status;
    }

    // 2. Category Filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // 3. Project Type Filter
    if (projectType && projectType !== 'all') {
      query.projectType = new RegExp(`^${escapeRegExp(projectType)}$`, 'i');
    }

    // 4. Experience Level Filter
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel.toLowerCase();
    }

    // 5. Budget Filters
    if (minBudget && !isNaN(Number(minBudget))) {
      andClauses.push({
        $or: [
          { budgetMax: { $gte: Number(minBudget) } },
          { budgetMin: { $gte: Number(minBudget) } }
        ]
      });
    }
    if (maxBudget && !isNaN(Number(maxBudget))) {
      query.budgetMin = { $lte: Number(maxBudget) };
    }

    // 6. Search across title, description, skills
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      andClauses.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { skills: { $in: [searchRegex] } },
          { categoryName: searchRegex }
        ]
      });
    }

    if (andClauses.length > 0) {
      query.$and = andClauses;
    }

    // 7. Sorting
    let sortOption = { createdAt: -1 };
    switch (sortBy) {
      case 'budget_desc':
        sortOption = { budgetMax: -1, budgetMin: -1 };
        break;
      case 'budget_asc':
        sortOption = { budgetMin: 1, budgetMax: 1 };
        break;
      case 'proposals_asc':
        sortOption = { proposalsCount: 1 };
        break;
      case 'proposals_desc':
        sortOption = { proposalsCount: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const { pageNum, limitNum, skip } = parsePagination(page, limit, 6);

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const jobs = await Job.find(query)
      .populate('client', 'name company avatar isVerified')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const data = jobs.map(j => ({
      id: j._id,
      title: j.title,
      description: j.description,
      category: j.category,
      categoryName: j.categoryName || MARKETPLACE_CATEGORIES.find(c => c.slug === j.category)?.title || j.category,
      projectType: j.projectType,
      budgetMin: j.budgetMin,
      budgetMax: j.budgetMax,
      experienceLevel: j.experienceLevel,
      skills: j.skills || [],
      status: j.status,
      proposalsCount: j.proposalsCount || 0,
      postedDate: j.createdAt,
      deadline: j.deadline,
      client: {
        id: j.client?._id,
        name: j.client?.company || j.client?.name || 'Verified Client',
        avatar: j.client?.avatar,
        isVerified: j.client?.isVerified
      }
    }));

    return successResponse(res, {
      statusCode: 200,
      message: 'Jobs retrieved successfully',
      data,
      meta: {
        total,
        page: pageNum,
        totalPages,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get detailed single job posting
 * @access  Public
 */
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError(`Invalid job ID format: ${id}`, 400));
    }

    const job = await Job.findById(id).populate('client', 'name company avatar isVerified bio createdAt');

    if (!job) {
      return next(new AppError(`Job with id '${id}' not found`, 404));
    }

    const data = {
      id: job._id,
      title: job.title,
      description: job.description,
      category: job.category,
      categoryName: job.categoryName || MARKETPLACE_CATEGORIES.find(c => c.slug === job.category)?.title || job.category,
      projectType: job.projectType,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      experienceLevel: job.experienceLevel,
      skills: job.skills || [],
      status: job.status,
      proposalsCount: job.proposalsCount || 0,
      postedDate: job.createdAt,
      deadline: job.deadline,
      client: {
        id: job.client?._id,
        name: job.client?.company || job.client?.name || 'Verified Client',
        avatar: job.client?.avatar,
        isVerified: job.client?.isVerified,
        memberSince: job.client?.createdAt
      }
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Job details retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting
 * @access  Private (Client)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      categoryName,
      projectType = 'Fixed-Price',
      budgetMin = 0,
      budgetMax,
      experienceLevel = 'intermediate',
      skills,
      deadline
    } = req.body;

    const resolvedCategoryName = categoryName || MARKETPLACE_CATEGORIES.find(c => c.slug === category)?.title || category;

    const job = await Job.create({
      client: req.user._id,
      title,
      description,
      category,
      categoryName: resolvedCategoryName,
      projectType,
      budgetMin: Number(budgetMin),
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      experienceLevel,
      skills,
      deadline: deadline ? new Date(deadline) : undefined,
      status: 'open',
      proposalsCount: 0
    });

    await job.populate('client', 'name company avatar isVerified');

    return successResponse(res, {
      statusCode: 201,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job posting (Owner only)
 * @access  Private (Client)
 */
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return next(new AppError(`Job with id '${id}' not found`, 404));
    }

    // Ownership check: Only the client who created the job can edit it
    if (job.client.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized: You can only edit jobs created by your account', 403));
    }

    // Once a contract exists (in-progress) or the job is finished, the posting is locked;
    // its status is then driven by the project/milestone flow, not by direct edits.
    if (!['open', 'cancelled'].includes(job.status)) {
      return next(new AppError(`A job that is ${job.status} can no longer be edited`, 400));
    }

    const updatableFields = [
      'title',
      'description',
      'category',
      'projectType',
      'budgetMin',
      'budgetMax',
      'experienceLevel',
      'skills',
      'status',
      'deadline'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    // Keep the display name in sync with the category slug
    if (req.body.category !== undefined) {
      job.categoryName =
        MARKETPLACE_CATEGORIES.find(c => c.slug === job.category)?.title || req.body.categoryName || job.category;
    }

    if (job.budgetMax != null && job.budgetMin != null && job.budgetMax < job.budgetMin) {
      return next(new AppError('Maximum budget cannot be lower than minimum budget', 400));
    }

    await job.save();
    await job.populate('client', 'name company avatar isVerified');

    return successResponse(res, {
      statusCode: 200,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/client/my-jobs
 * @desc    Get all jobs posted by authenticated client
 * @access  Private (Client)
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, {
      statusCode: 200,
      message: 'Client jobs retrieved successfully',
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  getMyJobs
};
