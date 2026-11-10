import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ShieldAlert,
  Send,
  Upload,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  MapPin,
  Paperclip,
  Search,
  FileCheck,
  Shield,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const StudentIssuesPage: React.FC = () => {
  const { user, dailyUsage, refreshUser } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remainingIssuesToday, setRemainingIssuesToday] = useState<number>(2);

  // Form state
  const [category, setCategory] = useState('hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; trackingId?: string } | null>(null);

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/issues/my-submissions');
      setIssues(res.data.issues || []);
      if (res.data.dailyUsage) {
        setRemainingIssuesToday(res.data.dailyUsage.remaining);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingIssuesToday <= 0) {
      setNotification({
        type: 'error',
        message: 'Daily submission quota reached. A maximum of 2 grievance tickets may be submitted per calendar day.',
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title);
    formData.append('description', description);
    if (location) formData.append('location', location);
    if (attachment) formData.append('attachment', attachment);

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNotification({
        type: 'success',
        message: 'Grievance ticket successfully registered with campus administrative committee.',
        trackingId: res.data.trackingId,
      });

      setTitle('');
      setDescription('');
      setLocation('');
      setAttachment(null);
      setRemainingIssuesToday(res.data.remainingSubmissionsToday);
      await refreshUser();
      fetchMySubmissions();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit grievance.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            In Progress
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Registered
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Campus Grievance & Student Welfare Cell</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Issues & Private Concerns
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Confidential reporting channel for campus facilities, hostel maintenance, mess hygiene, and student welfare concerns directly to institutional authorities.
          </p>
        </div>

        {/* Quota box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 text-right shrink-0 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Daily Submission Limit
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
            <span className="font-mono text-brand-700 dark:text-brand-400 font-bold">
              {remainingIssuesToday}
            </span>
            <span className="text-slate-400"> / 2 remaining</span>
          </div>
        </div>
      </div>

      {/* Institutional Privacy Guarantee Banner */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Lock className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">Student Identity Protection:</strong> Submissions are anonymized against peer students. Dedicated tracking IDs ensure that college authorities can resolve issues and communicate directly through an encrypted internal thread without public disclosure.
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{notification.message}</p>
            {notification.trackingId && (
              <p className="mt-1 text-slate-800 dark:text-slate-200">
                Official Tracking Reference:{' '}
                <span className="font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {notification.trackingId}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Submission Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <FileCheck className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <span>Register a Confidential Grievance</span>
          </div>
          <span className="text-[11px] text-slate-500">Form Ref: SEC-ADM-04</span>
        </div>

        {remainingIssuesToday <= 0 ? (
          <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <strong>Daily Limit Exhausted (2/2):</strong> You have reached your allocated quota of 2 grievance tickets for today. To allow the administration to thoroughly inspect and resolve pending reports, new submissions will be permitted tomorrow at 00:00 IST.
          </div>
        ) : (
          <form onSubmit={handleSubmitIssue} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="hostel">Hostel Maintenance & Utilities</option>
                  <option value="mess">Mess & Dining Hygiene</option>
                  <option value="classroom">Classroom & Academic Infrastructure</option>
                  <option value="academic">Curriculum & Examination Inquiries</option>
                  <option value="infrastructure">Campus Wi-Fi & IT Infrastructure</option>
                  <option value="safety">Campus Safety & Medical Support</option>
                  <option value="admin">Administrative & Financial Services</option>
                  <option value="harassment">Harassment / Disciplinary Misconduct</option>
                  <option value="other">General Student Welfare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Specific Venue (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Block 2, Room 314, or Audi Hall A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grievance Title / Subject *
              </label>
              <input
                type="text"
                required
                placeholder="Concise summary of the grievance (min 5 characters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide comprehensive details: relevant dates, frequency of the issue, prior steps taken, or specific requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supporting Evidence / File (Optional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">Accepted formats: JPG, PNG, PDF, DOCX (Max 25MB)</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Registering...' : 'Submit Grievance Ticket'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Submitted Issues List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Your Registered Tickets ({issues.length})
          </h2>
          <span className="text-[11px] text-slate-500">Track and view authority replies</span>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-500 text-xs">
            No grievance tickets currently on file.
          </div>
        ) : (
          issues.map((item) => (
            <div
              key={item.id}
              className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-brand-500/50 dark:hover:border-brand-500/50"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {item.tracking_id}
                  </span>
                  {getStatusBadge(item.status)}
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h3>

                <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                  )}
                  <span>
                    Filed on {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/student-issues/${item.tracking_id}`}
                className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Track & Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
