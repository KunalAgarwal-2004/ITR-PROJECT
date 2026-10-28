import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  FileText,
  Users,
  IndianRupee,
  Eye,
  Pencil,
  ShieldCheck,
  AlertCircle,
  ExternalLink
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
import { formatBudget, formatCurrency, formatDate, formatLabel, toINR, toUSD } from '../../utils/formatters';

const EMPTY_JOB_FORM = {
  title: '',
  category: 'development-it',
  projectType: 'Fixed-Price',
  budgetMin: '',
  budgetMax: '',
  experienceLevel: 'intermediate',
  skills: '',
  description: ''
};

const STATUS_BADGE = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  milestone_review: 'bg-amber-50 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-content-muted border-border'
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
      STATUS_BADGE[status] || 'bg-gray-100 text-content-muted border-border'
    }`}
  >
    {formatLabel(status)}
  </span>
);

export const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [busyAction, setBusyAction] = useState(null); // id of the row whose action is running

  // Create / edit job modal (editingJobId === null means "create")
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [jobFormError, setJobFormError] = useState('');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Accept proposal confirmation
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isAcceptingProposal, setIsAcceptingProposal] = useState(false);

  // Proposals tab can be narrowed to a single job via "View Proposals"
  const [proposalJobFilter, setProposalJobFilter] = useState(null);

  // Live data (raw API documents; amounts are USD and formatted at render time)
  const [clientJobs, setClientJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setLoadError('');
    try {
      const [jobsRes, projRes] = await Promise.all([jobService.getMyJobs(), projectService.getMyProjects()]);

      const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
      setClientJobs(jobsData);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);

      // Proposals are fetched per job; one failing job shouldn't hide the others
      const proposalResults = await Promise.all(
        jobsData.map(async (j) => {
          try {
            const propRes = await proposalService.getProposalsByJob(j._id);
            return (Array.isArray(propRes.data) ? propRes.data : []).map((p) => ({ ...p, jobRef: j }));
          } catch {
            return [];
          }
        })
      );
      setProposals(proposalResults.flat());
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
      setLoadError(err.message || 'Unable to load your workspace data.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Marketing "Post a Job" links land here with ?post=1: open the create form directly
  useEffect(() => {
    if (searchParams.get('post') === '1') {
      openCreateJob();
      searchParams.delete('post');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = (title, err) =>
    setActionFeedback({ type: 'error', title, message: err?.message || 'Something went wrong. Please try again.' });

  // ---------- Job create / edit / close ----------

  const openCreateJob = () => {
    setEditingJobId(null);
    setJobForm(EMPTY_JOB_FORM);
    setJobFormError('');
    setJobModalOpen(true);
  };

  const openEditJob = (job) => {
    setEditingJobId(job._id);
    setJobForm({
      title: job.title || '',
      category: job.category || 'development-it',
      projectType: job.projectType || 'Fixed-Price',
      budgetMin: job.budgetMin != null ? String(toINR(job.budgetMin)) : '',
      budgetMax: job.budgetMax != null ? String(toINR(job.budgetMax)) : '',
      experienceLevel: job.experienceLevel || 'intermediate',
      skills: (job.skills || []).join(', '),
      description: job.description || ''
    });
    setJobFormError('');
    setJobModalOpen(true);
  };

  const updateJobForm = (field) => (e) => setJobForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (isSubmittingJob) return;

    const skills = jobForm.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const budgetMin = Number(jobForm.budgetMin);
    const budgetMax = jobForm.budgetMax === '' ? null : Number(jobForm.budgetMax);

    // Mirror the server's validation rules so users get specific messages
    if (jobForm.title.trim().length < 5) return setJobFormError('Job title must be at least 5 characters.');
    if (jobForm.description.trim().length < 20)
      return setJobFormError('Description must be at least 20 characters so freelancers understand the scope.');
    if (skills.length === 0) return setJobFormError('Add at least one required skill (comma separated).');
    if (!(budgetMin > 0)) return setJobFormError('Enter a budget greater than ₹0.');
    if (budgetMax != null && !(budgetMax >= budgetMin))
      return setJobFormError('Maximum budget must be greater than or equal to the minimum budget.');

    const payload = {
      title: jobForm.title.trim(),
      description: jobForm.description.trim(),
      category: jobForm.category,
      projectType: jobForm.projectType,
      // Amounts are typed in rupees; the API stores USD
      budgetMin: toUSD(budgetMin),
      ...(budgetMax != null ? { budgetMax: toUSD(budgetMax) } : {}),
      experienceLevel: jobForm.experienceLevel,
      skills
    };

    setJobFormError('');
    setIsSubmittingJob(true);
    try {
      if (editingJobId) {
        await jobService.updateJob(editingJobId, payload);
      } else {
        await jobService.createJob(payload);
      }
      setJobModalOpen(false);
      setActionFeedback({
        type: 'success',
        title: editingJobId ? 'Job Posting Updated' : 'Job Posting Published',
        message: editingJobId
          ? `"${payload.title}" has been updated.`
          : `"${payload.title}" is now live and accepting proposals.`
      });
      fetchDashboardData();
    } catch (err) {
      setJobFormError(err.message || 'Could not save the job posting. Please verify all inputs.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Closing a posting uses the API's "cancelled" status; it can be re-opened while no contract exists
  const handleSetJobStatus = async (job, status) => {
    setBusyAction(job._id);
    try {
      await jobService.updateJob(job._id, { status });
      setClientJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status } : j)));
      setActionFeedback({
        type: 'success',
        title: status === 'open' ? 'Job Re-opened' : 'Job Closed',
        message:
          status === 'open'
            ? `"${job.title}" is accepting proposals again.`
            : `"${job.title}" is closed and no longer accepts proposals.`
      });
    } catch (err) {
      showError('Job Update Error', err);
    } finally {
      setBusyAction(null);
    }
  };

  // ---------- Proposals ----------

  const handleOpenAcceptProposal = (prop) => {
    setSelectedProposal(prop);
    setAcceptModalOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedProposal || isAcceptingProposal) return;
    setIsAcceptingProposal(true);
    try {
      await proposalService.acceptProposal(selectedProposal._id);
      setAcceptModalOpen(false);
      setActionFeedback({
        type: 'success',
        title: 'Contract Started',
        message: `Proposal from ${selectedProposal.freelancer?.name || 'the freelancer'} accepted. The contract is now active under Contracts.`
      });
      // Accepting rejects the job's other pending bids and creates a project: reload everything
      fetchDashboardData();
    } catch (err) {
      showError('Proposal Acceptance Error', err);
    } finally {
      setIsAcceptingProposal(false);
    }
  };

  const handleRejectProposal = async (prop) => {
    setBusyAction(prop._id);
    try {
      await proposalService.rejectProposal(prop._id);
      setProposals((prev) => prev.map((p) => (p._id === prop._id ? { ...p, status: 'rejected' } : p)));
      setActionFeedback({
        type: 'info',
        title: 'Proposal Declined',
        message: `The proposal from ${prop.freelancer?.name || 'the freelancer'} was declined.`
      });
    } catch (err) {
      showError('Proposal Rejection Error', err);
    } finally {
      setBusyAction(null);
    }
  };

  // ---------- Contracts / milestones ----------

  const handleApproveMilestone = async (project, milestone) => {
    setBusyAction(milestone._id);
    try {
      await projectService.approveMilestone(project._id, milestone._id);
      setActionFeedback({
        type: 'success',
        title: 'Milestone Approved',
        message: `${formatCurrency(milestone.amount)} has been released to ${project.freelancer?.name || 'the freelancer'}.`
      });
      fetchDashboardData();
    } catch (err) {
      showError('Milestone Approval Error', err);
    } finally {
      setBusyAction(null);
    }
  };

  // ---------- Derived values ----------

  const openJobs = clientJobs.filter((j) => j.status === 'open');
  const pendingProposals = proposals.filter((p) => p.status === 'pending');
  const activeProjects = projects.filter((p) => ['active', 'milestone_review'].includes(p.status));
  const reviewCount = projects.reduce(
    (acc, p) => acc + (p.milestones || []).filter((m) => m.status === 'submitted').length,
    0
  );
  const totalEscrow = activeProjects.reduce((acc, p) => acc + (p.escrowAmount || 0), 0);
  const visibleProposals = proposalJobFilter
    ? proposals.filter((p) => p.jobRef?._id === proposalJobFilter)
    : proposals;

  const jobBudgetLabel = (j) => formatBudget(j.budgetMin, j.budgetMax, j.projectType === 'Hourly');

  // A proposal can only be acted on while it is pending and its job is still open
  const canDecide = (prop) => prop.status === 'pending' && prop.jobRef?.status === 'open';

  const renderProposalActions = (prop, compact = false) =>
    canDecide(prop) ? (
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleRejectProposal(prop)}
          disabled={busyAction === prop._id}
        >
          {busyAction === prop._id ? 'Declining...' : 'Decline'}
        </Button>
        <Button variant="primary" size="sm" onClick={() => handleOpenAcceptProposal(prop)}>
          {compact ? 'Accept' : 'Accept & Start Contract'}
        </Button>
      </div>
    ) : prop.status === 'accepted' ? (
      <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
        <ShieldCheck className="w-4 h-4 text-brand-500" /> Hired
      </span>
    ) : (
      <StatusBadge status={prop.status} />
    );

  const renderProposalCard = (prop) => (
    <div key={prop._id} className="p-5 border border-border rounded-md bg-surface-warm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-content-primary">{prop.freelancer?.name || 'Freelancer'}</h4>
            {prop.freelancerProfile?.rating > 0 && (
              <span className="text-xs text-amber-500 font-semibold">&#9733; {prop.freelancerProfile.rating}</span>
            )}
            <StatusBadge status={prop.status} />
          </div>
          <p className="text-xs text-brand-600 font-semibold">
            {prop.freelancerProfile?.title || 'Independent Specialist'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-base font-bold text-content-primary block">
            {formatCurrency(prop.bidAmount)}
            {prop.jobRef?.projectType === 'Hourly' ? '/hr' : ''}
          </span>
          <span className="text-xs text-content-muted">Delivery in {prop.estimatedDuration}</span>
        </div>
      </div>
      <p className="text-xs text-content-muted mb-2">
        Applying for project: <strong>{prop.jobRef?.title}</strong>
      </p>
      {prop.coverLetter && (
        <p className="text-xs text-content-primary leading-relaxed mb-4 whitespace-pre-line">{prop.coverLetter}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {prop.freelancer?._id && (
          <Link to={`/freelancers/${prop.freelancer._id}`}>
            <Button variant="secondary" size="sm">
              View Full Profile
            </Button>
          </Link>
        )}
        {renderProposalActions(prop)}
      </div>
    </div>
  );

  return (
    <PageContainer
      title="Client Workspace & Management"
      subtitle={`Welcome back, ${user?.name || 'Client'}. Post projects, review candidate bids, and approve milestone deliveries.`}
      actions={
        <Button variant="primary" size="md" className="gap-1.5" onClick={openCreateJob}>
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

      {loadError && (
        <div role="alert" className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {loadError}
          </span>
          <Button variant="ghost" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

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
                    <span className="text-xs font-semibold uppercase tracking-wider">Open Postings</span>
                    <Briefcase className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{openJobs.length}</span>
                  <p className="text-xs text-content-muted mt-1">{clientJobs.length} posted in total</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Bids</span>
                    <FileText className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{pendingProposals.length}</span>
                  <p className="text-xs text-content-muted mt-1">Awaiting your decision</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
                    <Users className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{activeProjects.length}</span>
                  <p className="text-xs text-content-muted mt-1">
                    {reviewCount > 0 ? `${reviewCount} delivery awaiting review` : 'Milestones in progress'}
                  </p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Escrow Balance</span>
                    <IndianRupee className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{formatCurrency(totalEscrow)}</span>
                  <p className="text-xs text-content-muted mt-1">Held for active contracts</p>
                </div>
              </div>

              {reviewCount > 0 && (
                <FeedbackBanner
                  type="info"
                  title="Deliverables awaiting your review"
                  message={`You have ${reviewCount} submitted milestone(s). Review and release payment from the Contracts tab.`}
                />
              )}

              {/* Job postings preview */}
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
                    onAction={openCreateJob}
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {clientJobs.slice(0, 3).map((job) => (
                      <div
                        key={job._id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-content-primary">{job.title}</h4>
                          <p className="text-xs text-content-muted mt-0.5">
                            {job.categoryName || job.category} &bull; {jobBudgetLabel(job)} &bull; Posted{' '}
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={job.status} />
                          <span className="px-2.5 py-1 text-xs rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                            {job.proposalsCount || 0} proposals
                          </span>
                          <Link to={`/jobs/${job._id}`}>
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

              {/* Pending proposals preview */}
              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <h3 className="text-base font-bold text-content-primary mb-4">Proposals Awaiting Review</h3>
                {pendingProposals.length === 0 ? (
                  <EmptyState
                    title="No pending proposals"
                    description="When freelancers submit bids on your open jobs, they will appear here for review."
                  />
                ) : (
                  <div className="space-y-3">
                    {pendingProposals.slice(0, 5).map((prop) => (
                      <div
                        key={prop._id}
                        className="p-4 bg-surface-warm border border-border rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-content-primary">{prop.freelancer?.name || 'Freelancer'}</h4>
                          <p className="text-xs text-brand-600 font-medium mt-1">Project: {prop.jobRef?.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-sm font-bold text-content-primary block">
                              {formatCurrency(prop.bidAmount)}
                            </span>
                            <span className="text-[11px] text-content-muted">{prop.estimatedDuration}</span>
                          </div>
                          {renderProposalActions(prop, true)}
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
                  <p className="text-xs text-content-muted">Edit, close, or re-open listings and review applicants</p>
                </div>
                <Button variant="primary" size="sm" onClick={openCreateJob}>
                  <Plus className="w-4 h-4 mr-1" /> Create Posting
                </Button>
              </div>

              {clientJobs.length === 0 ? (
                <EmptyState
                  title="No job postings yet"
                  description="Post your first job requirement to start receiving candidate proposals."
                  actionLabel="Post a Job"
                  onAction={openCreateJob}
                />
              ) : (
                <div className="divide-y divide-border border border-border rounded-md">
                  {clientJobs.map((j) => {
                    const editable = ['open', 'cancelled'].includes(j.status);
                    return (
                      <div key={j._id} className="p-4 flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-content-primary">{j.title}</h4>
                            <StatusBadge status={j.status === 'cancelled' ? 'closed' : j.status} />
                          </div>
                          <p className="text-xs text-content-muted mt-0.5">
                            {j.categoryName || j.category} &bull; {jobBudgetLabel(j)} ({j.projectType}) &bull;{' '}
                            {j.proposalsCount || 0} proposals
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setProposalJobFilter(j._id);
                              setActiveTab('proposals');
                            }}
                          >
                            View Proposals
                          </Button>
                          {editable && (
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEditJob(j)}>
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                          )}
                          {j.status === 'open' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetJobStatus(j, 'cancelled')}
                              disabled={busyAction === j._id}
                            >
                              {busyAction === j._id ? 'Closing...' : 'Close Job'}
                            </Button>
                          )}
                          {j.status === 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetJobStatus(j, 'open')}
                              disabled={busyAction === j._id}
                            >
                              {busyAction === j._id ? 'Re-opening...' : 'Re-open'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'proposals' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-content-primary">Inbound Proposals</h3>
                  <p className="text-xs text-content-muted">Review candidate bids and start milestone contracts</p>
                </div>
                {proposalJobFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setProposalJobFilter(null)}>
                    Show proposals for all jobs
                  </Button>
                )}
              </div>

              {visibleProposals.length === 0 ? (
                <EmptyState
                  title="No proposals found"
                  description="When freelancers apply to your open jobs, their proposals will appear here."
                />
              ) : (
                <div className="space-y-4">{visibleProposals.map(renderProposalCard)}</div>
              )}
            </div>
          ) : activeTab === 'contracts' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-1">Contracts & Milestones</h3>
              <p className="text-xs text-content-muted mb-6">
                Review submitted deliverables and release escrow payments to your freelancers
              </p>

              {projects.length === 0 ? (
                <EmptyState
                  title="No contracts yet"
                  description="Accept a proposal to start a contract. It will appear here with its milestones."
                />
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} className="border border-border rounded-md overflow-hidden">
                      <div className="p-4 bg-surface-warm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-content-primary">{project.title}</h4>
                            <StatusBadge status={project.status} />
                          </div>
                          <p className="text-xs text-content-muted mt-0.5">
                            Freelancer: {project.freelancer?.name || 'Freelancer'} &bull; Started{' '}
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="block font-bold text-content-primary text-sm">
                            {formatCurrency(project.totalAmount)}
                          </span>
                          <span className="text-content-muted">In escrow: {formatCurrency(project.escrowAmount)}</span>
                        </div>
                      </div>

                      <div className="divide-y divide-border">
                        {(project.milestones || []).map((m) => (
                          <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-content-primary">{m.title}</span>
                                <StatusBadge status={m.status} />
                              </div>
                              <p className="text-xs text-content-muted">
                                {formatCurrency(m.amount)}
                                {m.dueDate ? ` • Due ${formatDate(m.dueDate)}` : ''}
                                {m.releasedAt ? ` • Released ${formatDate(m.releasedAt)}` : ''}
                              </p>
                              {m.deliverableNote && (
                                <p className="text-xs text-content-primary bg-surface-warm border border-border rounded-md p-2 whitespace-pre-line">
                                  {m.deliverableNote}
                                </p>
                              )}
                              {m.deliverableUrl && (
                                <a
                                  href={m.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open deliverable
                                </a>
                              )}
                            </div>
                            {m.status === 'submitted' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApproveMilestone(project, m)}
                                disabled={busyAction === m._id}
                              >
                                {busyAction === m._id ? 'Releasing...' : 'Approve & Release Payment'}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-1">Account Settings</h3>
              <p className="text-xs text-content-muted mb-6">Your client account details</p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-content-muted uppercase">Name</dt>
                  <dd className="font-semibold text-content-primary">{user?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted uppercase">Email</dt>
                  <dd className="font-semibold text-content-primary">{user?.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted uppercase">Account Type</dt>
                  <dd className="font-semibold text-content-primary">{formatLabel(user?.role)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted uppercase">Currency</dt>
                  <dd className="font-semibold text-content-primary">Indian Rupee (₹)</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title={editingJobId ? 'Edit Job Posting' : 'Create a Job Posting'}
        description="Specify your project scope and pricing to receive competitive proposals."
        size="lg"
      >
        <form onSubmit={handleSubmitJob} className="space-y-4">
          {jobFormError && (
            <div role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{jobFormError}</span>
            </div>
          )}

          <Input
            id="job-title-input"
            label="Job Title"
            placeholder="e.g. Senior Full Stack React & Node Engineer"
            value={jobForm.title}
            onChange={updateJobForm('title')}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">Service Category</label>
              <select
                value={jobForm.category}
                onChange={updateJobForm('category')}
                className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
              >
                {MARKETPLACE_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">Pricing Model</label>
              <select
                value={jobForm.projectType}
                onChange={updateJobForm('projectType')}
                className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
              >
                <option value="Fixed-Price">Fixed Price</option>
                <option value="Hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">Experience Level</label>
              <select
                value={jobForm.experienceLevel}
                onChange={updateJobForm('experienceLevel')}
                className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="job-budget-min-input"
              label={jobForm.projectType === 'Fixed-Price' ? 'Minimum Budget (₹)' : 'Minimum Hourly Rate (₹/hr)'}
              type="number"
              min="1"
              placeholder={jobForm.projectType === 'Fixed-Price' ? 'e.g. 250000' : 'e.g. 2500'}
              value={jobForm.budgetMin}
              onChange={updateJobForm('budgetMin')}
              required
            />
            <Input
              id="job-budget-max-input"
              label={jobForm.projectType === 'Fixed-Price' ? 'Maximum Budget (₹, optional)' : 'Maximum Hourly Rate (₹/hr, optional)'}
              type="number"
              min="1"
              placeholder={jobForm.projectType === 'Fixed-Price' ? 'e.g. 400000' : 'e.g. 4000'}
              value={jobForm.budgetMax}
              onChange={updateJobForm('budgetMax')}
            />
          </div>

          <Input
            id="job-skills-input"
            label="Required Skills"
            placeholder="e.g. React, Node.js, MongoDB"
            helperText="Separate skills with commas"
            value={jobForm.skills}
            onChange={updateJobForm('skills')}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1.5">
              Project Description & Deliverables
            </label>
            <textarea
              rows={4}
              value={jobForm.description}
              onChange={updateJobForm('description')}
              placeholder="Describe your technical requirements, expected deliverables, and timeline (at least 20 characters)..."
              required
              className="w-full p-3 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" fullWidth onClick={() => setJobModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmittingJob}>
              {isSubmittingJob ? 'Saving...' : editingJobId ? 'Save Changes' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Accept Proposal Confirmation */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title="Accept Proposal & Start Contract"
        description="Verify the contract terms before hiring this freelancer."
        size="md"
      >
        {selectedProposal && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-warm rounded-md border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-muted">Freelancer:</span>
                <span className="font-bold text-content-primary">{selectedProposal.freelancer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Project:</span>
                <span className="font-semibold text-content-primary">{selectedProposal.jobRef?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Contract Amount:</span>
                <span className="font-bold text-brand-600 text-sm">{formatCurrency(selectedProposal.bidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Delivery Timeline:</span>
                <span className="font-medium text-content-primary">{selectedProposal.estimatedDuration}</span>
              </div>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Accepting creates a contract held in WorkBridge escrow and declines the other pending proposals for this job.
              Funds are only released to {selectedProposal.freelancer?.name || 'the freelancer'} after you approve the
              delivered work.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="secondary" size="md" fullWidth onClick={() => setAcceptModalOpen(false)}>
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
                {isAcceptingProposal ? 'Starting Contract...' : 'Confirm & Hire'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ClientDashboardPage;
