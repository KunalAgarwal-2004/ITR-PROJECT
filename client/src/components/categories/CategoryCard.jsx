import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const CategoryCard = ({ category }) => {
  const IconComponent = category.icon;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group relative flex flex-col justify-between p-5 bg-surface-white border border-border rounded-md hover:border-brand-500 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200"
      aria-label={`Browse ${category.title} services`}
    >
      <div>
        {/* Thin Green Line Icon Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-md bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors duration-200">
            {IconComponent && <IconComponent className="w-5 h-5" strokeWidth={1.5} />}
          </div>
          <ArrowUpRight className="w-4 h-4 text-content-subtle opacity-0 group-hover:opacity-100 group-hover:text-brand-500 transition-all duration-200" />
        </div>

        <h3 className="text-base font-semibold text-content-primary mb-1.5 group-hover:text-brand-500 transition-colors">
          {category.title}
        </h3>

        <p className="text-xs sm:text-sm text-content-muted leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs text-content-muted">
        <span>{category.jobCount}</span>
        <span className="font-medium text-brand-600 opacity-90 group-hover:underline">
          Explore &rarr;
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
