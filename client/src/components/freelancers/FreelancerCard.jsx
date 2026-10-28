import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export const FreelancerCard = ({ freelancer }) => {
  return (
    <div className="flex flex-col justify-between p-6 bg-surface-white border border-border rounded-md hover:border-brand-500 hover:shadow-card transition-all duration-200">
      <div>
        {/* Header: Avatar, Name, Rate */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center shrink-0">
              {freelancer.avatarInitials}
            </div>
            <div>
              <Link
                to={`/freelancers/${freelancer.id}`}
                className="text-base font-semibold text-content-primary hover:text-brand-500 transition-colors flex items-center gap-1.5"
              >
                {freelancer.name}
              </Link>
              <span className="text-xs text-content-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-content-subtle" /> {freelancer.location}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-base font-bold text-content-primary">{formatCurrency(freelancer.hourlyRate)}</span>
            <span className="text-xs text-content-muted block">/ hr</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-brand-600 mb-2 line-clamp-1">
          {freelancer.title}
        </p>

        {/* Short Bio */}
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed line-clamp-2 mb-4">
          {freelancer.bio}
        </p>

        {/* Skills Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {freelancer.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-sm bg-surface-muted border border-border text-xs font-medium text-content-primary"
            >
              {skill}
            </span>
          ))}
          {freelancer.skills.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-content-muted font-medium">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Rating, Jobs, Profile Link */}
      <div className="pt-4 border-t border-border-light flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-content-muted">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-content-primary">{freelancer.rating}</span>
          <span>({freelancer.reviewsCount})</span>
        </div>

        <Link to={`/freelancers/${freelancer.id}`}>
          <Button variant="secondary" size="sm">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FreelancerCard;
