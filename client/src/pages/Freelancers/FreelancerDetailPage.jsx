import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ShieldCheck } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SampleDataNotice from '../../components/common/SampleDataNotice';
import freelancerService from '../../services/freelancerService';
import { useAuth } from '../../hooks/useAuth';
import { useCtaPaths } from '../../hooks/useCtaPaths';
import { formatCurrency, formatLabel } from '../../utils/formatters';

export const FreelancerDetailPage = () => {
  const { id } = useParams();
  const { isClient, isFreelancer } = useAuth();
  const cta = useCtaPaths();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    const fetchFreelancer = async () => {
      setIsLoading(true);
      try {
        const res = await freelancerService.getFreelancerById(id);
        setFreelancer(res.data);
        setIsSample(Boolean(res.isSample));
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner text="Loading freelancer profile..." />
      </PageContainer>
    );
  }

  if (!freelancer) {
    return (
      <PageContainer>
        <EmptyState
          title="Freelancer Profile Not Found"
          description={`The requested profile '${id}' does not exist or has been removed.`}
          actionLabel="Return to Freelancers Directory"
          onAction={() => navigate('/freelancers')}
        />
      </PageContainer>
    );
  }

  const firstName = freelancer.name.split(' ')[0];

  return (
    <PageContainer
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <Link to="/freelancers" className="hover:text-brand-500">Freelancers</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">{freelancer.name}</span>
        </nav>
      }
    >
      <SampleDataNotice show={isSample} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Profile Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center shrink-0">
                  {freelancer.avatarInitials}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-content-primary flex items-center gap-2">
                    {freelancer.name}
                    <ShieldCheck className="w-5 h-5 text-brand-500" title="Vetted Identity" />
                  </h1>
                  <p className="text-sm font-semibold text-brand-600 mt-0.5">{freelancer.title}</p>
                  <p className="text-xs text-content-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {freelancer.location}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto p-3 sm:p-0 bg-surface-warm sm:bg-transparent rounded-md border sm:border-0 border-border">
                <span className="text-2xl font-bold text-content-primary">{formatCurrency(freelancer.hourlyRate)}</span>
                <span className="text-xs text-content-muted block">per hour</span>
                <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  {formatLabel(freelancer.availability)}
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border text-center">
              <div>
                <span className="text-xs text-content-muted block uppercase">Client Rating</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-base font-bold text-content-primary">{freelancer.rating || 'New'}</span>
                </div>
                <span className="text-[11px] text-content-muted">({freelancer.reviewsCount || 0} reviews)</span>
              </div>

              <div>
                <span className="text-xs text-content-muted block uppercase">Completed Jobs</span>
                <span className="text-base font-bold text-content-primary block mt-1">
                  {freelancer.totalJobsCompleted || 0}
                </span>
                <span className="text-[11px] text-content-muted">on WorkBridge</span>
              </div>

              <div>
                <span className="text-xs text-content-muted block uppercase">Discipline</span>
                <Link
                  to={`/categories/${freelancer.category}`}
                  className="text-xs font-bold text-brand-600 hover:underline block mt-2"
                >
                  {freelancer.categoryName}
                </Link>
              </div>
            </div>
          </div>

          {/* About / Overview */}
          <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-content-primary mb-3">Professional Overview</h2>
            {freelancer.overview && (
              <p className="text-sm text-content-primary leading-relaxed mb-4">
                {freelancer.overview}
              </p>
            )}
            <p className="text-sm text-content-muted leading-relaxed">
              {freelancer.bio || `${firstName} hasn't written a profile overview yet.`}
            </p>
          </div>

          {/* Portfolio Projects */}
          <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-content-primary mb-4">Featured Portfolio</h2>
            {freelancer.portfolio.length === 0 && (
              <p className="text-sm text-content-muted">No portfolio projects added yet.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {freelancer.portfolio.map((item) => (
                <div key={item.id} className="p-4 bg-surface-warm border border-border rounded-md">
                  <h3 className="text-sm font-bold text-content-primary mb-1">{item.title}</h3>
                  <p className="text-xs text-content-muted leading-relaxed mb-3">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand-600 hover:underline block mb-2"
                    >
                      View project
                    </a>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-sm bg-white border border-border text-[11px] text-content-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work History & Reviews (only rendered when there is history to show) */}
          {freelancer.workHistory.length > 0 && (
          <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card">
            <h2 className="text-lg font-bold text-content-primary mb-4">Work History & Client Feedback</h2>
            <div className="divide-y divide-border">
              {freelancer.workHistory.map((history) => (
                <div key={history.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="text-sm font-bold text-content-primary">{history.jobTitle}</h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{history.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-content-muted italic mb-2">"{history.feedback}"</p>
                  <div className="flex items-center gap-4 text-xs text-content-muted">
                    <span>Client: {history.clientName}</span>
                    <span>&bull;</span>
                    <span>{history.date}</span>
                    <span>&bull;</span>
                    <span className="font-medium text-content-primary">
                      {formatCurrency(history.budget)} ({history.projectType})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

        {/* Right Sidebar Details & Hire CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-white border border-border rounded-md p-6 shadow-card sticky top-20">
            <h3 className="text-base font-bold text-content-primary mb-4">Work with {firstName}</h3>

            {/* Hiring happens by posting a job that freelancers bid on; there is no direct
                invite/messaging endpoint, so the CTA routes to the real flow for each role. */}
            {!isFreelancer && (
              <div className="space-y-3 mb-6">
                <Link to={cta.postJob} className="block">
                  <Button variant="primary" fullWidth size="md">
                    {isClient ? 'Post a Job to Hire' : 'Sign Up to Hire'}
                  </Button>
                </Link>
                <p className="text-[11px] text-content-muted leading-relaxed">
                  Post your project and {firstName} can send you a proposal. You'll review bids and accept one from
                  your Client Workspace.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border text-xs text-content-muted">
              <div>
                <span className="font-semibold text-content-primary block mb-1">Skills & Tools</span>
                <div className="flex flex-wrap gap-1">
                  {freelancer.skills.map((skill, index) => (
                    <Link
                      key={index}
                      to={`/freelancers?search=${encodeURIComponent(skill)}`}
                      className="px-2 py-0.5 rounded-sm bg-surface-muted border border-border text-xs font-medium text-content-primary hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-content-primary block mb-1">Languages</span>
                <p>{freelancer.languages.length > 0 ? freelancer.languages.join(', ') : 'Not specified'}</p>
              </div>

              <div>
                <span className="font-semibold text-content-primary block mb-1">Education</span>
                <p>{freelancer.education}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </PageContainer>
  );
};

export default FreelancerDetailPage;
