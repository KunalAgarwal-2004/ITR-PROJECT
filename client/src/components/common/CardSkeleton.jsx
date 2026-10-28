import React from 'react';

/**
 * Reusable CardSkeleton for smooth loading states on Job & Freelancer listings
 */
export const CardSkeleton = ({ type = 'job', count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-surface-white border border-border rounded-md p-6 shadow-card animate-pulse space-y-4"
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {type === 'freelancer' ? (
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-md bg-gray-200 shrink-0" />
              )}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>

          {/* Body Lines */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-4/5 bg-gray-100 rounded" />
          </div>

          {/* Badges / Skills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="h-6 w-16 bg-gray-100 rounded-sm" />
            <div className="h-6 w-20 bg-gray-100 rounded-sm" />
            <div className="h-6 w-14 bg-gray-100 rounded-sm" />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
};

export default CardSkeleton;
