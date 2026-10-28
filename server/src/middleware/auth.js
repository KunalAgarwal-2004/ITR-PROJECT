import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { USER_ROLES } from '../constants/roles.js';
import { User } from '../models/User.js';

/**
 * Authentication Middleware: Validates JWT token from HTTP-only cookie or Authorization header.
 * Populates req.user with the verified active database user object.
 */
export const protect = async (req, res, next) => {
  try {
    // Collect every credential on the request: HTTP-only cookie (unsigned or signed),
    // then Bearer header. A stale cookie must not mask a valid Bearer token.
    const candidates = [];
    if (req.cookies?.token) candidates.push(req.cookies.token);
    if (req.signedCookies?.token) candidates.push(req.signedCookies.token);
    if (req.headers.authorization) {
      const parts = req.headers.authorization.trim().split(/\s+/);
      if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
        candidates.push(parts[1]);
      }
    }

    if (candidates.length === 0) {
      return next(new AppError('Authentication required. Please log in to proceed.', 401));
    }

    // Verify token signature and expiration; the first valid candidate wins
    let decoded;
    let jwtErr;
    for (const candidate of candidates) {
      try {
        decoded = jwt.verify(candidate, ENV.JWT_SECRET);
        break;
      } catch (err) {
        jwtErr ??= err;
      }
    }
    if (!decoded) {
      if (jwtErr.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token. Please log in again.', 401));
    }

    const userId = decoded.id || decoded._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError('Invalid authentication token payload.', 401));
    }

    // Retrieve active user from database
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('The user account belonging to this token no longer exists.', 401));
    }

    if (user.accountStatus !== 'active') {
      return next(
        new AppError(
          `Your account is currently ${user.accountStatus}. Please contact customer support.`,
          403
        )
      );
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Alias for protect
export const authenticate = protect;

/**
 * Role-Based Authorization Middleware
 * Restricts access to specified roles (e.g. client or freelancer)
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('User role not identified. Access denied.', 403));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

export const requireRole = authorize;
export const requireClient = authorize(USER_ROLES.CLIENT);
export const requireFreelancer = authorize(USER_ROLES.FREELANCER);

/**
 * CSRF Protection Middleware for Cookie-based Sessions:
 * Verifies Origin/Referer on state-changing requests against CLIENT_URL.
 */
export const verifyCsrfOrigin = (req, res, next) => {
  // Only verify state-modifying verbs
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check Origin or Referer header if using cookies
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    // Direct server-to-server or curl requests without origin pass to normal auth
    return next();
  }

  const allowedOrigins = [
    ENV.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5000'
  ];

  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
  if (!isAllowed) {
    return next(new AppError('Cross-Site Request Forgery (CSRF) blocked. Invalid origin.', 403));
  }

  next();
};

export default {
  protect,
  authenticate,
  authorize,
  requireRole,
  requireClient,
  requireFreelancer,
  verifyCsrfOrigin
};
