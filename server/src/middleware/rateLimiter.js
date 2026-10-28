import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: 300 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes.'
  }
});

/**
 * Strict rate limiter for sensitive endpoints (Auth, submissions):
 * 25 attempts per 15 minutes per IP
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication or submission attempts. Please try again in 15 minutes.'
  }
});

export default {
  globalLimiter,
  sensitiveLimiter
};
