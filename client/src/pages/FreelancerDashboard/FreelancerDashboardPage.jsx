import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  DollarSign,
  Star,
  Search,
  CheckCircle,
  ExternalLink,
  Upload,
  AlertCircle,
  FolderOpen,
  Check,
  ShieldCheck
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
import proposalService from '../../services/proposalService';
import projectService from '../../services/projectService';

export const FreelancerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [deliverNotes, setDeliverNotes] = useState('');
  const [deliverLink, setDeliverLink] = useState('');
  const [deliverSuccess, setDeliverSuccess] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingDeliverable, setIsSubmittingDeliverable] = useState(false);

  // Live proposals & contracts
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const fetchFreelancerData = async () => {
      setIsLoadingData(true);
      try {
        const [propRes, projRes] = await Promise.all([
          proposalService.getMyProposals().catch(() => ({ data: [] })),
          projectService.getMyProjects().catch(() => ({ data: [] }))
        ]);

        if (propRes.data) {
          setProposals(
            propRes.data.map((p) => ({
              id: p._id,
              jobId: p.job?._id,
              jobTitle: p.job?.title || 'Job Contract',
              clientName: p.job?.client?.name || p.job?.client?.company || 'Hiring Client',
              bid: `$${p.bidAmount?.toLocaleString()}`,
              timeline: p.estimatedDuration,
              submittedDate: new Date(p.createdAt).toLocaleDateString(),
              status: p.status === 'pending' ? 'Under Review' : p.status
            }))
          );
        }

        if (projRes.data) {
          setContracts(
            projRes.data.map((c) => ({
              id: c._id,
              title: c.title,
              client: c.client?.name || c.client?.company || 'Hiring Client',
              totalValue: `$${c.totalAmount?.toLocaleString()}`,
              currentMilestone: c.milestones?.[0]?.title || 'Phase 1 Deliverable',
              milestoneId: c.milestones?.[0]?._id,
              milestoneAmount: `$${c.milestones?.[0]?.amount?.toLocaleString() || c.totalAmount?.toLocaleString()}`,
              dueDate: c.milestones?.[0]?.dueDate ? new Date(c.milestones[0].dueDate).toLocaleDateString() : 'Active',
              status: c.status === 'active' ? 'In Progress' : c.status
            }))
          );
        }
      } catch (err) {
        console.warn('Freelancer dashboard live fetch fallback:', err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchFreelancerData();
  }, []);

  const handleOpenDeliverModal = (contract) => {
    setSelectedContract(contract);
    setDeliverModalOpen(true);
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (isSubmittingDeliverable) return;
    setIsSubmittingDeliverable(true);

    try {
      if (selectedContract.milestoneId && selectedContract.id.match(/^[0-9a-fA-F]{24}$/)) {
        await projectService.submitMilestoneDeliverable(
          selectedContract.id,
          selectedContract.milestoneId,
          { deliverableNote: deliverNotes, deliverableUrl: deliverLink }
        );
      }
      setDeliverSuccess(true);
      setTimeout(() => {
        setDeliverModalOpen(false);
        setDeliverSuccess(false);
        setIsSubmittingDeliverable(false);
        setDeliverNotes('');
        setDeliverLink('');
        setContracts(contracts.map(c => c.id === selectedContract.id ? { ...c, status: 'Submitted for Review' } : c));
        setActionFeedback({
          type: 'success',
          title: 'Milestone Deliverable Submitted',
          message: `Milestone "${selectedContract.currentMilestone}" (${selectedContract.milestoneAmount}) submitted to ${selectedContract.client} for inspection and payment release.`
        });
      }, 800);
    } catch (err) {
      setIsSubmittingDeliverable(false);
      setActionFeedback({
        type: 'error',
        title: 'Deliverable Submission Error',
        message: err.message || 'Error submitting deliverable. Please try again.'
      });
    }
  };

  return (
    <PageContainer
      title="Freelancer Workspace & Earnings"
      subtitle={`Welcome back, ${user?.name || 'Freelancer'}. Track your proposal pipeline, submit deliverables, and manage guaranteed escrow payouts.`}
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

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Responsive Sidebar */}
        <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Tab Body */}
        <div className="flex-1 w-full space-y-6">
          {isLoadingData ? (
            <div className="py-16">
              <LoadingSpinner text="Loading your freelancer workspace..." />
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Bids</span>
                    <FileCheck className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{proposals.length}</span>
                  <p className="text-xs text-brand-600 mt-1 font-medium">In your proposal pipeline</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
                    <Clock className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">{contracts.length}</span>
                  <p className="text-xs text-content-muted mt-1">Escrow funded projects</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
                    <DollarSign className="w-4 h-4 text-brand-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">$12,450</span>
                  <p className="text-xs text-brand-600 font-medium mt-1">Direct bank transfers</p>
                </div>

                <div className="p-5 bg-surface-white border border-border rounded-md shadow-subtle">
                  <div className="flex items-center justify-between text-content-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Client Rating</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="text-2xl font-bold text-content-primary">4.96</span>
                  <p className="text-xs text-content-muted mt-1">Verified marketplace reviews</p>
                </div>
              </div>

              {/* Active Contracts & Milestones */}
              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-content-primary">Active Contracts & Escrow Milestones</h3>
                  <span className="text-xs text-content-muted">Guaranteed payments</span>
                </div>

                {contracts.length === 0 ? (
                  <EmptyState
                    title="No active contracts right now"
                    description="When a client accepts your proposal and funds the milestone escrow, your contract will appear here."
                    actionLabel="Discover Open Jobs"
                    onAction={() => window.location.href = '/jobs'}
                  />
                ) : (
                  <div className="space-y-4">
                    {contracts.map((ctr) => (
                      <div
                        key={ctr.id}
                        className="p-5 border border-border rounded-md bg-surface-warm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500" />
                            <h4 className="text-sm font-bold text-content-primary">{ctr.title}</h4>
                            <span className="text-xs text-content-muted">&bull; Client: {ctr.client}</span>
                          </div>
                          <p className="text-xs text-content-muted">
                            Current Milestone: <strong className="text-content-primary">{ctr.currentMilestone}</strong> ({ctr.milestoneAmount})
                          </p>
                          <span className="inline-block text-[11px] text-content-muted">Due date: {ctr.dueDate}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-bold text-content-primary block">{ctr.totalValue}</span>
                            <span className="text-[11px] text-brand-600 font-semibold">{ctr.status}</span>
                          </div>
                          {ctr.status !== 'Submitted for Review' && ctr.status !== 'completed' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleOpenDeliverModal(ctr)}
                            >
                              <Upload className="w-3.5 h-3.5" /> Submit Work
                            </Button>
                          ) : (
                            <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              Under Review
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proposals Pipeline */}
              <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-content-primary">Recent Proposals Submitted</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('proposals')}>
                    View All
                  </Button>
                </div>

                {proposals.length === 0 ? (
                  <EmptyState
                    title="No proposals submitted yet"
                    description="Browse marketplace jobs and submit tailored proposals with milestones to win projects."
                    actionLabel="Browse Marketplace Jobs"
                    onAction={() => window.location.href = '/jobs'}
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {proposals.slice(0, 4).map((prop) => (
                      <div
                        key={prop.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-content-primary">{prop.jobTitle}</h4>
                          <p className="text-xs text-content-muted mt-0.5">
                            Client: {prop.clientName} &bull; Submitted {prop.submittedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-bold text-content-primary block">{prop.bid}</span>
                            <span className="text-[11px] text-content-muted">{prop.timeline}</span>
                          </div>
                          <span className="px-2.5 py-1 text-xs rounded-full bg-surface-muted text-content-primary font-semibold border border-border">
                            {prop.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'proposals' ? (
            <div className="bg-surface-white border border-border rounded-md p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-content-primary">All Submitted Proposals</h3>
                  <p className="text-xs text-content-muted">Track candidate evaluations and client responses</p>
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
                  actionLabel="Find Jobs"
                  onAction={() => window.location.href = '/jobs'}
                />
              ) : (
                <div className="divide-y divide-border border border-border rounded-md">
                  {proposals.map((prop) => (
                    <div key={prop.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-content-primary">{prop.jobTitle}</h4>
                        <p className="text-xs text-content-muted mt-0.5">
                          Client: {prop.clientName} &bull; Submitted {prop.submittedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-bold text-content-primary block">{prop.bid}</span>
                          <span className="text-[11px] text-content-muted">{prop.timeline}</span>
                        </div>
                        <span className="px-2.5 py-1 text-xs rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                          {prop.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-white border border-border rounded-md p-8 shadow-card text-center">
              <CheckCircle className="w-10 h-10 text-brand-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-content-primary capitalize">{activeTab} Section</h3>
              <p className="text-xs text-content-muted max-w-sm mx-auto mt-1 mb-4">
                Milestone contracts, deliverables, and payout settings are configured in this area.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('overview')}>
                Return to Overview
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Accessible Submit Deliverable Modal */}
      <Modal
        isOpen={deliverModalOpen}
        onClose={() => setDeliverModalOpen(false)}
        title="Submit Milestone Deliverables"
        description={selectedContract ? `Delivering "${selectedContract.currentMilestone}" (${selectedContract.milestoneAmount})` : ''}
        size="md"
      >
        {deliverSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Work Submitted!</h3>
            <p className="text-xs text-content-muted mt-1">Client has been notified to inspect and release payment.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitDeliverable} className="space-y-4">
            <Input
              id="deliver-link"
              label="Deliverable Link / Repository / Artifact URL"
              type="url"
              placeholder="https://github.com/... or https://figma.com/..."
              value={deliverLink}
              onChange={(e) => setDeliverLink(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1.5">
                Summary of Completed Work
              </label>
              <textarea
                rows={4}
                value={deliverNotes}
                onChange={(e) => setDeliverNotes(e.target.value)}
                placeholder="Explain what was achieved for this milestone, test coverage results, and instructions for the client..."
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
                onClick={() => setDeliverModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={isSubmittingDeliverable}
              >
                {isSubmittingDeliverable ? 'Submitting Work...' : 'Submit to Client'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default FreelancerDashboardPage;
