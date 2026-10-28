import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  getMyJobs
} from '../controllers/jobController.js';
import { protect, requireClient } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createJobSchema, updateJobSchema } from '../validators/marketplaceValidators.js';

const router = express.Router();

// Public discovery endpoints
router.get('/', getJobs);
router.get('/client/my-jobs', protect, requireClient, getMyJobs);
router.get('/:id', getJobById);

// Client job management
router.post('/', protect, requireClient, validate(createJobSchema), createJob);
router.put('/:id', protect, requireClient, validate(updateJobSchema), updateJob);

export default router;
