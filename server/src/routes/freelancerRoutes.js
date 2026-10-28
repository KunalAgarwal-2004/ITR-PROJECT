import express from 'express';
import {
  getFreelancers,
  getFreelancerById,
  getMyProfile,
  updateMyProfile
} from '../controllers/freelancerController.js';
import { protect, requireFreelancer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateFreelancerProfileSchema } from '../validators/marketplaceValidators.js';

const router = express.Router();

// Public discovery endpoints
router.get('/', getFreelancers);
router.get('/me/profile', protect, requireFreelancer, getMyProfile);
router.get('/:id', getFreelancerById);

// Authenticated profile management
router.put('/profile', protect, requireFreelancer, validate(updateFreelancerProfileSchema), updateMyProfile);

export default router;
