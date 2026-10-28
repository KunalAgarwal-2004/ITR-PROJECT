import { MARKETPLACE_CATEGORIES, CATEGORY_MAP } from '../constants/categories.js';

/**
 * Category Service Layer
 */
export const categoryService = {
  getCategories: async () => {
    return {
      success: true,
      data: MARKETPLACE_CATEGORIES,
      total: MARKETPLACE_CATEGORIES.length
    };
  },

  getCategoryBySlug: async (slug) => {
    const category = CATEGORY_MAP[slug];
    if (!category) {
      throw new Error(`Category with slug '${slug}' not found`);
    }
    return {
      success: true,
      data: category
    };
  }
};

export default categoryService;
