import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search terms or filters to find what you are looking for.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-surface-white border border-border rounded-md ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-content-subtle mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-content-primary mb-1">{title}</h3>
      <p className="text-sm text-content-muted max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
