import express from 'express';
import {
  submitProposal,
  getMyProposals,
  getProposalsByJob,
  acceptProposal,
  rejectProposal,
  withdrawProposal
} from '../controllers/proposalController.js';
import { protect, requireClient, requireFreelancer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitProposalSchema } from '../validators/marketplaceValidators.js';

const router = express.Router();

// Freelancer actions
router.post('/', protect, requireFreelancer, validate(submitProposalSchema), submitProposal);
router.get('/my-proposals', protect, requireFreelancer, getMyProposals);
router.patch('/:id/withdraw', protect, requireFreelancer, withdrawProposal);

// Client review actions
router.get('/job/:jobId', protect, requireClient, getProposalsByJob);
router.patch('/:id/accept', protect, requireClient, acceptProposal);
router.patch('/:id/reject', protect, requireClient, rejectProposal);

export default router;
