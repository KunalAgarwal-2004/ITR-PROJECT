import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, role, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleQuickDemoLogin = async (demoRole) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await login({
        email: demoRole === 'client' ? 'client.demo@example.com' : 'freelancer.demo@example.com',
        password: 'demopassword',
        rememberMe: true
      });
      navigate(demoRole === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
    } catch (err) {
      setLoginError(err.message || 'Demo login failed. Please sign in via the login page.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Not authenticated
  if (!isAuthenticated) {
    const targetRole = allowedRoles?.[0] || 'client';
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface-white border border-border rounded-md text-center shadow-card">
        <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-content-primary mb-2">Sign In Required</h2>
        <p className="text-xs sm:text-sm text-content-muted mb-6 leading-relaxed">
          The <strong>{targetRole === 'client' ? 'Client Workspace' : 'Freelancer Workspace'}</strong> requires an active session. You can sign in, register, or use one-click demo access below.
        </p>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="md"
            onClick={() => handleQuickDemoLogin(targetRole)}
            disabled={isLoggingIn}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoggingIn
              ? 'Authenticating...'
              : `One-Click Demo Access as ${targetRole === 'client' ? 'Client' : 'Freelancer'}`}
          </Button>

          <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`} className="block">
            <Button variant="secondary" fullWidth size="md">
              Sign In with Email
            </Button>
          </Link>

          <Link to={`/signup?role=${targetRole}`} className="block">
            <Button variant="ghost" fullWidth size="md">
              Create an Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface-white border border-border rounded-md text-center shadow-card">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-content-primary mb-2">Role Restricted Area</h2>
        <p className="text-xs sm:text-sm text-content-muted mb-6 leading-relaxed">
          This workspace is configured for <strong>{allowedRoles.join(' or ')}</strong> accounts. You are currently browsing as a <strong>{role}</strong>.
        </p>
        <div className="space-y-3">
          <Link to={role === 'client' ? '/dashboard/client' : '/dashboard/freelancer'} className="block">
            <Button variant="primary" fullWidth size="md">
              Switch to Your {role === 'client' ? 'Client' : 'Freelancer'} Workspace
            </Button>
          </Link>
          <Button
            variant="secondary"
            fullWidth
            size="md"
            onClick={() => handleQuickDemoLogin(allowedRoles[0])}
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? 'Switching...'
              : `Switch to Demo ${allowedRoles[0] === 'client' ? 'Client' : 'Freelancer'}`}
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
