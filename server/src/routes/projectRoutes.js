import express from 'express';
import {
  getMyProjects,
  getProjectById,
  submitMilestoneDeliverable,
  approveMilestone,
  fundEscrow
} from '../controllers/projectController.js';
import { protect, requireClient, requireFreelancer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitDeliverableSchema } from '../validators/marketplaceValidators.js';

const router = express.Router();

// Contract listing and details
router.get('/my-projects', protect, getMyProjects);
router.get('/:id', protect, getProjectById);

// Milestone lifecycle endpoints
router.post(
  '/:id/milestones/:milestoneId/deliver',
  protect,
  requireFreelancer,
  validate(submitDeliverableSchema),
  submitMilestoneDeliverable
);

router.post(
  '/:id/milestones/:milestoneId/approve',
  protect,
  requireClient,
  approveMilestone
);

router.post(
  '/:id/fund-escrow',
  protect,
  requireClient,
  fundEscrow
);

export default router;
