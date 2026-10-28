import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Star, ShieldCheck, AlertCircle } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import FeedbackBanner from '../../components/common/FeedbackBanner';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SampleDataNotice from '../../components/common/SampleDataNotice';
import jobService from '../../services/jobService';
import proposalService from '../../services/proposalService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatLabel, toINR, toUSD } from '../../utils/formatters';

// The API rejects bids below 5 USD; validate the rupee input against the same floor
const MIN_BID_USD = 5;
const MIN_COVER_LETTER = 20;

export const JobDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('2 weeks');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [proposalError, setProposalError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await jobService.getJobById(id);
        setJob(res.data);
        setIsSample(Boolean(res.isSample));
        // Bids are typed in rupees; prefill with the job's minimum budget converted to INR
        if (res.data?.budgetMin) {
          setBidAmount(String(toINR(res.data.budgetMin)));
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner text="Loading job posting details..." />
      </PageContainer>
    );
  }

  if (!job) {
    return (
      <PageContainer>
        <EmptyState
          title="Job Listing Not Found"
          description={`The requested job '${id}' does not exist or has expired.`}
          actionLabel="Return to Jobs Board"
          onAction={() => navigate('/jobs')}
        />
      </PageContainer>
    );
  }

  const isFixed = (job.projectType || '').toLowerCase().includes('fixed');

  const isOpen = job.status === 'open';
  const minBidInr = toINR(MIN_BID_USD);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setProposalError('');

    // Mirror the server's validation so users get a clear message before submitting
    if (coverLetter.trim().length < MIN_COVER_LETTER) {
      setProposalError(`Your cover letter must be at least ${MIN_COVER_LETTER} characters.`);
      return;
    }
    if (!(Number(bidAmount) >= minBidInr)) {
      setProposalError(`Your bid must be at least ${formatCurrency(MIN_BID_USD)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await proposalService.submitProposal({
        jobId: job.id || job._id,
        coverLetter: coverLetter.trim(),
        bidAmount: toUSD(bidAmount), // API stores USD
        estimatedDuration: deliveryTime
      });
      setProposalModalOpen(false);
      setHasApplied(true);
      setJob((prev) => ({ ...prev, proposalsCount: (prev.proposalsCount || 0) + 1 }));
      setSuccessBanner(`Your proposal of ${formatCurrency(toUSD(bidAmount))} was submitted to ${job.client?.name || 'the client'}! You can track its status in your Freelancer Workspace.`);
    } catch (err) {
      if (err.statusCode === 409) {
        // Already bid on this job earlier: reflect that instead of letting them retry
        setHasApplied(true);
      }
      setProposalError(err.message || 'Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-brand-500">Jobs</Link>
          <span>/</span>
          <span className="text-content-primary font-medium truncate max-w-xs">{job.title}</span>
        </nav>
      }
    >
      <SampleDataNotice show={isSample} />

      {successBanner && (
        <FeedbackBanner
          type="success"
          title="Proposal Delivered"
          message={successBanner}
          onDismiss={() => setSuccessBanner('')}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Job Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {job.categoryName}
              </span>
              <span className="text-xs text-content-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-content-subtle" /> Posted {job.postedTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary mb-4 leading-tight">
              {job.title}
            </h1>

            {/* Scope & Type Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-warm rounded-md border border-border mb-6">
              <div>
                <span className="text-xs text-content-muted block uppercase">Project Type</span>
                <span className="text-sm font-bold text-content-primary mt-0.5 block">
                  {job.projectType}
                </span>
              </div>
              <div>
                <span className="text-xs text-content-muted block uppercase">Budget</span>
                <span className="text-sm font-bold text-brand-600 mt-0.5 block">
                  {job.budgetDisplay}
                </span>
              </div>
              <div>
                <span className="text-xs text-content-muted block uppercase">Experience</span>
                <span className="text-sm font-bold text-content-primary mt-0.5 block">
                  {formatLabel(job.experienceLevel)}
                </span>
              </div>
              <div>
                <span className="text-xs text-content-muted block uppercase">Duration</span>
                <span className="text-sm font-bold text-content-primary mt-0.5 block">
                  {job.estimatedDuration}
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-content-primary mb-2">Job Description</h2>
              <p className="text-sm text-content-primary leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Required Skills */}
            <div className="mb-8 pt-6 border-t border-border">
              <h2 className="text-sm font-bold text-content-primary mb-3">Skills & Expertise Needed</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Link
                    key={index}
                    to={`/jobs?search=${encodeURIComponent(skill)}`}
                    className="px-3 py-1 rounded-sm bg-surface-muted border border-border text-xs font-medium text-content-primary hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {skill}
                  </Link>
                ))}
              </div>
            </div>

            {/* Milestone Breakdown (for Fixed Price) */}
            {isFixed && job.milestones && job.milestones.length > 0 && (
              <div className="pt-6 border-t border-border">
                <h2 className="text-sm font-bold text-content-primary mb-3">Planned Project Milestones</h2>
                <div className="divide-y divide-border border border-border rounded-md overflow-hidden">
                  {job.milestones.map((m, idx) => (
                    <div key={m.id} className="p-3 bg-surface-warm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-content-primary">{m.title}</span>
                      </div>
                      <span className="font-bold text-brand-600">{formatCurrency(m.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Apply Button & Client Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-white border border-border rounded-md p-6 shadow-card sticky top-20">
            <div className="mb-4">
              <span className="text-xs text-content-muted block mb-1">Project Budget</span>
              <span className="text-2xl font-bold text-content-primary block">{job.budgetDisplay}</span>
            </div>

            {/* Only signed-in freelancers can bid, and only while the job is open */}
            {!isOpen ? (
              <p className="mb-3 p-3 text-xs text-center rounded-md bg-surface-muted border border-border text-content-muted">
                This job is {formatLabel(job.status).toLowerCase()} and no longer accepting proposals.
              </p>
            ) : isSample ? (
              <p className="mb-3 p-3 text-xs text-center rounded-md bg-surface-muted border border-border text-content-muted">
                Applying is unavailable while viewing sample listings.
              </p>
            ) : !isAuthenticated ? (
              <Link to={`/login?redirect=${encodeURIComponent(`/jobs/${id}`)}`} className="block mb-3">
                <Button variant="primary" fullWidth size="lg">
                  Log In to Apply
                </Button>
              </Link>
            ) : isFreelancer ? (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => setProposalModalOpen(true)}
                disabled={hasApplied}
                className="mb-3"
              >
                {hasApplied ? 'Proposal Submitted' : 'Submit a Proposal'}
              </Button>
            ) : (
              <p className="mb-3 p-3 text-xs text-center rounded-md bg-surface-muted border border-border text-content-muted">
                Proposals are submitted from freelancer accounts.
              </p>
            )}

            <p className="text-xs text-content-muted text-center mb-6">
              Activity: {job.proposalsCount} proposals submitted
            </p>

            {/* Client Information */}
            <div className="pt-6 border-t border-border space-y-3 text-xs text-content-muted">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
                About the Client
              </h3>

              {(job.client.isVerified || job.client.verifiedPayment) && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
                  <span className="font-medium text-content-primary">Verified Client</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  <strong>{job.client.rating}</strong> of {job.client.reviewsCount} reviews
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-content-subtle shrink-0" />
                <span>{job.client.location}</span>
              </div>

              <div className="pt-2 border-t border-border-light">
                <span className="block font-semibold text-content-primary mb-0.5">Total Spent on WorkBridge</span>
                <span>{job.client.totalSpent != null ? `${formatCurrency(job.client.totalSpent)}+` : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Proposal Modal */}
      <Modal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title="Submit a Proposal"
        description={`Submitting bid for "${job.title}"`}
        size="lg"
      >
        {(
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            {proposalError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{proposalError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="bid-amount"
                label={isFixed ? 'Your Bid Amount (₹)' : 'Your Hourly Rate (₹/hr)'}
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-content-primary mb-1.5">
                  Estimated Duration
                </label>
                <select
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
                >
                  <option value="1 week">Less than 1 week</option>
                  <option value="2 weeks">1 to 2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="3 months">1 to 3 months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Cover Letter & Pitch
              </label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Describe your technical background, similar projects you have built, and your approach to this milestone..."
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
                onClick={() => setProposalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default JobDetailPage;
