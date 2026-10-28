import api, { isServerUnavailable } from './api.js';
import { MOCK_FREELANCERS, getFreelancerById as findMockFreelancerById } from '../data/mockFreelancers.js';
import { CATEGORY_MAP } from '../constants/categories.js';

/**
 * The live API returns raw profile fields; the UI also reads display fields that only the
 * mock data carries (workHistory, languages, education, ...). Fill any that are missing
 * so pages never crash on `.map` of undefined or render blank values.
 */
export const normalizeFreelancer = (f) => {
  if (!f) return f;
  const name = f.name || 'Freelancer';
  return {
    ...f,
    name,
    avatarInitials:
      f.avatarInitials ||
      name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') ||
      'F',
    categoryName: f.categoryName || CATEGORY_MAP[f.category]?.title || f.category || '',
    overview: f.overview || '',
    bio: f.bio || '',
    location: f.location || 'Remote',
    availability: f.availability || 'Available',
    skills: Array.isArray(f.skills) ? f.skills : [],
    languages: Array.isArray(f.languages) ? f.languages : [],
    education: f.education || 'Not specified',
    workHistory: Array.isArray(f.workHistory) ? f.workHistory : [],
    portfolio: (Array.isArray(f.portfolio) ? f.portfolio : []).map((item, idx) => ({
      ...item,
      id: item.id || item._id || `portfolio-${idx}`,
      skills: Array.isArray(item.skills) ? item.skills : []
    }))
  };
};

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
        data: Array.isArray(res.data) ? res.data.map(normalizeFreelancer) : [],
        total: res.meta?.total || (Array.isArray(res.data) ? res.data.length : 0),
        page: res.meta?.page || 1,
        totalPages: res.meta?.totalPages || 1,
        limit: res.meta?.limit || 6
      };
    } catch (error) {
      // Only an unreachable/failing server falls back to sample data; real 4xx errors surface
      if (!isServerUnavailable(error)) throw error;
      console.warn('[Freelancer Service] Live API unreachable, using local sample data:', error.message);
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
        data: paginatedData.map(normalizeFreelancer),
        total,
        page: currentPage,
        totalPages,
        limit,
        isSample: true
      };
    }
  },

  getFreelancerById: async (id) => {
    try {
      const res = await api.get(`/freelancers/${id}`);
      return {
        success: true,
        data: normalizeFreelancer(res.data)
      };
    } catch (error) {
      const freelancer = isServerUnavailable(error) ? findMockFreelancerById(id) : null;
      if (freelancer) {
        console.warn(`[Freelancer Service] Live API unreachable, showing sample profile ${id}:`, error.message);
        return {
          success: true,
          data: normalizeFreelancer(freelancer),
          isSample: true
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
        data: (res.data?.slice(0, limit) || []).map(normalizeFreelancer)
      };
    } catch (err) {
      if (!isServerUnavailable(err)) throw err;
      return {
        success: true,
        data: MOCK_FREELANCERS.slice(0, limit).map(normalizeFreelancer),
        isSample: true
      };
    }
  }
};

export default freelancerService;
