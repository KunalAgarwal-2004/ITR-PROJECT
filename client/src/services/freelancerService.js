import api from './api.js';
import { MOCK_FREELANCERS, getFreelancerById as findMockFreelancerById } from '../data/mockFreelancers.js';

/**
 * Freelancer Service Layer
 * Connects to real Express REST backend with multi-attribute filtering,
 * sorting, and pagination, preserving fallback resilience.
 */
export const freelancerService = {
  getFreelancers: async (params = {}) => {
    try {
      const res = await api.get('/freelancers', { params });
      return {
        success: true,
        data: res.data,
        total: res.meta?.total || res.data?.length || 0,
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        limit: res.meta?.limit || 6
      };
    } catch (error) {
      // Offline fallback using mock data if server is unreachable
      console.warn('[Freelancer Service] Live API unreachable, using local fallback:', error.message);
      const {
        search = '',
        category = 'all',
        minRate,
        maxRate,
        availability = 'all',
        minRating,
        sortBy = 'relevance',
        page = 1,
        limit = 6
      } = params;

      let results = [...MOCK_FREELANCERS];

      if (category && category !== 'all') {
        results = results.filter(f => f.category === category);
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        results = results.filter(f =>
          f.name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.bio.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.skills.some(s => s.toLowerCase().includes(q))
        );
      }
      if (minRate !== undefined && minRate !== '' && !isNaN(Number(minRate))) {
        results = results.filter(f => f.hourlyRate >= Number(minRate));
      }
      if (maxRate !== undefined && maxRate !== '' && !isNaN(Number(maxRate))) {
        results = results.filter(f => f.hourlyRate <= Number(maxRate));
      }
      if (availability && availability !== 'all') {
        results = results.filter(f => f.availability.toLowerCase().includes(availability.toLowerCase()));
      }
      if (minRating !== undefined && minRating !== '' && !isNaN(Number(minRating))) {
        results = results.filter(f => f.rating >= Number(minRating));
      }

      switch (sortBy) {
        case 'rate_asc':
          results.sort((a, b) => a.hourlyRate - b.hourlyRate);
          break;
        case 'rate_desc':
          results.sort((a, b) => b.hourlyRate - a.hourlyRate);
          break;
        case 'rating_desc':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'jobs_desc':
          results.sort((a, b) => b.totalJobsCompleted - a.totalJobsCompleted);
          break;
        case 'relevance':
        default:
          results.sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
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

  getFreelancerById: async (id) => {
    try {
      const res = await api.get(`/freelancers/${id}`);
      return {
        success: true,
        data: res.data
      };
    } catch (error) {
      console.warn(`[Freelancer Service] Live API error fetching ${id}, checking fallback:`, error.message);
      const freelancer = findMockFreelancerById(id);
      if (freelancer) {
        return {
          success: true,
          data: freelancer
        };
      }
      throw error;
    }
  },

  getMyProfile: async () => {
    return await api.get('/freelancers/me/profile');
  },

  updateMyProfile: async (profileData) => {
    return await api.put('/freelancers/profile', profileData);
  },

  getFeaturedFreelancers: async (limit = 4) => {
    try {
      const res = await api.get('/freelancers', { params: { limit, sortBy: 'relevance' } });
      return {
        success: true,
        data: res.data?.slice(0, limit) || []
      };
    } catch (err) {
      return {
        success: true,
        data: MOCK_FREELANCERS.slice(0, limit)
      };
    }
  }
};

export default freelancerService;
