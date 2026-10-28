import React from 'react';

export const PageContainer = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 ${className}`}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-content-muted mt-1 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
};

export default PageContainer;
