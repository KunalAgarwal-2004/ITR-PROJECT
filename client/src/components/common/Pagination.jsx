import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 6,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array (with ellipsis if needed)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border ${className}`}
      aria-label="Pagination Navigation"
    >
      <div className="text-xs text-content-muted">
        Showing <span className="font-semibold text-content-primary">{startItem}</span> to{' '}
        <span className="font-semibold text-content-primary">{endItem}</span> of{' '}
        <span className="font-semibold text-content-primary">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-sm border border-border bg-surface-white text-content-primary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-xs text-content-muted">
                ...
              </span>
            );
          }

          const isCurrent = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                isCurrent
                  ? 'bg-brand-500 border-brand-500 text-white font-semibold'
                  : 'bg-surface-white border-border text-content-primary hover:bg-gray-50'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${pageNum}`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-sm border border-border bg-surface-white text-content-primary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
