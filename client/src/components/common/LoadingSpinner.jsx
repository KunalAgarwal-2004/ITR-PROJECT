import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-content-muted gap-2 ${className}`}>
      <Loader2 className={`${iconSizes[size]} text-brand-500 animate-spin`} />
      {text && <span className="text-xs font-medium tracking-wide">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
