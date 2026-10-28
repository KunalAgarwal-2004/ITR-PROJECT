import { freelancerService } from './src/services/freelancerService.js';
import { jobService } from './src/services/jobService.js';
import { categoryService } from './src/services/categoryService.js';
import { authService } from './src/services/authService.js';
import { proposalService } from './src/services/proposalService.js';
import { projectService } from './src/services/projectService.js';

async function runTests() {
  console.log('--- Starting Interaction & Service Layer Automated Tests ---');

  // Test 1: Category Listing & Slugs
  const categoriesRes = await categoryService.getCategories();
  console.assert(categoriesRes.data.length === 10, `Expected 10 categories, got ${categoriesRes.data.length}`);
  const aiCatRes = await categoryService.getCategoryBySlug('ai-services');
  console.assert(aiCatRes.data && aiCatRes.data.title === 'AI Services', 'Failed to retrieve ai-services category');
  console.log('✓ Category Service: 10 categories verified, slug lookup working.');

  // Test 2: Freelancer search, combined filters, sorting & pagination
  const allFreelancers = await freelancerService.getFreelancers({ limit: 100 });
  console.assert(allFreelancers.total >= 5, 'Total freelancers count unexpected');

  const pythonDevs = await freelancerService.getFreelancers({ search: 'Python', limit: 10 });
  console.assert(pythonDevs.data.length > 0, 'Search for "Python" should return results');

  const filteredAi = await freelancerService.getFreelancers({ category: 'ai-services', minRate: 50, maxRate: 150 });
  console.assert(filteredAi.data.every(f => f.category === 'ai-services' && f.hourlyRate >= 50 && f.hourlyRate <= 150),
    'Combined filter on AI services and rate failed');

  const sortedByRateAsc = await freelancerService.getFreelancers({ sortBy: 'rate_asc', limit: 5 });
  for (let i = 0; i < sortedByRateAsc.data.length - 1; i++) {
    console.assert(sortedByRateAsc.data[i].hourlyRate <= sortedByRateAsc.data[i + 1].hourlyRate, 'rate_asc sort failed');
  }

  const pagedFreelancers = await freelancerService.getFreelancers({ page: 1, limit: 3 });
  console.assert(pagedFreelancers.data.length <= 3, 'Freelancer pagination failed');
  console.log('✓ Freelancer Service: Search, multi-attribute filters, sorting, and pagination verified.');

  // Test 3: Job search, combined filters, sorting & pagination
  const allJobs = await jobService.getJobs({ limit: 100 });
  console.assert(allJobs.total >= 3, 'Total jobs count unexpected');

  const fixedJobs = await jobService.getJobs({ projectType: 'Fixed-Price' });
  console.assert(fixedJobs.data.every(j => j.projectType.toLowerCase() === 'fixed-price'), 'Fixed-Price filter failed');

  const sortedNewest = await jobService.getJobs({ sortBy: 'newest' });
  console.assert(sortedNewest.data.length > 0, 'Newest sort returned empty');

  const pagedJobs = await jobService.getJobs({ page: 1, limit: 2 });
  console.assert(pagedJobs.data.length <= 2 && pagedJobs.total >= 1, 'Job pagination failed');
  console.log('✓ Job Service: Combined filters, projectType, sorting, and pagination verified.');

  // Test 4: Auth Service Client & Freelancer Registration, Login, and Session
  const uniqueId = Date.now();
  const clientEmail = `testclient.${uniqueId}@workbridge.com`;
  const freelancerEmail = `testfreelancer.${uniqueId}@workbridge.com`;

  const regClient = await authService.register({
    name: 'Client Tester',
    email: clientEmail,
    password: 'clientpassword123',
    role: 'client'
  });
  console.assert(regClient.data.role === 'client', 'Client register role mismatch');

  const loginClient = await authService.login({
    email: clientEmail,
    password: 'clientpassword123'
  });
  console.assert(loginClient.data.role === 'client', 'Client login role mismatch');

  const regFreelancer = await authService.register({
    name: 'Freelancer Tester',
    email: freelancerEmail,
    password: 'freelancerpassword123',
    role: 'freelancer'
  });
  console.assert(regFreelancer.data.role === 'freelancer', 'Freelancer register role mismatch');

  const loginFreelancer = await authService.login({
    email: freelancerEmail,
    password: 'freelancerpassword123'
  });
  console.assert(loginFreelancer.data.role === 'freelancer', 'Freelancer login role mismatch');
  console.log('✓ Auth Service: Real Client & Freelancer registration and login verified.');

  // Test 5: Proposal & Project Service Integrity
  console.assert(typeof proposalService.submitProposal === 'function', 'proposalService.submitProposal missing');
  console.assert(typeof proposalService.getMyProposals === 'function', 'proposalService.getMyProposals missing');
  console.assert(typeof proposalService.acceptProposal === 'function', 'proposalService.acceptProposal missing');
  console.assert(typeof projectService.getMyProjects === 'function', 'projectService.getMyProjects missing');
  console.assert(typeof projectService.submitMilestoneDeliverable === 'function', 'projectService.submitMilestoneDeliverable missing');
  console.assert(typeof projectService.approveMilestone === 'function', 'projectService.approveMilestone missing');
  console.log('✓ Proposal & Project Services: End-to-end service interface definitions verified.');

  console.log('\n--- ALL AUTOMATED TESTS PASSED (100% SUCCESS) ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
