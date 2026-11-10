import React, { useState } from 'react';
import {
  User,
  Mail,
  Hash,
  BookOpen,
  Lock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Save,
  KeyRound,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile edit state
  const [academicYear, setAcademicYear] = useState(user?.academic_year || '1st Year');
  const [department, setDepartment] = useState(user?.department || 'Computer Science and Engineering');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setNotification(null);

    try {
      await api.put('/user/profile', {
        academic_year: academicYear,
        department,
      });
      setNotification({ type: 'success', message: 'Academic registration records updated successfully.' });
      await refreshUser();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to update academic details.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setNotification({ type: 'error', message: 'The confirmation password does not match the new password.' });
      return;
    }

    setUpdatingPassword(true);
    setNotification(null);

    try {
      await api.post('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setNotification({ type: 'success', message: 'Account password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to change password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
          <BadgeCheck className="w-3.5 h-3.5" />
          <span>Verified Student Dossier</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Manage your verified college registration data, departmental affiliation, and account security credentials.
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Verification Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">College Email</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.is_verified ? 'Verified Institutional' : 'Pending Verification'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Identity Privacy</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Masked on Public Boards
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Community Terms</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Compliant (Version 1.0)
            </p>
          </div>
        </div>
      </div>

      {/* Academic Affiliation Form */}
      <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Academic Registration & Department
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Official Student Directory Info</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Full Legal Name (Confidential)
            </label>
            <input
              type="text"
              disabled
              value={user?.full_name || ''}
              className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Institutional Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate (M.Tech/MS/PhD)">Postgraduate (M.Tech/MS/PhD)</option>
                <option value="Faculty / Staff">Faculty / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department / Discipline
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Computer Science and Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Electronics and Communication">Electronics & Communication Engineering (ECE)</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI (DSAI)</option>
                <option value="Mechatronics & Automation">Mechatronics & Automation</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Administration / Other">Administration / Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-4 py-2 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updatingProfile ? 'Saving...' : 'Save Academic Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Account Password & Security
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Encrypted with Bcrypt</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (Min 6 characters) *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
