import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route   GET /api/health or GET /api/v1/health
 * @desc    API health check & service telemetry
 * @access  Public
 */
router.get('/', getHealth);

export default router;
