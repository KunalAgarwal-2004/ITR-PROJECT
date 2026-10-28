import api from './api.js';
import { MOCK_JOBS, getJobById as findMockJobById } from '../data/mockJobs.js';

/**
 * Job Service Layer
 * Connects to real Express REST backend with multi-attribute filtering,
 * sorting, pagination, and client job postings management.
 */
export const jobService = {
  getJobs: async (params = {}) => {
    try {
      const res = await api.get('/jobs', { params });
      return {
        success: true,
        data: res.data,
        total: res.meta?.total || res.data?.length || 0,
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        limit: res.meta?.limit || 6
      };
    } catch (error) {
      console.warn('[Job Service] Live API unreachable, using local fallback:', error.message);
      const {
        search = '',
        category = 'all',
        projectType = 'all',
        experienceLevel = 'all',
        minBudget,
        maxBudget,
        sortBy = 'newest',
        page = 1,
        limit = 6
      } = params;

      let results = [...MOCK_JOBS];

      if (category && category !== 'all') {
        results = results.filter(j => j.category === category);
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        results = results.filter(j =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.categoryName.toLowerCase().includes(q) ||
          j.client?.name?.toLowerCase().includes(q) ||
          j.skills.some(s => s.toLowerCase().includes(q))
        );
      }
      if (projectType && projectType !== 'all') {
        results = results.filter(j => j.projectType.toLowerCase() === projectType.toLowerCase());
      }
      if (experienceLevel && experienceLevel !== 'all') {
        results = results.filter(j => j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());
      }
      if (minBudget !== undefined && minBudget !== '' && !isNaN(Number(minBudget))) {
        results = results.filter(j => (j.budgetMax || j.budgetMin || 0) >= Number(minBudget));
      }
      if (maxBudget !== undefined && maxBudget !== '' && !isNaN(Number(maxBudget))) {
        results = results.filter(j => (j.budgetMin || 0) <= Number(maxBudget));
      }

      switch (sortBy) {
        case 'budget_desc':
          results.sort((a, b) => (b.budgetMax || b.budgetMin || 0) - (a.budgetMax || a.budgetMin || 0));
          break;
        case 'budget_asc':
          results.sort((a, b) => (a.budgetMin || 0) - (b.budgetMin || 0));
          break;
        case 'proposals_asc':
          results.sort((a, b) => a.proposalsCount - b.proposalsCount);
          break;
        case 'proposals_desc':
          results.sort((a, b) => b.proposalsCount - a.proposalsCount);
          break;
        case 'newest':
        default:
          results.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
          break;
      }

      const total = results.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const currentPage = Math.max(1, Math.min(page, totalPages));
      const startIndex = (currentPage - 1) * limit;
      const paginatedData = results.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: paginatedData,
        total,
        page: currentPage,
        totalPages,
        limit
      };
    }
  },

  getJobById: async (id) => {
    try {
      const res = await api.get(`/jobs/${id}`);
      return {
        success: true,
        data: res.data
      };
    } catch (error) {
      console.warn(`[Job Service] Live API error fetching ${id}, checking fallback:`, error.message);
      const job = findMockJobById(id);
      if (job) {
        return {
          success: true,
          data: job
        };
      }
      throw error;
    }
  },

  createJob: async (jobData) => {
    return await api.post('/jobs', jobData);
  },

  updateJob: async (id, jobData) => {
    return await api.put(`/jobs/${id}`, jobData);
  },

  getMyJobs: async () => {
    return await api.get('/jobs/client/my-jobs');
  },

  getFeaturedJobs: async (limit = 4) => {
    try {
      const res = await api.get('/jobs', { params: { limit, sortBy: 'newest' } });
      return {
        success: true,
        data: res.data?.slice(0, limit) || []
      };
    } catch (err) {
      return {
        success: true,
        data: MOCK_JOBS.slice(0, limit)
      };
    }
  }
};

export default jobService;
