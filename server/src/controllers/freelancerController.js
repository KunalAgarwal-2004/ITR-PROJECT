import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';
import { escapeRegExp, queryString, parsePagination } from '../utils/queryHelpers.js';

/**
 * @route   GET /api/freelancers
 * @desc    Search and filter public freelancer profiles with pagination
 * @access  Public
 */
export const getFreelancers = async (req, res, next) => {
  try {
    // Only plain string query values are honoured (blocks `?category[$ne]=` operator injection)
    const search = queryString(req.query.search);
    const category = queryString(req.query.category, 'all');
    const minRate = queryString(req.query.minRate);
    const maxRate = queryString(req.query.maxRate);
    const availability = queryString(req.query.availability, 'all');
    const minRating = queryString(req.query.minRating);
    const sortBy = queryString(req.query.sortBy, 'relevance');
    const { page, limit } = req.query;

    const query = {};

    // 1. Category Filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // 2. Hourly Rate Range
    const rateFilter = {};
    if (minRate && !isNaN(Number(minRate))) rateFilter.$gte = Number(minRate);
    if (maxRate && !isNaN(Number(maxRate))) rateFilter.$lte = Number(maxRate);
    if (Object.keys(rateFilter).length > 0) {
      query.hourlyRate = rateFilter;
    }

    // 3. Availability Filter
    if (availability && availability !== 'all') {
      query.availability = new RegExp(`^${escapeRegExp(availability)}$`, 'i');
    }

    // 4. Rating Filter
    if (minRating && !isNaN(Number(minRating))) {
      query.rating = { $gte: Number(minRating) };
    }

    // 5. Search across title, bio, and skills
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegExp(search.trim()), 'i');
      // Names live on the User model, so match them separately and include those profiles
      const matchingUsers = await User.find({ name: searchRegex }).select('_id').lean();
      query.$or = [
        { title: searchRegex },
        { bio: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex },
        { user: { $in: matchingUsers.map(u => u._id) } }
      ];
    }

    // 6. Sorting configuration
    let sortOption = { rating: -1, reviewsCount: -1 };
    switch (sortBy) {
      case 'rate_asc':
        sortOption = { hourlyRate: 1 };
        break;
      case 'rate_desc':
        sortOption = { hourlyRate: -1 };
        break;
      case 'rating_desc':
        sortOption = { rating: -1 };
        break;
      case 'jobs_desc':
        sortOption = { totalJobsCompleted: -1 };
        break;
      case 'relevance':
      default:
        sortOption = { rating: -1, reviewsCount: -1 };
        break;
    }

    const { pageNum, limitNum, skip } = parsePagination(page, limit, 6);

    const total = await FreelancerProfile.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const freelancers = await FreelancerProfile.find(query)
      .populate('user', 'name email avatar bio company isVerified')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Map nested user data for clean presentation
    const data = freelancers.map(f => ({
      id: f._id,
      userId: f.user?._id || f.user,
      name: f.user?.name || 'Freelancer',
      avatar: f.user?.avatar,
      title: f.title,
      category: f.category,
      subCategory: f.subCategory,
      bio: f.bio,
      hourlyRate: f.hourlyRate,
      skills: f.skills || [],
      experienceLevel: f.experienceLevel,
      availability: f.availability,
      location: f.location,
      rating: f.rating,
      reviewsCount: f.reviewsCount,
      totalJobsCompleted: f.totalJobsCompleted,
      portfolio: f.portfolio || []
    }));

    return successResponse(res, {
      statusCode: 200,
      message: 'Freelancers retrieved successfully',
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
 * @route   GET /api/freelancers/:id
 * @desc    Get public freelancer profile details by ID
 * @access  Public
 */
export const getFreelancerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID matches Profile ID or User ID
    let profile = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await FreelancerProfile.findById(id).populate('user', 'name email avatar bio company isVerified');
      if (!profile) {
        profile = await FreelancerProfile.findOne({ user: id }).populate('user', 'name email avatar bio company isVerified');
      }
    }

    if (!profile) {
      return next(new AppError(`Freelancer profile with id '${id}' not found`, 404));
    }

    const data = {
      id: profile._id,
      userId: profile.user?._id || profile.user,
      name: profile.user?.name || 'Freelancer',
      avatar: profile.user?.avatar,
      title: profile.title,
      category: profile.category,
      subCategory: profile.subCategory,
      bio: profile.bio,
      hourlyRate: profile.hourlyRate,
      skills: profile.skills || [],
      experienceLevel: profile.experienceLevel,
      availability: profile.availability,
      location: profile.location,
      rating: profile.rating,
      reviewsCount: profile.reviewsCount,
      totalJobsCompleted: profile.totalJobsCompleted,
      portfolio: profile.portfolio || []
    };

    return successResponse(res, {
      statusCode: 200,
      message: 'Freelancer profile retrieved',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/freelancers/me/profile
 * @desc    Get currently logged in freelancer's profile
 * @access  Private (Freelancer)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    let profile = await FreelancerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar bio company');

    if (!profile) {
      // Auto-create blank starter profile if none exists
      profile = await FreelancerProfile.create({
        user: req.user._id,
        title: 'Freelance Specialist',
        category: 'development-it',
        bio: 'Please update your professional summary in profile settings.',
        hourlyRate: 40,
        skills: ['Professional'],
        availability: 'contract'
      });
      await profile.populate('user', 'name email avatar bio company');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'My profile retrieved',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/freelancers/profile
 * @desc    Update authenticated freelancer profile
 * @access  Private (Freelancer)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      title,
      category,
      subCategory,
      bio,
      hourlyRate,
      skills,
      experienceLevel,
      availability,
      location,
      portfolio,
      avatar
    } = req.body;

    let profile = await FreelancerProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new FreelancerProfile({ user: req.user._id });
    }

    if (title !== undefined) profile.title = title;
    if (category !== undefined) profile.category = category;
    if (subCategory !== undefined) profile.subCategory = subCategory;
    if (bio !== undefined) profile.bio = bio;
    if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate);
    if (skills !== undefined) profile.skills = skills;
    if (experienceLevel !== undefined) profile.experienceLevel = experienceLevel;
    if (availability !== undefined) profile.availability = availability;
    if (location !== undefined) profile.location = location;
    if (portfolio !== undefined) profile.portfolio = portfolio;

    await profile.save();

    // Update avatar on User model if provided
    if (avatar) {
      await User.findByIdAndUpdate(req.user._id, { avatar });
    }

    await profile.populate('user', 'name email avatar bio company');

    return successResponse(res, {
      statusCode: 200,
      message: 'Freelancer profile updated successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getFreelancers,
  getFreelancerById,
  getMyProfile,
  updateMyProfile
};
