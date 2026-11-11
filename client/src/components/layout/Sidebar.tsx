import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  User,
  FileText,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout, dailyUsage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Career Path Rooms', path: '/career-rooms', icon: Briefcase },
    { name: 'Study Materials', path: '/study-materials', icon: BookOpen },
    { name: 'College Contacts', path: '/contacts', icon: Users },
    { name: 'Campus Calendar', path: '/calendar', icon: Calendar },
    { name: 'Facility Booking', path: '/slot-booking', icon: Clock },
    { name: 'Student Connect', path: '/student-connect', icon: MessageSquare },
    { name: 'Grievance & Issues', path: '/student-issues', icon: AlertCircle },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    { name: 'Regulations & Terms', path: '/terms', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Institutional Branding Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/images/iiitbh_logo.png"
              alt="IIIT Bhagalpur Crest"
              className="w-10 h-10 object-contain bg-white p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h1 className="font-bold text-xs tracking-tight text-slate-900 dark:text-white uppercase truncate">
                IIIT Bhagalpur
              </h1>
              <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-400 truncate">
                Mitra • College Connect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Campus Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-semibold border-l-3 border-blue-700 dark:border-blue-500'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Administration
              </div>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold border-l-3 border-slate-800 dark:border-slate-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>Admin Command Center</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Daily Quota Tracking (Structured & Professional) */}
        {dailyUsage && (
          <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300">
              <span>Daily Student Allowances</span>
              <span className="font-mono text-[10px] text-slate-400 font-normal">Resets 00:00 IST</span>
            </div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[10px]">
                  <span>Career Rooms</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                    {dailyUsage.careerRoom?.remaining ?? 10}/10 left
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(((dailyUsage.careerRoom?.used ?? 0)) / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[10px]">
                  <span>Student Connect</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                    {dailyUsage.studentConnect?.remaining ?? 10}/10 left
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-slate-600 dark:bg-slate-400 h-full rounded-full transition-all"
                    style={{ width: `${(((dailyUsage.studentConnect?.used ?? 0)) / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[10px]">
                  <span>Private Issues</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
                    {dailyUsage.studentIssue?.remaining ?? 2}/2 left
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all"
                    style={{ width: `${(((dailyUsage.studentIssue?.used ?? 0)) / 2) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Footer Profile & Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.department || 'Student'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={toggleTheme}
                title="Toggle Theme"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
