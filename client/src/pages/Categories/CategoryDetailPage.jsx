import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, ChevronRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import FreelancerCard from '../../components/freelancers/FreelancerCard';
import JobCard from '../../components/jobs/JobCard';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import CardSkeleton from '../../components/common/CardSkeleton';
import { CATEGORY_MAP } from '../../constants/categories';
import freelancerService from '../../services/freelancerService';
import jobService from '../../services/jobService';

export const CategoryDetailPage = () => {
  const { slug } = useParams();
  const category = CATEGORY_MAP[slug];
  const [activeTab, setActiveTab] = useState('freelancers'); // 'freelancers' or 'jobs'

  const [freelancers, setFreelancers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!category) return;

    let isMounted = true;
    setIsLoading(true);
    setFetchError(null);

    const loadCategoryData = async () => {
      try {
        const [freelancerRes, jobRes] = await Promise.all([
          freelancerService.getFreelancers({ category: category.slug, limit: 12 }),
          jobService.getJobs({ category: category.slug, limit: 12 })
        ]);

        if (isMounted) {
          setFreelancers(freelancerRes?.data || []);
          setJobs(jobRes?.data || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load category data:', err);
          setFetchError(err.message || 'Unable to retrieve category listings.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCategoryData();

    return () => {
      isMounted = false;
    };
  }, [category, slug]);

  if (!category) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto py-16 text-center">
          <h2 className="text-xl font-bold text-content-primary mb-2">Category Not Found</h2>
          <p className="text-sm text-content-muted mb-6">
            The category "{slug}" could not be found in our directory.
          </p>
          <Link to="/categories">
            <Button variant="primary">Return to All Categories</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const IconComponent = category.icon;

  return (
    <PageContainer
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-brand-500">Categories</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">{category.title}</span>
        </nav>
      }
    >
      {/* Category Hero Banner */}
      <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 mb-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            {IconComponent && <IconComponent className="w-7 h-7" strokeWidth={1.5} />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-content-primary">
              {category.title}
            </h1>
            <p className="text-xs text-brand-600 font-semibold mt-1">
              {jobs.length} Active Opportunities • {freelancers.length} Verified Specialists
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-content-muted leading-relaxed max-w-3xl mb-6">
          {category.description}
        </p>

        {/* Core Skills Pill Badges */}
        <div className="pt-6 border-t border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
            Core In-Demand Skills in {category.title}
          </h4>
          <div className="flex flex-wrap gap-2">
            {category.sampleSkills.map((skill, index) => (
              <Link
                key={index}
                to={`/freelancers?search=${encodeURIComponent(skill)}`}
                className="px-3 py-1 rounded-sm bg-surface-muted border border-border text-xs font-medium text-content-primary hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                {skill}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Segmented Tabs: Freelancers vs. Jobs */}
      <div className="flex items-center justify-between border-b border-border mb-6">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('freelancers')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'freelancers'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-content-muted hover:text-content-primary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Freelance Specialists ({isLoading ? '...' : freelancers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-content-muted hover:text-content-primary'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Projects ({isLoading ? '...' : jobs.length})</span>
          </button>
        </div>

        <Link
          to={activeTab === 'freelancers' ? `/auth/register?role=client` : `/auth/register?role=freelancer`}
        >
          <Button variant="outline" size="sm">
            {activeTab === 'freelancers' ? 'Hire in this Category' : 'Post a Job Here'}
          </Button>
        </Link>
      </div>

      {/* Content depending on tab */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton type={activeTab === 'freelancers' ? 'freelancer' : 'job'} count={6} />
        </div>
      ) : activeTab === 'freelancers' ? (
        freelancers.length === 0 ? (
          <EmptyState
            title="No talent listed in this category yet"
            description="Check back shortly or browse other categories."
            actionLabel="Browse All Freelancers"
            onAction={() => window.location.href = '/freelancers'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id || freelancer._id} freelancer={freelancer} />
            ))}
          </div>
        )
      ) : (
        jobs.length === 0 ? (
          <EmptyState
            title="No open jobs in this category right now"
            description="Be the first to post a job in this category."
            actionLabel="Post a Job"
            onAction={() => window.location.href = '/auth/register?role=client'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id || job._id} job={job} />
            ))}
          </div>
        )
      )}
    </PageContainer>
  );
};

export default CategoryDetailPage;
