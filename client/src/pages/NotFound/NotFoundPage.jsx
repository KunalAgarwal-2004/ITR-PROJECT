import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide">404 Error</p>
      <h1 className="text-4xl font-bold text-content-primary mt-2 mb-4">Page not found</h1>
      <p className="text-base text-content-muted mb-8">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
