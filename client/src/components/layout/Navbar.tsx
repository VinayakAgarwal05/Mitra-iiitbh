import React from 'react';
import { Menu, Shield, HelpCircle, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { user, dailyUsage } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Toggle navigation sidebar menu"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseSlow" />
            <span>IIITBH INTRANET</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Permanent Campus • Sabour
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Remaining Quotas Status */}
        {dailyUsage && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            <span>Career Msgs:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
              {dailyUsage.careerRoom.remaining}/10
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Connect:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {dailyUsage.studentConnect.remaining}/10
            </span>
          </div>
        )}

        <Link
          to="/terms"
          title="Community Guidelines & Policy"
          aria-label="Community Guidelines and Student Code of Conduct"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* User Account Pill */}
        <Link
          to="/profile"
          aria-label={`View user profile for ${user?.full_name || 'student'}`}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center text-[11px] font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
            {user?.full_name}
          </span>
        </Link>
      </div>
    </header>
  );
};
