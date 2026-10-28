import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Star, MapPin } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import FreelancerCard from '../../components/freelancers/FreelancerCard';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CardSkeleton from '../../components/common/CardSkeleton';
import Button from '../../components/common/Button';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';
import freelancerService from '../../services/freelancerService';

const QUICK_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'Figma',
  'Large Language Models',
  'SEO Strategy',
  'AutoCAD',
  'Financial Modeling'
];

export const FreelancersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State initialization
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSort = searchParams.get('sort') || 'relevance';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [maxRate, setMaxRate] = useState(searchParams.get('maxRate') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [freelancers, setFreelancers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync state to URL params
  const updateURLParams = (updated = {}) => {
    const params = new URLSearchParams();
    const newCategory = updated.category !== undefined ? updated.category : category;
    const newSearch = updated.search !== undefined ? updated.search : search;
    const newSort = updated.sortBy !== undefined ? updated.sortBy : sortBy;
    const newPage = updated.page !== undefined ? updated.page : page;
    const newMaxRate = updated.maxRate !== undefined ? updated.maxRate : maxRate;
    const newAvailability = updated.availability !== undefined ? updated.availability : availability;
    const newMinRating = updated.minRating !== undefined ? updated.minRating : minRating;

    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (newSearch) params.set('search', newSearch);
    if (newSort && newSort !== 'relevance') params.set('sort', newSort);
    if (newPage > 1) params.set('page', newPage.toString());
    if (newMaxRate) params.set('maxRate', newMaxRate);
    if (newAvailability && newAvailability !== 'all') params.set('availability', newAvailability);
    if (newMinRating) params.set('minRating', newMinRating);

    setSearchParams(params);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTalent = async () => {
      setIsLoading(true);
      try {
        const res = await freelancerService.getFreelancers({
          search,
          category,
          maxRate: maxRate ? Number(maxRate) : undefined,
          availability: availability !== 'all' ? availability : undefined,
          minRating: minRating ? Number(minRating) : undefined,
          sortBy,
          page,
          limit: 6
        });
        if (isMounted) {
          setFreelancers(res.data);
          setTotalItems(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load freelancers:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTalent();

    return () => {
      isMounted = false;
    };
  }, [search, category, maxRate, availability, minRating, sortBy, page]);

  const handleSearchSubmit = (val) => {
    setSearch(val);
    setPage(1);
    updateURLParams({ search: val, page: 1 });
  };

  const handleQuickSkill = (skill) => {
    setSearch(skill);
    setPage(1);
    updateURLParams({ search: skill, page: 1 });
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
    setMaxRate('');
    setAvailability('all');
    setMinRating('');
    setSortBy('relevance');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || category !== 'all' || maxRate || availability !== 'all' || minRating;

  return (
    <PageContainer
      title="Browse Verified Freelance Talent"
      subtitle="Discover pre-vetted specialists in engineering, AI, design, marketing, and business operations."
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">Freelancers</span>
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
            placeholder="Search by skill (e.g., React, Python), name, or role..."
            className="flex-1"
          />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 md:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full md:w-48 pl-3 pr-8 py-2 text-xs font-medium bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary cursor-pointer"
                aria-label="Sort talent by"
              >
                <option value="relevance">Sort: Recommended</option>
                <option value="rate_asc">Rate: Low to High</option>
                <option value="rate_desc">Rate: High to Low</option>
                <option value="rating_desc">Highest Rated (★ 5.0)</option>
                <option value="jobs_desc">Most Completed Jobs</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center justify-center gap-2"
              aria-label="Toggle filter options"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Quick Skill Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-content-muted">
          <span className="font-semibold text-content-primary mr-1">Skills:</span>
          {QUICK_SKILLS.map((skill) => {
            const isSelected = search.toLowerCase() === skill.toLowerCase();
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleQuickSkill(isSelected ? '' : skill)}
                className={`px-2.5 py-1 rounded-sm border text-xs transition-colors ${
                  isSelected
                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                    : 'bg-surface-white border-border text-content-primary hover:border-brand-500 hover:text-brand-600'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>

        {/* Filter Controls (Collapsible on mobile, always visible on md+) */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} md:block pt-3 border-t border-border`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Discipline
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
              >
                <option value="all">All 10 Disciplines</option>
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Hourly Rate */}
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Max Hourly Rate ($/hr)
              </label>
              <select
                value={maxRate}
                onChange={(e) => {
                  setMaxRate(e.target.value);
                  setPage(1);
                  updateURLParams({ maxRate: e.target.value, page: 1 });
                }}
                className="w-full px-3 py-1.5 text-xs bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
              >
                <option value="">Any Hourly Rate</option>
                <option value="50">Up to $50/hr</option>
                <option value="75">Up to $75/hr</option>
                <option value="100">Up to $100/hr</option>
                <option value="150">Up to $150/hr</option>
              </select>
            </div>

            {/* Minimum Client Rating */}
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Minimum Client Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(1);
                  updateURLParams({ minRating: e.target.value, page: 1 });
                }}
                className="w-full px-3 py-1.5 text-xs bg-surface-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 text-content-primary"
              >
                <option value="">Any Rating</option>
                <option value="4.95">★ 4.95 & above</option>
                <option value="4.9">★ 4.90 & above</option>
                <option value="4.8">★ 4.80 & above</option>
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
                  Showing all verified talent
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 text-xs text-content-muted">
        <span>
          Showing <strong>{freelancers.length}</strong> of <strong>{totalItems}</strong> matching specialists
        </span>
        {category !== 'all' && (
          <span className="font-medium text-brand-600">
            Filtered by {MARKETPLACE_CATEGORIES.find((c) => c.slug === category)?.title}
          </span>
        )}
      </div>

      {/* Talent Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton type="freelancer" count={6} />
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          title="No freelancers match your criteria"
          description="Try broadening your search term or adjusting your hourly rate and rating filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
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

export default FreelancersPage;
