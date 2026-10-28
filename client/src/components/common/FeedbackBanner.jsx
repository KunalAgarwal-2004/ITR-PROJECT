import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const FeedbackBanner = ({
  type = 'success', // 'success' | 'error' | 'info'
  title,
  message,
  onDismiss,
  className = ''
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
    }
  };

  const config = configs[type] || configs.info;

  return (
    <div
      role="alert"
      className={`p-3.5 border rounded-md flex items-start justify-between gap-3 ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        {config.icon}
        <div>
          {title && <h4 className="text-xs font-bold">{title}</h4>}
          {message && <p className="text-xs leading-relaxed mt-0.5">{message}</p>}
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-content-muted hover:text-content-primary rounded-xs transition-colors"
          aria-label="Dismiss message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default FeedbackBanner;
