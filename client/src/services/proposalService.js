import api from './api.js';

export const proposalService = {
  submitProposal: async (proposalData) => {
    return await api.post('/proposals', proposalData);
  },

  getMyProposals: async () => {
    return await api.get('/proposals/my-proposals');
  },

  getProposalsByJob: async (jobId) => {
    return await api.get(`/proposals/job/${jobId}`);
  },

  acceptProposal: async (proposalId) => {
    return await api.patch(`/proposals/${proposalId}/accept`);
  },

  rejectProposal: async (proposalId) => {
    return await api.patch(`/proposals/${proposalId}/reject`);
  },

  withdrawProposal: async (proposalId) => {
    return await api.patch(`/proposals/${proposalId}/withdraw`);
  }
};

export default proposalService;
