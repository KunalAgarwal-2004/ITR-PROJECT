import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  IndianRupee,
  Star,
  Search,
  ExternalLink,
  Upload,
  AlertCircle,
  Trash2,
  Plus
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
import proposalService from '../../services/proposalService';
import projectService from '../../services/projectService';
import freelancerService from '../../services/freelancerService';
import { formatCurrency, formatDate, formatLabel, toINR, toUSD } from '../../utils/formatters';

// Server-side limits (USD) for hourly rates and deliverable notes
const MIN_RATE_USD = 5;
const MAX_RATE_USD = 1000;
const MIN_DELIVERABLE_NOTE = 10;
const MIN_BIO = 20;

const STATUS_BADGE = {
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-content-muted border-border',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  milestone_review: 'bg-amber-50 text-amber-700 border-amber-200',
  submitted: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-content-muted border-border'
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${
      STATUS_BADGE[status] || 'bg-gray-100 text-content-muted border-border'
    }`}
  >
    {formatLabel(status === 'pending' ? 'under_review' : status)}
  </span>
);

const PROFILE_FORM_FROM = (profile) => ({
  title: profile?.title || '',
  category: profile?.category || 'development-it',
  bio: profile?.bio || '',
  hourlyRate: profile?.hourlyRate != null ? String(toINR(profile.hourlyRate)) : '',
  skills: (profile?.skills || []).join(', '),
  experienceLevel: profile?.experienceLevel || 'intermediate',
  availability: profile?.availability || 'contract',
  location: profile?.location || ''
});

const portfolioPayload = (items = []) =>
  items.map(({ title, description, link, imageUrl }) => ({
    title,
    ...(description ? { description } : {}),
    ...(link ? { link } : {}),
    ...(imageUrl ? { imageUrl } : {})
  }));

// A milestone can receive work while the contract is running and it hasn't been delivered yet
const canDeliver = (project, milestone) =>
  ['active', 'milestone_review'].includes(project.status) && ['pending', 'in_progress'].includes(milestone.status);

export const FreelancerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [busyAction, setBusyAction] = useState(null);

  // Live data (amounts in USD, formatted to INR at render time)
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState(null);

  // Deliverable modal
  const [deliverTarget, setDeliverTarget] = useState(null); // { project, milestone }
  const [deliverNotes, setDeliverNotes] = useState('');
  const [deliverLink, setDeliverLink] = useState('');
  const [deliverError, setDeliverError] = useState('');
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);

  // Profile editor (Settings tab) and portfolio form
  const [profileForm, setProfileForm] = useState(PROFILE_FORM_FROM(null));
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', link: '' });
  const [portfolioError, setPortfolioError] = useState('');

  const fetchFreelancerData = async () => {
    setIsLoadingData(true);
    setLoadError('');
    try {
      const [propRes, projRes, profileRes] = await Promise.all([
        proposalService.getMyProposals(),
        projectService.getMyProjects(),
        freelancerService.getMyProfile()
      ]);
      setProposals(Array.isArray(propRes.data) ? propRes.data : []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setProfile(profileRes.data || null);
      setProfileForm(PROFILE_FORM_FROM(profileRes.data));
    } catch (err) {
      console.warn('Freelancer dashboard fetch error:', err.message);
      setLoadError(err.message || 'Unable to load your workspace data.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchFreelancerData();
  }, []);

  const showError = (title, err) =>
    setActionFeedback({ type: 'error', title, message: err?.message || 'Something went wrong. Please try again.' });

  // ---------- Proposals ----------

  const handleWithdrawProposal = async (prop) => {
    setBusyAction(prop._id);
    try {
      await proposalService.withdrawProposal(prop._id);
      setProposals((prev) => prev.map((p) => (p._id === prop._id ? { ...p, status: 'withdrawn' } : p)));
      setActionFeedback({
        type: 'info',
        title: 'Proposal Withdrawn',
        message: `Your proposal for "${prop.job?.title || 'the job'}" was withdrawn.`
      });
    } catch (err) {
      showError('Withdraw Error', err);
    } finally {
      setBusyAction(null);
    }
  };

  // ---------- Deliverables ----------

  const openDeliverModal = (project, milestone) => {
    setDeliverTarget({ project, milestone });
    setDeliverNotes('');
    setDeliverLink('');
    setDeliverError('');
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (isSubmittingDeliverable || !deliverTarget) return;
    if (deliverNotes.trim().length < MIN_DELIVERABLE_NOTE) {
      setDeliverError(`Describe the completed work in at least ${MIN_DELIVERABLE_NOTE} characters.`);
      return;
    }

    const { project, milestone } = deliverTarget;
    setIsSubmittingDeliverable(true);
    setDeliverError('');
    try {
      await projectService.submitMilestoneDeliverable(project._id, milestone._id, {
        deliverableNote: deliverNotes.trim(),
        deliverableUrl: deliverLink.trim()
      });
      setDeliverTarget(null);
      setActionFeedback({
        type: 'success',
        title: 'Milestone Deliverable Submitted',
        message: `"${milestone.title}" (${formatCurrency(milestone.amount)}) was sent to ${
          project.client?.company || project.client?.name || 'the client'
        } for review and payment release.`
      });
      fetchFreelancerData();
    } catch (err) {
      setDeliverError(err.message || 'Error submitting deliverable. Please try again.');
    } finally {
      setIsSubmittingDeliverable(false);
    }
  };

  // ---------- Profile & portfolio ----------

  // PUT /freelancers/profile requires the core fields, so every save sends the full current profile
  const saveProfile = async (overrides, successMessage) => {
    const base = {
      title: profile?.title,
      category: profile?.category,
      bio: profile?.bio,
      hourlyRate: profile?.hourlyRate,
      skills: profile?.skills,
      experienceLevel: profile?.experienceLevel,
      availability: profile?.availability,
      location: profile?.location,
      portfolio: portfolioPayload(profile?.portfolio)
    };
    const res = await freelancerService.updateMyProfile({ ...base, ...overrides });
    setProfile(res.data);
    setProfileForm(PROFILE_FORM_FROM(res.data));
    setActionFeedback({ type: 'success', title: 'Profile Saved', message: successMessage });
  };

  const updateProfileForm = (field) => (e) => setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;

    const skills = profileForm.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const rateUsd = toUSD(profileForm.hourlyRate);

    if (profileForm.title.trim().length < 3) return setProfileError('Professional title must be at least 3 characters.');
    if (profileForm.bio.trim().length < MIN_BIO) return setProfileError(`Bio must be at least ${MIN_BIO} characters.`);
    if (skills.length === 0) return setProfileError('Add at least one skill (comma separated).');
    if (!(rateUsd >= MIN_RATE_USD && rateUsd <= MAX_RATE_USD))
      return setProfileError(
        `Hourly rate must be between ${formatCurrency(MIN_RATE_USD)} and ${formatCurrency(MAX_RATE_USD)}.`
      );

    setProfileError('');
    setIsSavingProfile(true);
    try {
      await saveProfile(
        {
          title: profileForm.title.trim(),
          category: profileForm.category,
          bio: profileForm.bio.trim(),
          hourlyRate: rateUsd, // typed in rupees, stored in USD
          skills,
          experienceLevel: profileForm.experienceLevel,
          availability: profileForm.availability,
          location: profileForm.location.trim() || 'Remote'
        },
        'Your public profile has been updated.'
      );
    } catch (err) {
      setProfileError(err.message || 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddPortfolioItem = async (e) => {
    e.preventDefault();
    const title = portfolioForm.title.trim();
    const link = portfolioForm.link.trim();
    if (title.length < 2) return setPortfolioError('Project title must be at least 2 characters.');
    if (link && !/^https?:\/\//i.test(link)) return setPortfolioError('Project link must start with http:// or https://');

    setPortfolioError('');
    setBusyAction('portfolio-add');
    try {
      const items = [
        ...portfolioPayload(profile?.portfolio),
        { title, ...(portfolioForm.description.trim() ? { description: portfolioForm.description.trim() } : {}), ...(link ? { link } : {}) }
      ];
      await saveProfile({ portfolio: items }, `"${title}" was added to your portfolio.`);
      setPortfolioForm({ title: '', description: '', link: '' });
    } catch (err) {
      setPortfolioError(err.message || 'Could not add the portfolio item.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemovePortfolioItem = async (index) => {
    const item = profile?.portfolio?.[index];
    setBusyAction(`portfolio-${index}`);
    try {
      const items = portfolioPayload(profile?.portfolio).filter((_, i) => i !== index);
      await saveProfile({ portfolio: items }, `"${item?.title || 'Item'}" was removed from your portfolio.`);
    } catch (err) {
      showError('Portfolio Update Error', err);
    } finally {
      setBusyAction(null);
    }
  };

  // ---------- Derived values ----------

  const pendingProposals = proposals.filter((p) => p.status === 'pending');
  const activeProjects = projects.filter((p) => ['active', 'milestone_review'].includes(p.status));
  const allMilestones = projects.flatMap((p) => (p.milestones || []).map((m) => ({ project: p, milestone: m })));
  const releasedMilestones = allMilestones.filter(({ milestone }) => milestone.status === 'released');
  const totalEarned = releasedMilestones.reduce((acc, { milestone }) => acc + (milestone.amount || 0), 0);
  const pendingPayout = allMilestones
    .filter(({ project, milestone }) => milestone.status !== 'released' && project.status !== 'cancelled')
    .reduce((acc, { milestone }) => acc + (milestone.amount || 0), 0);

  const clientName = (project) => project.client?.company || project.client?.name || 'Hiring Client';

  const renderProposalRow = (prop) => (
    <div key={prop._id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
      <div>
        {prop.job?._id ? (
          <Link to={`/jobs/${prop.job._id}`} className="text-sm font-bold text-content-primary hover:text-brand-600">
            {prop.job.title}
          </Link>
        ) : (
          <h4 className="text-sm font-bold text-content-primary">Job no longer available</h4>
        )}
        <p className="text-xs text-content-muted mt-0.5">
          Client: {prop.job?.client?.company || prop.job?.client?.name || 'Hiring Client'} &bull; Submitted{' '}
          {formatDate(prop.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-sm font-bold text-content-primary block">
            {formatCurrency(prop.bidAmount)}
            {prop.job?.projectType === 'Hourly' ? '/hr' : ''}
          </span>
          <span className="text-[11px] text-content-muted">{prop.estimatedDuration}</span>
        </div>
        <StatusBadge status={prop.status} />
        {prop.status === 'pending' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWithdrawProposal(prop)}
            disabled={busyAction === prop._id}
          >
            {busyAction === prop._id ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        )}
      </div>
    </div>
  );

  const renderContract = (project) => (
    <div key={project._id} className="border border-border rounded-md overflow-hidden">
      <div className="p-4 bg-surface-warm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-content-primary">{project.title}</h4>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-xs text-content-muted mt-0.5">
            Client: {clientName(project)} &bull; Started {formatDate(project.createdAt)}
          </p>
        </div>
        <span className="text-sm font-bold text-content-primary">{formatCurrency(project.totalAmount)}</span>
      </div>
      <div className="divide-y divide-border">
        {(project.milestones || []).map((m) => (
          <div key={m._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-content-primary">{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <p className="text-xs text-content-muted mt-0.5">
                {formatCurrency(m.amount)}
                {m.dueDate ? ` • Due ${formatDate(m.dueDate)}` : ''}
                {m.submittedAt ? ` • Submitted ${formatDate(m.submittedAt)}` : ''}
              </p>
            </div>
            {canDeliver(project, m) ? (
              <Button variant="primary" size="sm" className="gap-1.5" onClick={() => openDeliverModal(project, m)}>
                <Upload className="w-3.5 h-3.5" /> Submit Work
              </Button>
            ) : m.status === 'submitted' ? (
              <span className="text-xs text-amber-700 font-semibold">Awaiting client approval</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );

  const selectClass =
    'w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer';

  return (
    <PageContainer
      title="Freelancer Workspace & Earnings"
      subtitle={`Welcome back, ${user?.name || 'Freelancer'}. Track your proposals, submit deliverables, and follow your escrow payouts.`}
      actions={
        <Link to="/jobs">
          <Button variant="primary" size="md" className="gap-1.5">
            <Search className="w-4 h-4" /> Discover Jobs
          </Button>
        </Link>
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
          <Button variant="ghost" size="sm" onClick={fetchFreelancerData}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="flex-1 w-full space-y-6">
          {isLoadingData ? (
            <div className="py-16">
              <LoadingSpinner text="Loading your freelancer workspace..." />
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* KPI Summary Cards (all computed from live data) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Bids</span>
                    <FileCheck className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{pendingProposals.length}</span>
                  <p className="text-xs text-content-muted mt-1">{proposals.length} submitted in total</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
                    <Clock className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{activeProjects.length}</span>
                  <p className="text-xs text-content-muted mt-1">Escrow-backed projects</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
                    <IndianRupee className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{formatCurrency(totalEarned)}</span>
                  <p className="text-xs text-content-muted mt-1">From approved milestones</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Client Rating</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{profile?.rating ?? '-'}</span>
                  <p className="text-xs text-content-muted mt-1">{profile?.reviewsCount || 0} reviews</p>
                </div>
              </div>

              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-content-primary">Active Contracts & Milestones</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('contracts')}>
                    View All
                  </Button>
                </div>
                {activeProjects.length === 0 ? (
                  <EmptyState
                    title="No active contracts right now"
                    description="When a client accepts your proposal, your contract and its milestones will appear here."
                  />
                ) : (
                  <div className="space-y-4">{activeProjects.slice(0, 3).map(renderContract)}</div>
                )}
              </div>

              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-content-primary">Recent Proposals</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('proposals')}>
                    View All
                  </Button>
                </div>
                {proposals.length === 0 ? (
                  <EmptyState
                    title="No proposals submitted yet"
                    description="Browse marketplace jobs and submit tailored proposals to win projects."
                  />
                ) : (
                  <div className="divide-y divide-border">{proposals.slice(0, 4).map(renderProposalRow)}</div>
                )}
              </div>
            </>
          ) : activeTab === 'proposals' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-content-primary">All Submitted Proposals</h3>
                  <p className="text-xs text-content-muted">Track client responses or withdraw pending bids</p>
                </div>
                <Link to="/jobs">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Find More Jobs
                  </Button>
                </Link>
              </div>
              {proposals.length === 0 ? (
                <EmptyState
                  title="No proposals found"
                  description="You have not submitted any proposals yet. Check the jobs board to find open contracts."
                />
              ) : (
                <div className="divide-y divide-border border border-border rounded-md">
                  {proposals.map(renderProposalRow)}
                </div>
              )}
            </div>
          ) : activeTab === 'contracts' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-1">Contracts & Deliverables</h3>
              <p className="text-xs text-content-muted mb-6">Submit work for each milestone to request payment</p>
              {projects.length === 0 ? (
                <EmptyState
                  title="No contracts yet"
                  description="When a client accepts one of your proposals, the contract will appear here."
                />
              ) : (
                <div className="space-y-4">{projects.map(renderContract)}</div>
              )}
            </div>
          ) : activeTab === 'earnings' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-1">Earnings</h3>
              <p className="text-xs text-content-muted mb-6">Payments released to you from escrow</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-border rounded-md bg-surface-warm">
                  <span className="text-xs text-content-muted uppercase block">Released to you</span>
                  <span className="text-2xl font-bold text-content-primary">{formatCurrency(totalEarned)}</span>
                </div>
                <div className="p-4 border border-border rounded-md bg-surface-warm">
                  <span className="text-xs text-content-muted uppercase block">Pending in escrow</span>
                  <span className="text-2xl font-bold text-content-primary">{formatCurrency(pendingPayout)}</span>
                </div>
              </div>
              {releasedMilestones.length === 0 ? (
                <EmptyState
                  title="No payments released yet"
                  description="Payments appear here once a client approves one of your submitted milestones."
                />
              ) : (
                <div className="divide-y divide-border border border-border rounded-md">
                  {releasedMilestones.map(({ project, milestone }) => (
                    <div key={milestone._id} className="p-4 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <span className="font-semibold text-content-primary block">{project.title}</span>
                        <span className="text-xs text-content-muted">
                          {milestone.title} &bull; Released {formatDate(milestone.releasedAt)}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700">{formatCurrency(milestone.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'portfolio' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <h3 className="text-lg font-bold text-content-primary mb-1">Portfolio</h3>
              <p className="text-xs text-content-muted mb-6">Projects shown on your public profile</p>

              {(profile?.portfolio || []).length === 0 ? (
                <p className="text-sm text-content-muted mb-6">You haven't added any portfolio projects yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {profile.portfolio.map((item, index) => (
                    <div key={item._id || index} className="p-4 border border-border rounded-md bg-surface-warm">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-content-primary">{item.title}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemovePortfolioItem(index)}
                          disabled={busyAction === `portfolio-${index}`}
                          className="p-1 text-content-muted hover:text-red-600 disabled:opacity-50"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.description && <p className="text-xs text-content-muted mt-1">{item.description}</p>}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1 mt-2"
                        >
                          <ExternalLink className="w-3 h-3" /> View project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddPortfolioItem} className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-content-primary">Add a project</h4>
                {portfolioError && <p className="text-xs text-red-600">{portfolioError}</p>}
                <Input
                  id="portfolio-title"
                  label="Project Title"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
                <Input
                  id="portfolio-description"
                  label="Short Description (optional)"
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  id="portfolio-link"
                  label="Project Link (optional)"
                  type="url"
                  placeholder="https://..."
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, link: e.target.value }))}
                />
                <Button type="submit" variant="primary" size="sm" className="gap-1.5" disabled={busyAction === 'portfolio-add'}>
                  <Plus className="w-3.5 h-3.5" /> {busyAction === 'portfolio-add' ? 'Adding...' : 'Add to Portfolio'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-content-primary">Profile Settings</h3>
                  <p className="text-xs text-content-muted">This information appears on your public freelancer profile</p>
                </div>
                {profile?._id && (
                  <Link to={`/freelancers/${profile._id}`} className="text-xs font-medium text-brand-600 hover:underline">
                    View public profile
                  </Link>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {profileError && (
                  <div role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="profile-title"
                    label="Professional Title"
                    placeholder="e.g. Senior React Developer"
                    value={profileForm.title}
                    onChange={updateProfileForm('title')}
                    required
                  />
                  <Input
                    id="profile-rate"
                    label="Hourly Rate (₹/hr)"
                    type="number"
                    min="1"
                    value={profileForm.hourlyRate}
                    onChange={updateProfileForm('hourlyRate')}
                    helperText={`Between ${formatCurrency(MIN_RATE_USD)} and ${formatCurrency(MAX_RATE_USD)}`}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">Discipline</label>
                    <select value={profileForm.category} onChange={updateProfileForm('category')} className={selectClass}>
                      {MARKETPLACE_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">Experience Level</label>
                    <select
                      value={profileForm.experienceLevel}
                      onChange={updateProfileForm('experienceLevel')}
                      className={selectClass}
                    >
                      <option value="entry">Entry Level</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-content-primary mb-1.5">Availability</label>
                    <select
                      value={profileForm.availability}
                      onChange={updateProfileForm('availability')}
                      className={selectClass}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>

                <Input
                  id="profile-skills"
                  label="Skills"
                  placeholder="e.g. React, Node.js, MongoDB"
                  helperText="Separate skills with commas"
                  value={profileForm.skills}
                  onChange={updateProfileForm('skills')}
                  required
                />

                <Input
                  id="profile-location"
                  label="Location"
                  placeholder="e.g. Bengaluru, India (Remote)"
                  value={profileForm.location}
                  onChange={updateProfileForm('location')}
                />

                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-1.5">Professional Bio</label>
                  <textarea
                    rows={5}
                    value={profileForm.bio}
                    onChange={updateProfileForm('bio')}
                    placeholder="Summarise your experience, specialities, and the kind of projects you take on..."
                    required
                    className="w-full p-3 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="md" disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Submit Deliverable Modal */}
      <Modal
        isOpen={Boolean(deliverTarget)}
        onClose={() => setDeliverTarget(null)}
        title="Submit Milestone Deliverables"
        description={
          deliverTarget
            ? `Delivering "${deliverTarget.milestone.title}" (${formatCurrency(deliverTarget.milestone.amount)})`
            : ''
        }
        size="md"
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          {deliverError && (
            <div role="alert" className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{deliverError}</span>
            </div>
          )}
          <Input
            id="deliver-link"
            label="Deliverable Link / Repository / Artifact URL (optional)"
            type="url"
            placeholder="https://github.com/... or https://figma.com/..."
            value={deliverLink}
            onChange={(e) => setDeliverLink(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-content-primary mb-1.5">Summary of Completed Work</label>
            <textarea
              rows={4}
              value={deliverNotes}
              onChange={(e) => setDeliverNotes(e.target.value)}
              placeholder="Explain what was achieved for this milestone and how the client can review it..."
              required
              className="w-full p-3 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" fullWidth onClick={() => setDeliverTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmittingDeliverable}>
              {isSubmittingDeliverable ? 'Submitting Work...' : 'Submit to Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default FreelancerDashboardPage;
