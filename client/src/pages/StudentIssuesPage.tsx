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

  // Status search / track state
  const [trackQuery, setTrackQuery] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string; trackingId?: string } | null>(null);

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/issues/my-submissions');
      setIssues(res.data.issues);
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
        message: 'Daily submission limit reached! You can submit up to 2 issues per day.',
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
        message: 'Your concern has been registered privately with the college administration.',
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
        message: err.response?.data?.error || 'Failed to submit issue.',
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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            In Progress
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Student Issues & Private Concerns
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Privately report campus, hostel, mess, or safety concerns directly to authorized authorities.
          </p>
        </div>

        {/* Daily limit badge */}
        <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Daily Limit
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Allowance:{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                {remainingIssuesToday} / 2 left today
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-3">
        <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Privacy Assurance:</strong> Your student identity is strictly masked from other students. An internal privacy-preserving audit mapping is maintained for administrative resolution to prevent abuse while ensuring your concerns are addressed by official authorities.
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-start gap-2 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div>
            <p>{notification.message}</p>
            {notification.trackingId && (
              <p className="mt-1 font-semibold text-xs">
                Your Unique Tracking ID:{' '}
                <span className="font-mono underline text-slate-900 dark:text-white">
                  {notification.trackingId}
                </span>{' '}
                (Use this to check progress anytime)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submission Form Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Submit a Confidential Concern
        </h2>

        {remainingIssuesToday <= 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            <strong>Daily limit reached (2/2)!</strong> You have reached your maximum of 2 student issue submissions for today. This helps ensure each case receives prompt administrative attention. Please check back tomorrow.
          </div>
        ) : (
          <form onSubmit={handleSubmitIssue} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                >
                  <option value="hostel">Hostel Accommodation & Maintenance</option>
                  <option value="mess">Mess & Food Hygiene</option>
                  <option value="classroom">Classroom & Lab Facilities</option>
                  <option value="academic">Academic & Examination Concerns</option>
                  <option value="faculty">Faculty or Teaching Grievance</option>
                  <option value="infrastructure">Campus Infrastructure & Wi-Fi</option>
                  <option value="harassment">Harassment or Misconduct (High Priority)</option>
                  <option value="safety">Campus Safety & Security</option>
                  <option value="admin">Administrative Difficulties</option>
                  <option value="other">Other Welfare Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Specific Block (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Block 2, Room 314, or Audi Hall A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Summary / Title *
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue (min 5 characters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Please describe the incident or problem in detail (dates, frequency, what happened)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supporting Photo or Document (Optional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
                onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Registering...' : 'Submit Issue Anonymously'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* My Submissions & Tracking List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Your Submitted Issues ({issues.length})
        </h2>

        {issues.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-400 text-xs">
            You have not submitted any issues.
          </div>
        ) : (
          issues.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                    {item.tracking_id}
                  </span>
                  {getStatusBadge(item.status)}
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                  )}
                  <span>
                    Submitted on {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <Link
                to={`/student-issues/${item.tracking_id}`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
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
