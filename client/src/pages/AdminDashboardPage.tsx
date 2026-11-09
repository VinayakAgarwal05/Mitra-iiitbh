import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  Trash2,
  Check,
  X,
  Send,
  Activity,
  Globe,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'domains' | 'bookings' | 'issues' | 'users' | 'reports' | 'audit'>('metrics');

  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab Data
  const [domains, setDomains] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');

  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState('all');

  const [issues, setIssues] = useState<any[]>([]);
  const [issueFilter, setIssueFilter] = useState('all');
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [issueStatusUpdate, setIssueStatusUpdate] = useState('under_review');
  const [issueAdminNote, setIssueAdminNote] = useState('');

  const [usersList, setUsersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setMetrics(res.data.metrics);
      setAuditLogs(res.data.recentLogs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const res = await api.get('/admin/domains');
      setDomains(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings', { params: { status: bookingFilter } });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await api.get('/admin/issues', { params: { status: issueFilter } });
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'domains') fetchDomains();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'issues') fetchIssues();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, bookingFilter, issueFilter]);

  // Actions
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      await api.post('/admin/domains', { domain: newDomain });
      setNotification({ type: 'success', message: 'Domain whitelisted successfully.' });
      setNewDomain('');
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to add domain.' });
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!window.confirm('Remove this domain from whitelist?')) return;
    try {
      await api.delete(`/admin/domains/${id}`);
      setNotification({ type: 'success', message: 'Domain removed.' });
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to delete domain.' });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      setNotification({ type: 'success', message: `Booking marked as ${status}.` });
      fetchBookings();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Action failed.' });
    }
  };

  const handleUpdateIssueStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;
    try {
      await api.patch(`/admin/issues/${activeIssue.id}/status`, {
        status: issueStatusUpdate,
        note: issueAdminNote,
      });
      setNotification({ type: 'success', message: 'Issue status & confidential note updated.' });
      setActiveIssue(null);
      setIssueAdminNote('');
      fetchIssues();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Update failed.' });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setNotification({ type: 'success', message: 'User role updated successfully.' });
      fetchUsers();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Role update failed.' });
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete_target') => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { action });
      setNotification({ type: 'success', message: 'Report resolved.' });
      fetchReports();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to resolve report.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 mt-1">
          You do not have administrative privileges to view or manage the college control panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Administrative Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform governance, email domain verification, issue resolution, booking approvals, and audit logs.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
          Role: {user?.role.toUpperCase()}
        </span>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { key: 'metrics', label: 'Overview Metrics' },
          { key: 'domains', label: 'Email Domains' },
          { key: 'bookings', label: `Bookings (${metrics?.pendingBookings || 0} Pending)` },
          { key: 'issues', label: `Student Issues (${metrics?.pendingIssues || 0})` },
          { key: 'users', label: 'User Directory' },
          { key: 'reports', label: `Reported Content (${metrics?.pendingReports || 0})` },
          { key: 'audit', label: 'Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: METRICS OVERVIEW */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Total Registered Students</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {metrics.totalStudents}
              </p>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">
                {metrics.verifiedStudents} verified accounts
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Pending Booking Requests</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {metrics.pendingBookings}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Requires approval</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Pending Student Concerns</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 font-mono">
                {metrics.pendingIssues}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Under review / in progress</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium">Reported Moderation Items</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                {metrics.pendingReports}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Flagged materials/posts</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs text-slate-500">Active Career Rooms</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.activeRooms}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs text-slate-500">Study Materials Shared</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.totalMaterials}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs text-slate-500">Upcoming Calendar Events</span>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.upcomingEvents}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-xs text-slate-500">Database Engine</span>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                PostgreSQL / SQLite
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOMAIN WHITELIST */}
      {activeTab === 'domains' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                Whitelisted College Email Domains
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Only students with these email domains are allowed to register accounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddDomain} className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              required
              placeholder="e.g. iiitbh.ac.in or college.edu"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
            >
              Add Domain
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-3">
            {domains.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg">
                    @{d.domain}
                  </span>
                  <span className="text-slate-400">Added on {new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleDeleteDomain(d.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS APPROVAL */}
      {activeTab === 'bookings' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Facility Booking Requests
            </h2>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No bookings match the filter.</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{b.club_or_society}</span>
                      <span className="text-slate-400">• By {b.student_name} ({b.student_email})</span>
                    </div>
                    <p className="font-semibold text-teal-600 dark:text-teal-400">{b.purpose}</p>
                    <p className="text-slate-500">
                      <strong>Facility:</strong> {b.facility_or_club} | <strong>Date:</strong> {b.slot_date} ({b.start_time} - {b.end_time})
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{b.description}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold capitalize text-slate-500">
                        Status: {b.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT ISSUES REVIEW */}
      {activeTab === 'issues' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Grievances & Concern Tickets
            </h2>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Issues</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                      {iss.tracking_id}
                    </span>
                    <span className="font-semibold uppercase text-slate-500">{iss.category}</span>
                    <span className="text-slate-400">• {new Date(iss.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{iss.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{iss.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveIssue(iss);
                      setIssueStatusUpdate(iss.status);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
                  >
                    Review & Respond
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Issue Modal */}
      {activeIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Review Issue: {activeIssue.tracking_id}
              </h3>
              <button onClick={() => setActiveIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{activeIssue.title}</p>
              <p className="text-slate-600 dark:text-slate-400">{activeIssue.description}</p>
            </div>

            <form onSubmit={handleUpdateIssueStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Update Lifecycle Status
                </label>
                <select
                  value={issueStatusUpdate}
                  onChange={(e) => setIssueStatusUpdate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confidential Administrative Note (visible to student on tracking thread)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Maintenance technician dispatched; resolution expected by 2 PM."
                  value={issueAdminNote}
                  onChange={(e) => setIssueAdminNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveIssue(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                >
                  Save Status & Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Student Accounts</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {usersList.map((u) => (
              <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p>
                  <p className="text-slate-500 font-mono">{u.email} • ID: {u.roll_number}</p>
                  <p className="text-slate-400">{u.department} • {u.academic_year}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="representative">Representative</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Flagged Reports & Moderation</h2>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reported content pending moderation.</p>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-semibold uppercase text-rose-600">
                      Report on {rep.target_type}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">"{rep.reason}"</p>
                    <span className="text-[11px] text-slate-400">Status: {rep.status}</span>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'delete_target')}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs"
                      >
                        Remove Target
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                        className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Security & System Audit Trail
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{log.action}</span>
                  <span className="text-slate-500 ml-2">Resource: {log.resource}</span>
                  {log.details && <span className="text-slate-400 ml-2 font-mono">{log.details}</span>}
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
