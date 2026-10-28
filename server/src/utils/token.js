import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { successResponse } from './apiResponse.js';

export const COOKIE_NAME = 'token';

/**
 * Returns standard cookie security options
 */
export const getCookieOptions = () => {
  const isProduction = ENV.NODE_ENV === 'production';
  return {
    httpOnly: true, // Inaccessible to JavaScript document.cookie
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax', // CSRF mitigation for same-site cross-port navigation
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  };
};

/**
 * Signs JWT token with user id and role
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    ENV.JWT_SECRET,
    {
      expiresIn: ENV.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Generates JWT, sets secure HTTP-only cookie, and sends sanitized user response
 */
export const sendTokenResponse = (
  res,
  user,
  statusCode = 200,
  message = 'Authenticated successfully'
) => {
  const token = generateToken(user);
  const cookieOptions = getCookieOptions();

  // Set HTTP-only Cookie
  res.cookie(COOKIE_NAME, token, cookieOptions);

  // Sanitized user representation
  const sanitizedUser = {
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
  };

  return successResponse(res, {
    statusCode,
    message,
    data: {
      user: sanitizedUser,
      token // Provided for Bearer header clients and automated tests
    }
  });
};

/**
 * Clears the authentication cookie on logout
 */
export const clearTokenCookie = (res) => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/'
  });
};

export default {
  COOKIE_NAME,
  generateToken,
  getCookieOptions,
  sendTokenResponse,
  clearTokenCookie
};
