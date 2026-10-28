import api from './api.js';

export const projectService = {
  getMyProjects: async () => {
    return await api.get('/projects/my-projects');
  },

  getProjectById: async (id) => {
    return await api.get(`/projects/${id}`);
  },

  submitMilestoneDeliverable: async (projectId, milestoneId, deliverableData) => {
    return await api.post(`/projects/${projectId}/milestones/${milestoneId}/deliver`, deliverableData);
  },

  approveMilestone: async (projectId, milestoneId) => {
    return await api.post(`/projects/${projectId}/milestones/${milestoneId}/approve`);
  },

  fundEscrow: async (projectId, amount) => {
    return await api.post(`/projects/${projectId}/fund-escrow`, { amount });
  }
};

export default projectService;
