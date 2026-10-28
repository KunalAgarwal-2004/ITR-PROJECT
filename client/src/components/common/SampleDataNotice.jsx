import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Shown when a service fell back to bundled sample data because the API is unreachable,
 * so users never mistake demo listings for live marketplace data.
 */
export const SampleDataNotice = ({ show, className = '' }) => {
  if (!show) return null;

  return (
    <div
      role="status"
      className={`mb-6 p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        The server is currently unreachable, so you are viewing <strong>sample listings</strong>. Actions such as
        applying or hiring will not work until the connection is restored.
      </span>
    </div>
  );
};

export default SampleDataNotice;
