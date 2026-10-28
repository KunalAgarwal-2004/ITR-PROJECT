import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  DollarSign,
  Settings,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const DashboardSidebar = ({ activeTab, onSelectTab }) => {
  const { user, isClient, logout } = useAuth();

  const clientNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'My Postings', icon: Briefcase },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'contracts', label: 'Contracts', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const freelancerNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'proposals', label: 'My Bids', icon: FileText },
    { id: 'contracts', label: 'Contracts', icon: Briefcase },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const items = isClient ? clientNav : freelancerNav;

  return (
    <>
      {/* Mobile & Tablet Horizontal Tab Bar */}
      <div className="w-full md:hidden bg-surface-white border border-border rounded-md p-2 shadow-subtle mb-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200'
                    : 'text-content-muted hover:text-content-primary hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-content-subtle'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex w-64 bg-surface-white border border-border rounded-md p-4 shrink-0 flex-col justify-between self-start shadow-subtle">
        <div>
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'WB'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-content-primary truncate">
                {user?.name || 'Workspace Account'}
              </h4>
              <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-brand-50 text-brand-700 border border-brand-200 mt-0.5">
                {isClient ? 'Client Account' : 'Freelancer'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-content-muted hover:text-content-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-content-subtle'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 mt-6 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
