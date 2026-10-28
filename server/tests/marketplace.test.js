import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { FreelancerProfile } from '../src/models/FreelancerProfile.js';
import { Job } from '../src/models/Job.js';
import { Proposal } from '../src/models/Proposal.js';
import { Project } from '../src/models/Project.js';

describe('Marketplace Business Features Integration Tests', () => {
  let clientCookie = null;
  let client2Cookie = null;
  let freelancerCookie = null;
  let createdJobId = null;
  let submittedProposalId = null;
  let activatedProjectId = null;
  let testMilestoneId = null;

  before(async () => {
    await connectDB();

    // 1. Register Client 1
    const resClient = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Hiring Client 1',
        email: 'marketplace.client1@example.com',
        password: 'Password123!',
        role: 'client'
      });
    clientCookie = resClient.headers['set-cookie'];

    // 2. Register Client 2 (for unauthorized check tests)
    const resClient2 = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Hiring Client 2',
        email: 'marketplace.client2@example.com',
        password: 'Password123!',
        role: 'client'
      });
    client2Cookie = resClient2.headers['set-cookie'];

    // 3. Register Freelancer
    const resFreelancer = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Marketplace Freelancer',
        email: 'marketplace.freelancer@example.com',
        password: 'Password123!',
        role: 'freelancer'
      });
    freelancerCookie = resFreelancer.headers['set-cookie'];
  });

  after(async () => {
    // Clean up test data
    await User.deleteMany({
      email: {
        $in: [
          'marketplace.client1@example.com',
          'marketplace.client2@example.com',
          'marketplace.freelancer@example.com'
        ]
      }
    });
    if (createdJobId) await Job.findByIdAndDelete(createdJobId);
    if (submittedProposalId) await Proposal.findByIdAndDelete(submittedProposalId);
    if (activatedProjectId) await Project.findByIdAndDelete(activatedProjectId);
    await mongoose.connection.close();
  });

  // --- 1. Freelancer Profile Tests ---
  it('GET /api/freelancers should return paginated freelancer listings', async () => {
    const res = await request(app).get('/api/freelancers');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.meta);
  });

  it('PUT /api/freelancers/profile should reject client access with 403', async () => {
    const res = await request(app)
      .put('/api/freelancers/profile')
      .set('Cookie', clientCookie)
      .send({
        title: 'Unauthorized Client Freelancer',
        category: 'development-it',
        bio: 'This should be blocked because the user is a client account.',
        hourlyRate: 50,
        skills: ['React']
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  it('PUT /api/freelancers/profile should allow freelancer to update their own profile', async () => {
    const res = await request(app)
      .put('/api/freelancers/profile')
      .set('Cookie', freelancerCookie)
      .send({
        title: 'Senior MERN Stack Engineer',
        category: 'development-it',
        bio: 'Over 8 years of experience building scalable Node.js microservices and React web applications.',
        hourlyRate: 85,
        skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Tailwind CSS'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'Remote, US'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Senior MERN Stack Engineer');
    assert.equal(res.body.data.hourlyRate, 85);
  });

  // --- 2. Job Creation & Management Tests ---
  it('POST /api/jobs should reject freelancer attempting to post a job with 403', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Cookie', freelancerCookie)
      .send({
        title: 'Freelancer Cannot Post Job',
        description: 'This must fail authorization because only clients can post jobs.',
        category: 'development-it',
        projectType: 'Fixed-Price',
        budgetMin: 1000,
        skills: ['Node.js']
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  it('POST /api/jobs should allow client to create a new job posting', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Cookie', clientCookie)
      .send({
        title: 'Enterprise Document Q&A Search Engine',
        description: 'We need an experienced developer to implement semantic search with vector embeddings and MongoDB Atlas Vector Search.',
        category: 'ai-services',
        categoryName: 'AI Services',
        projectType: 'Fixed-Price',
        budgetMin: 3000,
        budgetMax: 5000,
        experienceLevel: 'expert',
        skills: ['Python', 'FastAPI', 'MongoDB', 'Vector Search']
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data._id);
    createdJobId = res.body.data._id;
  });

  it('PUT /api/jobs/:id should reject unauthorized client from editing another client job', async () => {
    const res = await request(app)
      .put(`/api/jobs/${createdJobId}`)
      .set('Cookie', client2Cookie)
      .send({
        title: 'Hacked Title by Client 2'
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  it('PUT /api/jobs/:id should allow the job owner client to edit their job', async () => {
    const res = await request(app)
      .put(`/api/jobs/${createdJobId}`)
      .set('Cookie', clientCookie)
      .send({
        budgetMax: 5500
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.budgetMax, 5500);
  });

  // --- 3. Proposal Submission & Review Tests ---
  it('POST /api/proposals should reject client from submitting proposals to jobs', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Cookie', clientCookie)
      .send({
        jobId: createdJobId,
        coverLetter: 'I am a client attempting to submit a proposal which must fail.',
        bidAmount: 4000,
        estimatedDuration: '2 weeks'
      });

    assert.equal(res.status, 403);
  });

  it('POST /api/proposals should allow freelancer to submit proposal for open job', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Cookie', freelancerCookie)
      .send({
        jobId: createdJobId,
        coverLetter: 'I have extensive experience deploying production vector search and RAG workflows on MongoDB Atlas.',
        bidAmount: 4500,
        estimatedDuration: '2 weeks'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data._id);
    submittedProposalId = res.body.data._id;
  });

  it('POST /api/proposals should prevent duplicate proposals from same freelancer for same job', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Cookie', freelancerCookie)
      .send({
        jobId: createdJobId,
        coverLetter: 'Second proposal attempt that must be rejected as duplicate.',
        bidAmount: 4000,
        estimatedDuration: '10 days'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Duplicate') || res.body.message.includes('already submitted'));
  });

  it('GET /api/proposals/job/:jobId should reject non-owner client with 403', async () => {
    const res = await request(app)
      .get(`/api/proposals/job/${createdJobId}`)
      .set('Cookie', client2Cookie);

    assert.equal(res.status, 403);
  });

  it('GET /api/proposals/job/:jobId should allow job owner client to review proposals', async () => {
    const res = await request(app)
      .get(`/api/proposals/job/${createdJobId}`)
      .set('Cookie', clientCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0]._id, submittedProposalId);
  });

  // --- 4. Proposal Acceptance & Project Creation Tests ---
  it('PATCH /api/proposals/:id/accept should accept proposal, update job to in-progress, and create active project', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${submittedProposalId}/accept`)
      .set('Cookie', clientCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.proposal.status, 'accepted');
    assert.ok(res.body.data.project);
    assert.equal(res.body.data.project.status, 'active');
    assert.equal(res.body.data.project.totalAmount, 4500);

    activatedProjectId = res.body.data.project._id;
    testMilestoneId = res.body.data.project.milestones[0]._id;
  });

  // --- 5. Project & Milestone Workflow Tests ---
  it('POST /api/projects/:id/milestones/:mId/deliver should allow assigned freelancer to submit deliverable', async () => {
    const res = await request(app)
      .post(`/api/projects/${activatedProjectId}/milestones/${testMilestoneId}/deliver`)
      .set('Cookie', freelancerCookie)
      .send({
        deliverableNote: 'Vector indexing pipeline and search benchmark completed. Code deployed to staging repository.',
        deliverableUrl: 'https://github.com/example/vector-pipeline'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'milestone_review');
    const milestone = res.body.data.milestones.find(m => m._id.toString() === testMilestoneId.toString());
    assert.equal(milestone.status, 'submitted');
  });

  it('POST /api/projects/:id/milestones/:mId/approve should allow client to approve milestone and complete contract', async () => {
    const res = await request(app)
      .post(`/api/projects/${activatedProjectId}/milestones/${testMilestoneId}/approve`)
      .set('Cookie', clientCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'completed');
    const milestone = res.body.data.milestones.find(m => m._id.toString() === testMilestoneId.toString());
    assert.equal(milestone.status, 'released');
  });

  // --- 6. State-transition guards ---
  it('PATCH /api/proposals/:id/accept should refuse to accept a proposal that is no longer pending', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${submittedProposalId}/accept`)
      .set('Cookie', clientCookie);
    assert.equal(res.status, 400);
  });

  it('PATCH /api/proposals/:id/withdraw should refuse to withdraw an accepted proposal', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${submittedProposalId}/withdraw`)
      .set('Cookie', freelancerCookie);
    assert.equal(res.status, 400);
  });

  it('POST /api/projects/:id/milestones/:mId/approve should refuse to release a milestone twice', async () => {
    const res = await request(app)
      .post(`/api/projects/${activatedProjectId}/milestones/${testMilestoneId}/approve`)
      .set('Cookie', clientCookie);
    assert.equal(res.status, 400);
  });

  it('POST /api/projects/:id/milestones/:mId/deliver should refuse deliverables on a completed project', async () => {
    const res = await request(app)
      .post(`/api/projects/${activatedProjectId}/milestones/${testMilestoneId}/deliver`)
      .set('Cookie', freelancerCookie)
      .send({ deliverableNote: 'Late extra delivery after the contract completed.' });
    assert.equal(res.status, 400);
  });

  it('PUT /api/jobs/:id should lock a job once its contract has completed', async () => {
    const res = await request(app)
      .put(`/api/jobs/${createdJobId}`)
      .set('Cookie', clientCookie)
      .send({ title: 'Trying to edit a finished job posting' });
    assert.equal(res.status, 400);
  });
});
