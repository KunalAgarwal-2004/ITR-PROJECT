import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '../../constants/categories';

export const Footer = () => {
  return (
    <footer className="bg-surface-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-content-primary">
                Work<span className="text-brand-500">Bridge</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-content-muted leading-relaxed max-w-sm mb-4">
              WorkBridge is the trusted freelance marketplace connecting enterprise clients, high-growth startups, and vetted freelance talent across 10 specialized disciplines.
            </p>
            <div className="flex items-center gap-4 text-xs text-content-muted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-500" /> Milestone Escrow
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> Vetted Specialists
              </span>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-content-muted">
              {MARKETPLACE_CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/categories/${cat.slug}`} className="hover:text-brand-500 transition-colors">
                    {cat.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/categories" className="text-brand-600 font-semibold hover:underline">
                  All 10 Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
              For Clients
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-content-muted">
              <li>
                <Link to="/freelancers" className="hover:text-brand-500 transition-colors">
                  Browse Specialists
                </Link>
              </li>
              <li>
                <Link to="/signup?role=client" className="hover:text-brand-500 transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/dashboard/client" className="hover:text-brand-500 transition-colors">
                  Client Workspace
                </Link>
              </li>
              <li>
                <Link to="/legal#escrow" className="hover:text-brand-500 transition-colors">
                  Payment Protection
                </Link>
              </li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary mb-3">
              For Freelancers
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-content-muted">
              <li>
                <Link to="/jobs" className="hover:text-brand-500 transition-colors">
                  Browse Open Jobs
                </Link>
              </li>
              <li>
                <Link to="/signup?role=freelancer" className="hover:text-brand-500 transition-colors">
                  Apply as Freelancer
                </Link>
              </li>
              <li>
                <Link to="/dashboard/freelancer" className="hover:text-brand-500 transition-colors">
                  Freelancer Workspace
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-brand-500 transition-colors">
                  In-Demand Skills
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-4">
          <p>&copy; {new Date().getFullYear()} WorkBridge Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/legal#privacy" className="hover:text-content-primary">Privacy Policy</Link>
            <Link to="/legal#terms" className="hover:text-content-primary">Terms of Service</Link>
            <Link to="/legal#escrow" className="hover:text-content-primary">Escrow Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
