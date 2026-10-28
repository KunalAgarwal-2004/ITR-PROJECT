import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  Briefcase,
  UserCheck,
  Award,
  Layers
} from 'lucide-react';
import CategoryGrid from '../../components/categories/CategoryGrid';
import FreelancerCard from '../../components/freelancers/FreelancerCard';
import JobCard from '../../components/jobs/JobCard';
import Button from '../../components/common/Button';
import CardSkeleton from '../../components/common/CardSkeleton';
import freelancerService from '../../services/freelancerService';
import jobService from '../../services/jobService';
import { useCtaPaths } from '../../hooks/useCtaPaths';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('talent'); // 'talent' or 'jobs'
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const cta = useCtaPaths();

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const [flRes, jobRes] = await Promise.all([
          freelancerService.getFreelancers({ limit: 4, sortBy: 'rating_desc' }),
          jobService.getJobs({ limit: 4, sortBy: 'newest' })
        ]);
        if (isMounted) {
          setFeaturedFreelancers(flRes?.data?.slice(0, 4) || []);
          setFeaturedJobs(jobRes?.data?.slice(0, 4) || []);
        }
      } catch (err) {
        console.warn('Could not load featured data for homepage:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchType === 'talent') {
      navigate(`/freelancers?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* ========================================================
          B. HERO SECTION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              WorkBridge Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-content-primary tracking-tight leading-[1.15] mb-6">
              Find the right freelance talent for your next project.
            </h1>

            <p className="text-base sm:text-lg text-content-muted leading-relaxed mb-8 max-w-xl">
              Connect directly with vetted independent specialists across 10 core disciplines. Review real portfolios, agree on clear milestones, and hire with confidence.
            </p>

            {/* Search Box */}
            <form onSubmit={handleHeroSearch} className="mb-6">
              <div className="bg-surface-white border border-border rounded-md p-1.5 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 px-3 shrink-0 border-b sm:border-b-0 sm:border-r border-border py-1 sm:py-0">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="text-xs font-medium text-content-primary bg-transparent focus:outline-none cursor-pointer py-1"
                  >
                    <option value="talent">Talent</option>
                    <option value="jobs">Jobs</option>
                  </select>
                </div>

                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-content-subtle absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'talent'
                        ? 'Try "React", "LLM Engineer", or "Figma Design"...'
                        : 'Try "Python API", "SEO Audit", or "BIM Revit"...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm text-content-primary placeholder:text-content-subtle bg-transparent focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" className="shrink-0 gap-1.5">
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Secondary Action & Quick Links */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
              <span className="font-medium text-content-primary">Popular searches:</span>
              <button
                type="button"
                onClick={() => navigate('/freelancers?search=React')}
                className="px-2.5 py-1 bg-surface-white border border-border rounded-sm hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                React
              </button>
              <button
                type="button"
                onClick={() => navigate('/freelancers?search=Figma')}
                className="px-2.5 py-1 bg-surface-white border border-border rounded-sm hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                Figma
              </button>
              <button
                type="button"
                onClick={() => navigate('/freelancers?search=Python')}
                className="px-2.5 py-1 bg-surface-white border border-border rounded-sm hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => navigate('/freelancers?search=SEO')}
                className="px-2.5 py-1 bg-surface-white border border-border rounded-sm hover:border-brand-500 hover:text-brand-600 transition-colors"
              >
                SEO
              </button>
            </div>
          </div>

          {/* Restrained Editorial Visual / Metric Card */}
          <div className="lg:col-span-5">
            <div className="bg-surface-white border border-border rounded-md p-6 sm:p-8 shadow-card relative">
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-content-primary">Verified Marketplace</h3>
                  <p className="text-xs text-content-muted mt-0.5">Built for serious enterprise & independent work</p>
                </div>
                <div className="w-10 h-10 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                </div>
              </div>

              <div className="space-y-4 py-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">10 Focused Disciplines</h4>
                    <p className="text-xs text-content-muted mt-0.5">Curated talent categories without diluted generalized catalogs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Transparent Milestone Escrow</h4>
                    <p className="text-xs text-content-muted mt-0.5">Clients deposit funds in advance; freelancers get paid upon approval.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Zero Hidden Markups</h4>
                    <p className="text-xs text-content-muted mt-0.5">Direct client-to-freelancer contracting with transparent platform fees.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <Link to={cta.hire} className="flex-1 mr-2">
                  <Button variant="primary" size="sm" fullWidth>
                    Hire Talent
                  </Button>
                </Link>
                <Link to={cta.joinAsFreelancer} className="flex-1 ml-2">
                  <Button variant="secondary" size="sm" fullWidth>
                    Apply as Freelancer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          C. SERVICE CATEGORIES (Matching Reference Screenshot)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Find freelancers for every type of work
            </h2>
            <p className="text-sm sm:text-base text-content-muted mt-1.5 max-w-xl">
              Explore specialized professional disciplines featuring verified independent talent
            </p>
          </div>
          <Link
            to="/categories"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 shrink-0"
          >
            All 10 Categories &rarr;
          </Link>
        </div>

        {/* 10 Categories Grid: 5 cols on desktop, responsive breakdown */}
        <CategoryGrid limit={10} />
      </section>

      {/* ========================================================
          D. FEATURED FREELANCERS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
              <Award className="w-3.5 h-3.5" /> Featured Specialists
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Top-rated independent professionals
            </h2>
            <p className="text-sm sm:text-base text-content-muted mt-1.5">
              Review sample profiles and portfolios across our primary service categories
            </p>
          </div>
          <Link
            to="/freelancers"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Browse All Freelancers &rarr;
          </Link>
        </div>

        {/* Freelancers Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <CardSkeleton type="freelancer" count={4} />
          ) : featuredFreelancers.length > 0 ? (
            featuredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id || freelancer._id} freelancer={freelancer} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-content-muted">
              No specialists currently featured. Browse all freelancers above.
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          E. HOW IT WORKS (Client & Freelancer Pathways)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            How WorkBridge works
          </h2>
          <p className="text-sm sm:text-base text-content-muted mt-2">
            A straightforward, milestone-based marketplace designed for clarity and mutual accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Pathway */}
          <div className="bg-surface-white border border-border rounded-md p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-md bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-content-primary">For Clients & Companies</h3>
              </div>
              <p className="text-sm text-content-muted mb-6">
                Publish project specifications and receive tailored proposals from screened independent professionals.
              </p>

              <ol className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Post your job requirements</h4>
                    <p className="text-xs text-content-muted mt-0.5">Define your project scope, timeline, required skills, and budget (fixed or hourly).</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Review curated proposals</h4>
                    <p className="text-xs text-content-muted mt-0.5">Compare candidate portfolios, verified skills, and bids within 24 hours.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Fund milestones & approve deliverables</h4>
                    <p className="text-xs text-content-muted mt-0.5">Funds stay protected in escrow and are only released when you approve completed milestones.</p>
                  </div>
                </li>
              </ol>
            </div>

            <Link to={cta.postJob}>
              <Button variant="primary" fullWidth size="md">
                Post a Job — It's Free
              </Button>
            </Link>
          </div>

          {/* Freelancer Pathway */}
          <div className="bg-surface-white border border-border rounded-md p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-md bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </span>
                <h3 className="text-lg font-bold text-content-primary">For Freelancers & Contractors</h3>
              </div>
              <p className="text-sm text-content-muted mb-6">
                Access genuine commercial contracts, build an unforgeable reputation, and receive guaranteed milestone payouts.
              </p>

              <ol className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Create your specialized profile</h4>
                    <p className="text-xs text-content-muted mt-0.5">Showcase your past work, set your hourly rate, and highlight your technical skills.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Discover high-intent jobs & submit bids</h4>
                    <p className="text-xs text-content-muted mt-0.5">Filter listings by category and submit tailored proposals directly to decision-makers.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-content-primary">Deliver quality work & get paid reliably</h4>
                    <p className="text-xs text-content-muted mt-0.5">Enjoy automated invoicing and secured escrow deposits with no payment chasing.</p>
                  </div>
                </li>
              </ol>
            </div>

            <Link to={cta.findWork}>
              <Button variant="secondary" fullWidth size="md">
                Find Remote Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          F. FEATURED JOBS
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
              <Layers className="w-3.5 h-3.5" /> Active Projects
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
              Explore open project opportunities
            </h2>
            <p className="text-sm sm:text-base text-content-muted mt-1.5">
              Browse recent fixed-price and hourly jobs looking for immediate start
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 shrink-0"
          >
            Browse All Jobs &rarr;
          </Link>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <CardSkeleton type="job" count={4} />
          ) : featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <JobCard key={job.id || job._id} job={job} />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-sm text-content-muted">
              No active job opportunities found. Post the first project above!
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          G. TRUST & CLOSING CTA SECTION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-white border border-border rounded-md p-8 sm:p-12 shadow-card">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-content-primary tracking-tight mb-4">
              A reliable freelance marketplace built on clear expectations.
            </h2>
            <p className="text-base text-content-muted leading-relaxed mb-8">
              WorkBridge eliminates friction in remote contracting. With milestone-based escrow, clear intellectual property protection, and transparent dispute resolution, both parties can focus on great work.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mb-10 pt-6 border-t border-border">
              <div className="p-4 bg-surface-warm rounded-md border border-border">
                <Lock className="w-5 h-5 text-brand-500 mb-2" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-content-primary">Payment Protection</h4>
                <p className="text-xs text-content-muted mt-1">Funds are deposited into secure escrow before any work begins.</p>
              </div>

              <div className="p-4 bg-surface-warm rounded-md border border-border">
                <CheckCircle2 className="w-5 h-5 text-brand-500 mb-2" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-content-primary">Work Ownership</h4>
                <p className="text-xs text-content-muted mt-1">Clients own all IP rights upon final milestone payment completion.</p>
              </div>

              <div className="p-4 bg-surface-warm rounded-md border border-border">
                <Clock className="w-5 h-5 text-brand-500 mb-2" strokeWidth={1.75} />
                <h4 className="text-sm font-bold text-content-primary">Fast Hiring Velocity</h4>
                <p className="text-xs text-content-muted mt-1">Direct proposals and in-app messaging speed up team deployment.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={cta.hire}>
                <Button variant="primary" size="lg">
                  Get Started as a Client
                </Button>
              </Link>
              <Link to={cta.joinAsFreelancer}>
                <Button variant="secondary" size="lg">
                  Join as a Freelancer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
