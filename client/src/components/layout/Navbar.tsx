import React from 'react';
import { Menu, Shield, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { user, dailyUsage } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Private College Network
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            • Verified students only
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick status pill */}
        {dailyUsage && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span>Career Msgs: </span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {dailyUsage.careerRoom.remaining}/10
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Connect: </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {dailyUsage.studentConnect.remaining}/10
            </span>
          </div>
        )}

        <Link
          to="/terms"
          title="Privacy Policy & Community Guidelines"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>

        {/* User preview */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white text-[11px] font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
            {user?.full_name}
          </span>
        </Link>
      </div>
    </header>
  );
};
