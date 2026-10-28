import express from 'express';
import healthRoutes from './healthRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import authRoutes from './authRoutes.js';
import freelancerRoutes from './freelancerRoutes.js';
import jobRoutes from './jobRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import projectRoutes from './projectRoutes.js';
import { validate } from '../middleware/validate.js';
import { registerSchema } from '../validators/authValidators.js';
import { successResponse } from '../utils/apiResponse.js';
import { requireDB } from '../middleware/dbCheck.js';

const router = express.Router();

// Mount active routes
router.use('/health', healthRoutes);
router.use('/categories', categoryRoutes);
router.use('/auth', requireDB, authRoutes);
router.use('/freelancers', requireDB, freelancerRoutes);
router.use('/jobs', requireDB, jobRoutes);
router.use('/proposals', requireDB, proposalRoutes);
router.use('/projects', requireDB, projectRoutes);

/**
 * Validation Demonstration Route
 * Validates registration payloads with Zod middleware
 */
router.post('/validate-demo', validate(registerSchema), (req, res) => {
  return successResponse(res, {
    statusCode: 200,
    message: 'Request payload successfully validated',
    data: {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role
    }
  });
});

export default router;
