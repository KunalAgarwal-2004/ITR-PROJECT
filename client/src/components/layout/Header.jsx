import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isClient, isFreelancer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-brand-500 ${
      isActive ? 'text-brand-500 font-semibold' : 'text-content-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-surface-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Primary Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center text-white shadow-subtle">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-content-primary">
                Work<span className="text-brand-500">Bridge</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/categories" className={navLinkClass}>
                Categories
              </NavLink>
              <NavLink to="/freelancers" className={navLinkClass}>
                Find Talent
              </NavLink>
              <NavLink to="/jobs" className={navLinkClass}>
                Find Work
              </NavLink>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isClient && (
                  <Link to="/dashboard/client">
                    <Button variant="ghost" size="sm">
                      Client Workspace
                    </Button>
                  </Link>
                )}
                {isFreelancer && (
                  <Link to="/dashboard/freelancer">
                    <Button variant="ghost" size="sm">
                      Freelancer Workspace
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <span className="text-xs font-semibold text-content-primary">
                    {user?.name || 'Account'}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-content-muted hover:text-red-600 transition-colors rounded-sm"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="secondary" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/signup?role=client">
                  <Button variant="primary" size="sm">
                    Post a Job
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-content-primary hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <NavLink
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-content-primary hover:text-brand-500"
          >
            Categories
          </NavLink>
          <NavLink
            to="/freelancers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-content-primary hover:text-brand-500"
          >
            Find Talent
          </NavLink>
          <NavLink
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-content-primary hover:text-brand-500"
          >
            Find Work
          </NavLink>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={isClient ? '/dashboard/client' : '/dashboard/freelancer'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="secondary" fullWidth size="md">
                    Workspace Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth size="md" onClick={handleLogout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth size="md">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth size="md">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
