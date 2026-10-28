import express from 'express';
import { signup, login, logout, getMe, googleAuth } from '../controllers/authController.js';
import { protect, verifyCsrfOrigin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sensitiveLimiter } from '../middleware/rateLimiter.js';
import { signupSchema, loginSchema, googleAuthSchema } from '../validators/authValidators.js';

const router = express.Router();

/**
 * Public Authentication Endpoints
 */
router.post(
  '/signup',
  sensitiveLimiter,
  verifyCsrfOrigin,
  validate(signupSchema),
  signup
);

// Backward-compatible alias for /register
router.post(
  '/register',
  sensitiveLimiter,
  verifyCsrfOrigin,
  validate(signupSchema),
  signup
);

router.post(
  '/login',
  sensitiveLimiter,
  verifyCsrfOrigin,
  validate(loginSchema),
  login
);

router.post(
  '/logout',
  logout
);

router.post(
  '/google',
  sensitiveLimiter,
  verifyCsrfOrigin,
  googleAuth
);

/**
 * Authenticated Session Inspection
 */
router.get(
  '/me',
  protect,
  getMe
);

export default router;
