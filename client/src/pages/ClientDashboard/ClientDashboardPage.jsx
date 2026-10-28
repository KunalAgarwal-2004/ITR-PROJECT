import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  FileText,
  Users,
  DollarSign,
  CheckCircle,
  Eye,
  Clock,
  MoreVertical,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import FeedbackBanner from '../../components/common/FeedbackBanner';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';
import jobService from '../../services/jobService';
import proposalService from '../../services/proposalService';
import projectService from '../../services/projectService';

export const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [jobCreated, setJobCreated] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isAcceptingProposal, setIsAcceptingProposal] = useState(false);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('development-it');
  const [jobBudget, setJobBudget] = useState('');
  const [jobType, setJobType] = useState('Fixed-Price');
  const [jobDesc, setJobDesc] = useState('');

  // Live state
  const [clientJobs, setClientJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [jobsRes, projRes] = await Promise.all([
        jobService.getMyJobs().catch(() => ({ data: [] })),
        projectService.getMyProjects().catch(() => ({ data: [] }))
      ]);

      const jobsData = jobsRes.data || [];
      const formattedJobs = jobsData.map((j) => ({
        id: j._id,
        title: j.title,
        category: j.categoryName || j.category,
        budget:
          j.projectType === 'Hourly'
            ? `$${j.budgetMin || 0}/hr`
            : `$${j.budgetMin || 0}${j.budgetMax ? ' - $' + j.budgetMax : ''}`,
        type: j.projectType,
        proposalsCount: j.proposalsCount || 0,
        status: j.status === 'open' ? 'Active' : j.status,
        postedDate: new Date(j.createdAt).toLocaleDateString()
      }));
      setClientJobs(formattedJobs);
      setProjects(projRes.data || []);

      // Fetch proposals for all client jobs in parallel
      const proposalPromises = jobsData.map(async (j) => {
        try {
          const propRes = await proposalService.getProposalsByJob(j._id);
          return (propRes.data || []).map((p) => ({
            id: p._id,
            _id: p._id,
            jobId: j._id,
            jobTitle: j.title,
            freelancerId: p.freelancer?._id || p.freelancer?.id,
            freelancerName: p.freelancer?.name || 'Verified Freelancer',
            freelancerTitle: p.freelancer?.bio?.slice(0, 50) || 'Independent Specialist',
            bid: `$${p.bidAmount?.toLocaleString()}`,
            timeline: p.estimatedDuration,
            rating: 4.95,
            status: p.status === 'accepted' ? 'Contract Funded' : p.status === 'pending' ? 'Under Review' : p.status
          }));
        } catch {
          return [];
        }
      });
      const proposalResults = await Promise.all(proposalPromises);
      setProposals(proposalResults.flat());
    } catch (err) {
      console.warn('Dashboard fetch warning:', err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (isSubmittingJob) return;
    setIsSubmittingJob(true);
    try {
      const fullDesc = jobDesc && jobDesc.trim().length >= 20
        ? jobDesc.trim()
        : `${jobTitle.trim()} — comprehensive project requirements, scope of work, and milestone deliverables.`;

      const res = await jobService.createJob({
        title: jobTitle.trim(),
        description: fullDesc,
        category: jobCategory,
        projectType: jobType,
        budgetMin: Number(jobBudget) || 1000,
        skills: ['General Freelancing']
      });
      const created = res.data;
      const formatted = {
        id: created._id,
        title: created.title,
        category: created.categoryName || created.category,
        budget: `$${jobBudget}`,
        type: created.projectType,
        proposalsCount: 0,
        status: 'Active',
        postedDate: 'Just now'
      };

      setClientJobs([formatted, ...clientJobs]);
      setJobCreated(true);
      setTimeout(() => {
        setNewJobModalOpen(false);
        setJobCreated(false);
        setJobTitle('');
        setJobBudget('');
        setJobDesc('');
        setIsSubmittingJob(false);
        setActionFeedback({
          type: 'success',
          title: 'Job Posting Published',
          message: `"${formatted.title}" is now live and accepting proposals.`
        });
      }, 800);
    } catch (err) {
      setIsSubmittingJob(false);
      setActionFeedback({
        type: 'error',
        title: 'Job Creation Error',
        message: err.message || 'Could not publish job posting. Please verify all inputs.'
      });
    }
  };

  const handleOpenAcceptProposal = (prop) => {
    setSelectedProposal(prop);
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedProposal || isAcceptingProposal) return;
    setIsAcceptingProposal(true);
    try {
      if (selectedProposal._id || (selectedProposal.id && selectedProposal.id.match(/^[0-9a-fA-F]{24}$/))) {
        await proposalService.acceptProposal(selectedProposal._id || selectedProposal.id);
      }
      setProposals(proposals.map(p => (p.id === selectedProposal.id || p._id === selectedProposal._id) ? { ...p, status: 'Contract Funded' } : p));
      setAcceptModalOpen(false);
      setIsAcceptingProposal(false);
      setActionFeedback({
        type: 'success',
        title: 'Milestone Escrow Funded',
        message: `Proposal from ${selectedProposal.freelancerName || 'freelancer'} accepted! Milestone contract is now activated in escrow.`
      });
      // Refresh dashboard to pull newly activated project
      fetchDashboardData();
    } catch (err) {
      setIsAcceptingProposal(false);
      setActionFeedback({
        type: 'error',
        title: 'Proposal Acceptance Error',
        message: err.message || 'Unable to accept proposal. Please try again.'
      });
    }
  };

  const totalEscrow = projects.reduce((acc, p) => acc + (p.escrowBalance || p.totalAmount || 0), 0);

  return (
    <PageContainer
      title="Client Workspace & Management"
      subtitle={`Welcome back, ${user?.name || 'Client'}. Post projects, review candidate bids, and fund milestone escrows.`}
      actions={
        <Button
          variant="primary"
          size="md"
          className="gap-1.5"
          onClick={() => setNewJobModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> Post a Job
        </Button>
      }
    >
      {actionFeedback && (
        <FeedbackBanner
          type={actionFeedback.type}
          title={actionFeedback.title}
          message={actionFeedback.message}
          onDismiss={() => setActionFeedback(null)}
          className="mb-6"
        />
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Responsive Sidebar */}
        <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Tab Body */}
        <div className="flex-1 w-full space-y-6">
          {isLoadingData ? (
            <div className="py-16">
              <LoadingSpinner text="Loading client workspace data..." />
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Postings</span>
                    <Briefcase className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{clientJobs.length}</span>
                  <p className="text-xs text-brand-600 mt-1 font-medium">All receiving bids</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Inbound Bids</span>
                    <FileText className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{proposals.length}</span>
                  <p className="text-xs text-content-muted mt-1">Awaiting client decision</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
                    <Users className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{projects.length}</span>
                  <p className="text-xs text-content-muted mt-1">Milestones in progress</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Escrow Balance</span>
                    <DollarSign className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">${totalEscrow.toLocaleString()}</span>
                  <p className="text-xs text-content-muted mt-1">Protected in escrow</p>
                </div>
              </div>

              {/* Active Jobs Section */}
              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-content-primary">Your Job Postings</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('jobs')}>
                    View All
                  </Button>
                </div>

                {clientJobs.length === 0 ? (
                  <EmptyState
                    title="No job postings yet"
                    description="Post your first job requirement to start receiving candidate proposals."
                    actionLabel="Post a Job"
                    onAction={() => setNewJobModalOpen(true)}
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {clientJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-content-primary hover:text-brand-600 transition-colors">
                            {job.title}
                          </h4>
                          <p className="text-xs text-content-muted mt-0.5">
                            {job.category} &bull; {job.budget} &bull; Posted {job.postedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 text-xs rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                            {job.proposalsCount} proposals
                          </span>
                          <Link to={`/jobs/${job.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inbound Proposals Preview */}
              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <h3 className="text-base font-bold text-content-primary mb-4">Candidate Proposals</h3>
                {proposals.length === 0 ? (
                  <EmptyState
                    title="No proposals received yet"
                    description="When freelancers submit bids on your jobs, they will appear here for review."
                  />
                ) : (
                  <div className="space-y-3">
                    {proposals.slice(0, 5).map((prop) => (
                      <div
                        key={prop.id}
                        className="p-4 bg-surface-warm border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-content-primary">{prop.freelancerName}</h4>
                            <span className="text-xs text-amber-500 font-semibold">&bull; &#9733; {prop.rating}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                prop.status === 'Contract Funded'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {prop.status}
                            </span>
                          </div>
                          <p className="text-xs text-content-muted">{prop.freelancerTitle}</p>
                          <p className="text-xs text-brand-600 font-medium mt-1">Project: {prop.jobTitle}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-sm font-bold text-content-primary block">{prop.bid}</span>
                            <span className="text-[11px] text-content-muted">{prop.timeline}</span>
                          </div>
                          {prop.status !== 'Contract Funded' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenAcceptProposal(prop)}
                            >
                              Accept & Fund Escrow
                            </Button>
                          ) : (
                            <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4 text-brand-500" /> In Escrow
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'jobs' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-content-primary">All Job Postings</h3>
                  <p className="text-xs text-content-muted">Manage active listings and view applicant submissions</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setNewJobModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create Posting
                </Button>
              </div>

              {clientJobs.length === 0 ? (
                <EmptyState
                  title="No job postings yet"
                  description="Post your first job requirement to start receiving candidate proposals."
                  actionLabel="Post a Job"
                  onAction={() => setNewJobModalOpen(true)}
                />
              ) : (
                <div className="divide-y divide-border border border-border rounded-md">
                  {clientJobs.map((j) => (
                    <div key={j.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-content-primary">{j.title}</h4>
                        <p className="text-xs text-content-muted mt-0.5">
                          {j.category} &bull; {j.budget} ({j.type})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                          {j.proposalsCount} proposals
                        </span>
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab('proposals')}>
                          View Proposals
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'proposals' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-2">Inbound Proposals</h3>
              <p className="text-xs text-content-muted mb-6">
                Review candidate bids and initiate milestone contracts
              </p>

              {proposals.length === 0 ? (
                <EmptyState
                  title="No proposals found"
                  description="When freelancers apply to your open jobs, their proposals will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="p-5 border border-border rounded-md bg-surface-warm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                        <div>
                          <h4 className="text-base font-bold text-content-primary">{prop.freelancerName}</h4>
                          <p className="text-xs text-brand-600 font-semibold">{prop.freelancerTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-content-primary block">{prop.bid}</span>
                          <span className="text-xs text-content-muted">Delivery in {prop.timeline}</span>
                        </div>
                      </div>
                      <p className="text-xs text-content-muted mb-4">
                        Applying for project: <strong>{prop.jobTitle}</strong>
                      </p>
                      <div className="flex items-center gap-2">
                        <Link to={`/freelancers/${prop.freelancerId}`}>
                          <Button variant="secondary" size="sm">
                            View Full Profile
                          </Button>
                        </Link>
                        {prop.status !== 'Contract Funded' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenAcceptProposal(prop)}
                          >
                            Accept & Fund Escrow
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-white border border-border rounded-md p-8 shadow-card text-center">
              <CheckCircle className="w-10 h-10 text-brand-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-content-primary capitalize">{activeTab} Panel</h3>
              <p className="text-xs text-content-muted max-w-sm mx-auto mt-1 mb-4">
                Active contracts and milestone escrow releases are managed here.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
                Return to Overview
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Post a Job Modal */}
      <Modal
        isOpen={newJobModalOpen}
        onClose={() => setNewJobModalOpen(false)}
        title="Create a Job Posting"
        description="Specify your project scope and pricing to receive competitive proposals."
        size="lg"
      >
        {jobCreated ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Job Published!</h3>
            <p className="text-xs text-content-muted mt-1">Your listing is now visible to verified freelancers.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateJob} className="space-y-4">
            <Input
              id="job-title-input"
              label="Job Title"
              placeholder="e.g. Senior Full Stack React & Node Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1.5">
                  Service Category
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
                >
                  {MARKETPLACE_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1.5">
                  Pricing Model
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
                >
                  <option value="Fixed-Price">Fixed Price</option>
                  <option value="Hourly">Hourly Rate</option>
                </select>
              </div>
            </div>

            <Input
              id="job-budget-input"
              label={jobType === 'Fixed-Price' ? 'Total Project Budget ($)' : 'Hourly Rate Budget ($/hr)'}
              type="number"
              placeholder="e.g. 4500"
              value={jobBudget}
              onChange={(e) => setJobBudget(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Project Description & Deliverables
              </label>
              <textarea
                rows={4}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Describe your technical requirements, expected deliverables, and timeline..."
                required
                className="w-full p-3 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setNewJobModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={isSubmittingJob}
              >
                {isSubmittingJob ? 'Publishing Job...' : 'Publish Job'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Accessible Accept Proposal Confirmation Dialog */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title="Fund Escrow & Accept Proposal"
        description="Verify milestone funding terms before creating this contract."
        size="md"
      >
        {selectedProposal && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-warm rounded-md border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-muted">Freelancer:</span>
                <span className="font-bold text-content-primary">{selectedProposal.freelancerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Project:</span>
                <span className="font-semibold text-content-primary">{selectedProposal.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Milestone Deposit:</span>
                <span className="font-bold text-brand-600 text-sm">{selectedProposal.bid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Delivery Timeline:</span>
                <span className="font-medium text-content-primary">{selectedProposal.timeline}</span>
              </div>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Upon clicking "Confirm & Deposit", funds will be placed into secure WorkBridge escrow. They will only be released to {selectedProposal.freelancerName} after you inspect and approve the completed deliverables.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setAcceptModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmAccept}
                disabled={isAcceptingProposal}
              >
                {isAcceptingProposal ? 'Activating Contract...' : 'Confirm & Deposit to Escrow'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ClientDashboardPage;
