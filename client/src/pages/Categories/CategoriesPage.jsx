import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import CategoryCard from '../../components/categories/CategoryCard';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';

export const CategoriesPage = () => {
  const [search, setSearch] = useState('');

  const filteredCategories = MARKETPLACE_CATEGORIES.filter((cat) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.sampleSkills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <PageContainer
      title="All Marketplace Service Categories"
      subtitle="Discover top-tier freelance talent and active project opportunities across our 10 specialized professional domains."
      breadcrumbs={
        <nav className="text-xs text-content-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">Home</Link>
          <span>/</span>
          <span className="text-content-primary font-medium">Categories</span>
        </nav>
      }
    >
      {/* Category search bar */}
      <div className="max-w-md mb-8">
        <div className="relative">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter categories or skills (e.g., Python, CAD, Legal)..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface-white border border-border rounded-md text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="p-8 text-center bg-surface-white border border-border rounded-md">
          <p className="text-sm text-content-muted">No categories match your search term "{search}".</p>
          <button
            onClick={() => setSearch('')}
            className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default CategoriesPage;
