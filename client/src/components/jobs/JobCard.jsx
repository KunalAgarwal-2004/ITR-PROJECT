import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Briefcase, MapPin } from 'lucide-react';
import Button from '../common/Button';

export const JobCard = ({ job }) => {
  const isFixed = job.projectType.toLowerCase().includes('fixed');

  return (
    <div className="flex flex-col justify-between p-6 bg-surface-white border border-border rounded-md hover:border-brand-500 hover:shadow-card transition-all duration-200">
      <div>
        {/* Category & Posting Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            {job.categoryName}
          </span>
          <span className="text-xs text-content-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-content-subtle" /> Posted {job.postedTime}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/jobs/${job.id}`}
          className="text-base sm:text-lg font-semibold text-content-primary hover:text-brand-500 transition-colors block mb-2"
        >
          {job.title}
        </Link>

        {/* Description */}
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-sm bg-surface-muted border border-border text-xs font-medium text-content-primary"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-content-muted font-medium">
              +{job.skills.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Budget & Action Footer */}
      <div className="pt-4 border-t border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-sm border ${
              isFixed
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {job.projectType}
          </span>
          <span className="text-sm font-bold text-content-primary">
            {job.budgetDisplay}
          </span>
        </div>

        <Link to={`/jobs/${job.id}`}>
          <Button variant="primary" size="sm">
            View Job & Apply
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
