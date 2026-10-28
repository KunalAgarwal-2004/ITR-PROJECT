import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { AppError } from '../utils/appError.js';
import { successResponse } from '../utils/apiResponse.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/token.js';
import { verifyGoogleIdToken } from '../services/googleAuthService.js';
import { USER_ROLES } from '../constants/roles.js';

/**
 * @route   POST /api/auth/signup (or /api/v1/auth/signup)
 * @desc    Register a new client or freelancer
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Strict role whitelist check
    if (role !== USER_ROLES.CLIENT && role !== USER_ROLES.FREELANCER) {
      return next(
        new AppError('Public signup is strictly limited to client or freelancer accounts', 400)
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(
        new AppError(
          'An account with this email address already exists. Please log in instead.',
          409
        )
      );
    }

    // Create User record
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      authProvider: 'local',
      isVerified: false,
      accountStatus: 'active'
    });

    // If freelancer, initialize a starter profile
    if (role === USER_ROLES.FREELANCER) {
      try {
        await FreelancerProfile.create({
          user: user._id,
          title: 'Professional Freelancer',
          category: 'development-it',
          bio: 'Welcome to my WorkBridge profile! Contact me for collaborative project work.',
          hourlyRate: 35,
          skills: ['Communication', 'Project Management'],
          availability: 'contract'
        });
      } catch (profileErr) {
        // Log profile creation error without failing user signup
        console.warn('[Signup] Auto-creation of initial profile warning:', profileErr.message);
      }
    }

    return sendTokenResponse(res, user, 201, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login (or /api/v1/auth/login)
 * @desc    Authenticate local user & set HTTP-only cookie
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user including password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Google-only account check
    if (!user.password && user.authProvider === 'google') {
      return next(
        new AppError(
          'This account was registered using Google Sign-In. Please sign in with Google.',
          400
        )
      );
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Account status check
    if (user.accountStatus !== 'active') {
      return next(
        new AppError(
          `Your account is currently ${user.accountStatus}. Please contact support.`,
          403
        )
      );
    }

    return sendTokenResponse(res, user, 200, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout (or /api/v1/auth/logout)
 * @desc    Clear authentication cookie
 * @access  Public
 */
export const logout = (req, res) => {
  clearTokenCookie(res);
  return successResponse(res, {
    statusCode: 200,
    message: 'Logged out successfully'
  });
};

/**
 * @route   GET /api/auth/me (or /api/v1/auth/me)
 * @desc    Get active authenticated session user
 * @access  Private (Requires protect middleware)
 */
export const getMe = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('Authentication required. Please log in to proceed.', 401));
  }
  return successResponse(res, {
    statusCode: 200,
    message: 'Active session retrieved',
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        avatar: user.avatar,
        bio: user.bio,
        company: user.company,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    }
  });
};

/**
 * @route   POST /api/auth/google (or /api/v1/auth/google)
 * @desc    Authenticate with verified Google ID token
 * @access  Public
 */
export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, credential, role = USER_ROLES.CLIENT } = req.body;
    const tokenToVerify = idToken || credential;

    // Verify ID token server-side with official Google Auth Library
    const googlePayload = await verifyGoogleIdToken(tokenToVerify);
    const { sub, email, name, picture } = googlePayload;

    // Find existing user by Google sub ID or email
    let user = await User.findOne({
      $or: [{ googleId: sub }, { email }]
    });

    if (user) {
      // Prevent account takeover: if user already has a different Google ID attached
      if (user.googleId && user.googleId !== sub) {
        return next(
          new AppError(
            'Security conflict: This email address is already linked to a different Google account.',
            403
          )
        );
      }

      let modified = false;

      // Link Google ID if not yet linked
      if (!user.googleId) {
        user.googleId = sub;
        user.isVerified = true;
        modified = true;
      }

      // If user has a placeholder or empty name, update with the actual Google verified name
      if ((!user.name || user.name === 'Google Verified User' || user.name === 'Google User') && name) {
        user.name = name;
        modified = true;
      }

      // Update avatar if not present or placeholder
      if (picture && (!user.avatar || user.avatar.includes('unsplash.com'))) {
        user.avatar = picture;
        modified = true;
      }

      if (modified) {
        await user.save();
      }

      // Check account status
      if (user.accountStatus !== 'active') {
        return next(
          new AppError(
            `Your account is currently ${user.accountStatus}. Please contact support.`,
            403
          )
        );
      }
    } else {
      // Create new user with verified Google details
      const assignedRole =
        role === USER_ROLES.FREELANCER ? USER_ROLES.FREELANCER : USER_ROLES.CLIENT;

      user = await User.create({
        name,
        email,
        role: assignedRole,
        avatar: picture,
        authProvider: 'google',
        googleId: sub,
        isVerified: true,
        accountStatus: 'active'
      });

      if (assignedRole === USER_ROLES.FREELANCER) {
        try {
          await FreelancerProfile.create({
            user: user._id,
            title: 'Professional Freelancer',
            category: 'development-it',
            bio: 'Welcome to my WorkBridge profile! Contact me for collaborative work.',
            hourlyRate: 40,
            skills: ['General Freelancing'],
            availability: 'contract'
          });
        } catch (err) {
          console.warn('[Google Auth] Profile auto-creation warning:', err.message);
        }
      }
    }

    return sendTokenResponse(res, user, 200, 'Authenticated with Google successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  login,
  logout,
  getMe,
  googleAuth
};
