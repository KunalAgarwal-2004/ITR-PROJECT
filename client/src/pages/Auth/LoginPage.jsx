import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || null;

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await login({ email, password, rememberMe });
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'client') {
        navigate('/dashboard/client');
      } else {
        navigate('/dashboard/freelancer');
      }
    } catch (err) {
      setServerError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    if (redirectPath) {
      navigate(redirectPath);
    } else if (user?.role === 'freelancer') {
      navigate('/dashboard/freelancer');
    } else {
      navigate('/dashboard/client');
    }
  };

  const [forgotError, setForgotError] = useState('');

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotError('');
    setForgotSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-surface-white border border-border rounded-md p-8 shadow-card">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center text-white shadow-subtle">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-content-primary">
              Work<span className="text-brand-500">Bridge</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-content-primary">Sign in to your account</h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Access your client or freelancer dashboard
          </p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Google Identity Services Sign In Button with Account Chooser */}
        <GoogleAuthButton
          role="client"
          text="continue_with"
          disabled={isLoading}
          onSuccess={handleGoogleSuccess}
          onError={(msg) => setServerError(msg)}
        />

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-white px-3 text-content-muted">or sign in with email</span>
          </div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <PasswordInput
            id="login-password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            disabled={isLoading}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-content-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(true);
                setForgotSent(false);
              }}
              className="text-brand-600 hover:text-brand-700 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-content-muted">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            Create an account
          </Link>
        </div>

        {/* Demo Quick Hint with Autofill */}
        <div className="mt-4 p-3 bg-surface-muted rounded-md text-[11px] text-content-muted leading-relaxed">
          <p className="font-semibold text-content-primary mb-1">Quick Demo Accounts:</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('client.demo@example.com');
                setPassword('demopassword');
                if (errors.email) setErrors({ ...errors, email: null, password: null });
              }}
              className="px-2.5 py-1 bg-surface-white border border-border rounded text-[11px] font-medium text-brand-700 hover:border-brand-500 transition-colors"
            >
              Fill Demo Client
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('freelancer.demo@example.com');
                setPassword('demopassword');
                if (errors.email) setErrors({ ...errors, email: null, password: null });
              }}
              className="px-2.5 py-1 bg-surface-white border border-border rounded text-[11px] font-medium text-brand-700 hover:border-brand-500 transition-colors"
            >
              Fill Demo Freelancer
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your account email to receive a password recovery link."
        size="sm"
      >
        {forgotSent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-10 h-10 text-brand-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-content-primary">Reset instructions sent!</p>
            <p className="text-xs text-content-muted mt-1 mb-4">
              If an account exists for {forgotEmail}, instructions have been dispatched.
            </p>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setForgotModalOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              id="forgot-email"
              label="Account Email"
              type="email"
              placeholder="name@example.com"
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                if (forgotError) setForgotError('');
              }}
              error={forgotError}
              required
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" fullWidth>
                Send Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
