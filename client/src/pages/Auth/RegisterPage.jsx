import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { USER_ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === USER_ROLES.FREELANCER
    ? USER_ROLES.FREELANCER
    : USER_ROLES.CLIENT;

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-brand-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'You must accept the terms of service to create an account';
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
      const user = await register({ name, email, password, role });
      if (user.role === USER_ROLES.CLIENT) {
        navigate('/dashboard/client');
      } else {
        navigate('/dashboard/freelancer');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    if (user?.role === USER_ROLES.CLIENT) {
      navigate('/dashboard/client');
    } else {
      navigate('/dashboard/freelancer');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-surface-white border border-border rounded-md p-8 shadow-card">
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
          <h1 className="text-2xl font-bold text-content-primary">Create your account</h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Join WorkBridge as a hiring client or freelance professional
          </p>
        </div>

        {serverError && (
          <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Role Selection with Clear Explanations */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-content-primary uppercase tracking-wider mb-2">
            I want to join as:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(USER_ROLES.CLIENT)}
              className={`p-4 border rounded-md text-left transition-all ${
                role === USER_ROLES.CLIENT
                  ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                  : 'border-border hover:border-gray-300 bg-surface-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Briefcase className={`w-5 h-5 ${role === USER_ROLES.CLIENT ? 'text-brand-600' : 'text-content-subtle'}`} />
                {role === USER_ROLES.CLIENT && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <h3 className="text-sm font-bold text-content-primary">I'm a Client</h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                Post jobs, review proposals, hire top talent, and fund milestones.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRole(USER_ROLES.FREELANCER)}
              className={`p-4 border rounded-md text-left transition-all ${
                role === USER_ROLES.FREELANCER
                  ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                  : 'border-border hover:border-gray-300 bg-surface-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <UserCheck className={`w-5 h-5 ${role === USER_ROLES.FREELANCER ? 'text-brand-600' : 'text-content-subtle'}`} />
                {role === USER_ROLES.FREELANCER && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <h3 className="text-sm font-bold text-content-primary">I'm a Freelancer</h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                Build a specialized profile, submit bids, and earn money remotely.
              </p>
            </button>
          </div>
        </div>

        {/* Google Identity Services Sign Up Button with Account Chooser */}
        <GoogleAuthButton
          role={role}
          text="signup_with"
          disabled={isLoading}
          onSuccess={handleGoogleSuccess}
          onError={(msg) => setServerError(msg)}
        />

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-white px-3 text-content-muted">or register with email</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="signup-name"
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            error={errors.name}
            disabled={isLoading}
            required
          />

          <Input
            id="signup-email"
            label="Work Email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <div>
            <PasswordInput
              id="signup-password"
              label="Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
              disabled={isLoading}
              required
            />
            {/* Visual Password Strength Indicator */}
            {password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-content-muted uppercase">
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />

          {/* Terms Acceptance */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-content-primary">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: null });
                }}
                className="mt-0.5 w-4 h-4 rounded border-border text-brand-500 focus:ring-brand-500"
              />
              <span className="leading-relaxed text-content-muted">
                I agree to the WorkBridge{' '}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-content-primary underline hover:text-brand-600 inline"
                >
                  Terms of Service
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-content-primary underline hover:text-brand-600 inline"
                >
                  Privacy Policy
                </button>
                , and Escrow Agreement.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-red-600 mt-1">{errors.agreeTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            disabled={isLoading}
          >
            {isLoading
              ? 'Creating account...'
              : `Create Account as ${role === USER_ROLES.CLIENT ? 'Client' : 'Freelancer'}`}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-content-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            Log in instead
          </Link>
        </div>
      </div>

      {/* Accessible Terms Modal */}
      <Modal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="WorkBridge Marketplace Terms"
        description="Key terms governing contracts, payments, and mutual obligations on WorkBridge."
        size="md"
      >
        <div className="space-y-4 text-xs text-content-muted leading-relaxed">
          <div>
            <h4 className="font-bold text-content-primary mb-1">1. Milestone Escrow Protection</h4>
            <p>
              Clients deposit project funds into WorkBridge escrow prior to work commencement. Funds are strictly released upon milestone inspection and client sign-off.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-content-primary mb-1">2. Intellectual Property Rights</h4>
            <p>
              All deliverables, code, designs, and work products transfer to client ownership immediately upon full milestone payment settlement.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-content-primary mb-1">3. Dispute Resolution</h4>
            <p>
              In the event of milestone disagreements, our dedicated mediation team reviews project scopes, messages, and work history to ensure fair adjudication.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => {
                setAgreeTerms(true);
                setTermsModalOpen(false);
              }}
            >
              I Understand and Agree
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;
