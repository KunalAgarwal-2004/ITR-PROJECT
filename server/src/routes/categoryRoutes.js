import express from 'express';
import { MARKETPLACE_CATEGORIES } from '../constants/categories.js';
import { successResponse } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/v1/categories
 * @desc    Get all marketplace categories
 * @access  Public
 */
router.get('/', (req, res) => {
  return successResponse(res, {
    message: 'Categories retrieved successfully',
    data: MARKETPLACE_CATEGORIES,
    meta: {
      total: MARKETPLACE_CATEGORIES.length
    }
  });
});

/**
 * @route   GET /api/v1/categories/:slug
 * @desc    Get category details by slug
 * @access  Public
 */
router.get('/:slug', (req, res) => {
  const category = MARKETPLACE_CATEGORIES.find(c => c.slug === req.params.slug);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: `Category with slug '${req.params.slug}' not found`
    });
  }

  return successResponse(res, {
    message: 'Category retrieved successfully',
    data: category
  });
});

export default router;
