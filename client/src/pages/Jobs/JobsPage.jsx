import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, Plus, ArrowUpDown, Clock, DollarSign } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import JobCard from '../../components/jobs/JobCard';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CardSkeleton from '../../components/common/CardSkeleton';
import Button from '../../components/common/Button';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';
import jobService from '../../services/jobService';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSort = searchParams.get('sort') || 'newest';
  const initialType = searchParams.get('type') || 'all';
  const initialLevel = searchParams.get('level') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [projectType, setProjectType] = useState(initialType);
  const [experienceLevel, setExperienceLevel] = useState(initialLevel);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [jobs, setJobs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateURLParams = (updated = {}) => {
    const params = new URLSearchParams();
    const newCategory = updated.category !== undefined ? updated.category : category;
    const newSearch = updated.search !== undefined ? updated.search : search;
    const newSort = updated.sortBy !== undefined ? updated.sortBy : sortBy;
    const newPage = updated.page !== undefined ? updated.page : page;
    const newType = updated.projectType !== undefined ? updated.projectType : projectType;
    const newLevel = updated.experienceLevel !== undefined ? updated.experienceLevel : experienceLevel;

    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (newSearch) params.set('search', newSearch);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    if (newPage > 1) params.set('page', newPage.toString());
    if (newType && newType !== 'all') params.set('type', newType);
    if (newLevel && newLevel !== 'all') params.set('level', newLevel);

    setSearchParams(params);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await jobService.getJobs({
          search,
          category,
          projectType,
          experienceLevel,
          sortBy,
          page,
          limit: 6
        });
        if (isMounted) {
          setJobs(res.data);
          setTotalItems(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load jobs:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [search, category, projectType, experienceLevel, sortBy, page]);

  const handleSearchSubmit = (val) => {
    setSearch(val);
    setPage(1);
    updateURLParams({ search: val, page: 1 });
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setPage(1);
    updateURLParams({ category: newCat, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
    updateURLParams({ sortBy: newSort, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURLParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setProjectType('all');
    setExperienceLevel('all');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || category !== 'all' || projectType !== 'all' || experienceLevel !== 'all';

  return (
    <PageContainer
      title="Find Remote Freelance Jobs"
      subtitle="Discover open contract opportunities with verified client budgets and milestone escrow protection."
      actions={
        <Link to="/signup?role=client">
          <Button variant="primary" size="md" className="gap-1.5">
            <Plus className="w-4 h-4" /> Post a Job
          </Button>
        </Link>
      }
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">Jobs</span>
        </nav>
      }
    >
      {/* Search & Filter Header Bar */}
      <div className="bg-surface-white border border-border rounded-md p-4 sm:p-5 mb-6 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearchSubmit}
            placeholder="Search by required tech stack, title, or client..."
            className="flex-1"
          />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 md:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full md:w-48 pl-3 pr-8 py-2 text-xs font-medium bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
                aria-label="Sort jobs by"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="budget_desc">Budget: High to Low</option>
                <option value="budget_asc">Budget: Low to High</option>
                <option value="proposals_asc">Proposals: Fewest First</option>
                <option value="proposals_desc">Proposals: Most First</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center justify-center gap-2"
              aria-label="Toggle filter controls"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Quick Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 rounded-sm border shrink-0 transition-colors ${
              category === 'all'
                ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                : 'bg-surface-white border-border text-content-primary hover:border-brand-500'
            }`}
          >
            All Categories
          </button>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-sm border shrink-0 transition-colors ${
                category === cat.slug
                  ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                  : 'bg-surface-white border-border text-content-primary hover:border-brand-500'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Filter Controls (Collapsible on mobile) */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} md:block pt-3 border-t border-border`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Project Type */}
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Pricing Type
              </label>
              <select
                value={projectType}
                onChange={(e) => {
                  setProjectType(e.target.value);
                  setPage(1);
                  updateURLParams({ projectType: e.target.value, page: 1 });
                }}
                className="w-full px-3 py-1.5 text-xs bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
              >
                <option value="all">All Types (Fixed & Hourly)</option>
                <option value="fixed-price">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  setPage(1);
                  updateURLParams({ experienceLevel: e.target.value, page: 1 });
                }}
                className="w-full px-3 py-1.5 text-xs bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
              >
                <option value="all">Any Experience Level</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <div className="text-xs text-content-muted py-1.5 italic">
                  Showing all active opportunities
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 text-xs text-content-muted">
        <span>
          Showing <strong>{jobs.length}</strong> of <strong>{totalItems}</strong> open projects
        </span>
        {category !== 'all' && (
          <span className="font-medium text-brand-600">
            Filtered by {MARKETPLACE_CATEGORIES.find((c) => c.slug === category)?.title}
          </span>
        )}
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton type="job" count={6} />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs match your criteria"
          description="Try broadening your search term or selecting a different category or pricing model."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Accessible Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={6}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default JobsPage;
