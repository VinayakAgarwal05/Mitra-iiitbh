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
  Building2,
  FileText,
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
      setDomains(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings', { params: { status: bookingFilter } });
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await api.get('/admin/issues', { params: { status: issueFilter } });
      setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setAuditLogs(res.data || []);
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
      setNotification({ type: 'success', message: 'Domain added to authorized whitelist.' });
      setNewDomain('');
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to add domain.' });
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!window.confirm('Revoke authorization for this email domain?')) return;
    try {
      await api.delete(`/admin/domains/${id}`);
      setNotification({ type: 'success', message: 'Domain revoked from whitelist.' });
      fetchDomains();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to delete domain.' });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      setNotification({
        type: 'success',
        message:
          status === 'approved'
            ? 'Reservation approved! This facility slot is now officially confirmed and displayed on the College Calendar.'
            : 'Reservation request has been rejected.',
      });
      fetchBookings();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Booking status update failed.' });
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
      setNotification({ type: 'success', message: 'Grievance lifecycle status updated.' });
      setActiveIssue(null);
      setIssueAdminNote('');
      fetchIssues();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to update issue status.' });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setNotification({ type: 'success', message: 'Institutional role updated successfully.' });
      fetchUsers();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to change role.' });
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete_target') => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { action });
      setNotification({ type: 'success', message: 'Moderation item resolved.' });
      fetchReports();
      fetchOverview();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Failed to resolve moderation case.' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center max-w-md mx-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <Lock className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Administrative Authorization Required</h2>
        <p className="text-xs text-slate-500 mt-1">
          This portal section is restricted to authorized institute administrative officers and faculty chairs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Administrative Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Institute governance, authorized email domains whitelist, facility reservation adjudications, student grievance redressal, and system audit logging.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shrink-0">
          Operator Role: <span className="font-bold text-brand-800 dark:text-brand-300 uppercase">{user?.role}</span>
        </div>
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
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        {[
          { key: 'metrics', label: 'Metrics Overview' },
          { key: 'domains', label: 'Email Domains' },
          { key: 'bookings', label: `Facility Bookings (${metrics?.pendingBookings || 0})` },
          { key: 'issues', label: `Student Grievances (${metrics?.pendingIssues || 0})` },
          { key: 'users', label: 'Student Accounts' },
          { key: 'reports', label: `Moderation Cases (${metrics?.pendingReports || 0})` },
          { key: 'audit', label: 'Security Audit' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-800 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: METRICS OVERVIEW */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Students</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {metrics.totalStudents}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.verifiedStudents} verified accounts
              </p>
            </div>

            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Bookings</p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 font-mono">
                {metrics.pendingBookings}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Requires approval</p>
            </div>

            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Open Grievances</p>
              <p className="text-2xl font-bold text-brand-700 dark:text-brand-300 mt-1 font-mono">
                {metrics.pendingIssues}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting investigation</p>
            </div>

            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Flagged Reports</p>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1 font-mono">
                {metrics.pendingReports}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Pending proctor review</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Career Path Rooms</span>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.activeRooms} Active
              </p>
            </div>
            <div className="p-3.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Study Materials Shared</span>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.totalMaterials} Files
              </p>
            </div>
            <div className="p-3.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Scheduled Events</span>
              <p className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {metrics.upcomingEvents} Events
              </p>
            </div>
            <div className="p-3.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Backend Storage</span>
              <p className="text-base font-bold text-brand-800 dark:text-brand-300 font-mono mt-0.5">
                SQLite / Postgres
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOMAIN WHITELIST */}
      {activeTab === 'domains' && (
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                Whitelisted College Email Domains
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Only students with authorized institutional email domains can register and receive verification codes.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddDomain} className="flex gap-2 max-w-md pt-1">
            <input
              type="text"
              required
              placeholder="e.g. iiitbh.ac.in or college.edu"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs transition-colors shrink-0"
            >
              Add Domain
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
            {domains.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                    @{d.domain}
                  </span>
                  <span className="text-slate-400 text-[11px]">Enrolled on {new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleDeleteDomain(d.id)}
                  title="Remove Domain"
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
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
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Facility & Club Slot Reservation Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Review and approve club activities or facility usages.</p>
            </div>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reservations found matching the specified filter.</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{b.club_or_society}</span>
                      <span className="text-slate-400">• By {b.student_name} ({b.student_email})</span>
                    </div>
                    <p className="font-semibold text-brand-800 dark:text-brand-300">{b.purpose}</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong>Facility:</strong> {b.facility_or_club} | <strong>Date:</strong> {b.slot_date} ({b.start_time} - {b.end_time})
                    </p>
                    <p className="text-slate-500 italic">"{b.description}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'approved')}
                          className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'rejected')}
                          className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${
                        b.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        {b.status}
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
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Grievance Tickets & Private Concerns
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage confidential student welfare and infrastructure complaints.</p>
            </div>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Tickets</option>
              <option value="submitted">Registered Only</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
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
                    className="px-3.5 py-1.5 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs transition-colors"
                  >
                    Adjudicate & Reply
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
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Adjudicate Grievance: {activeIssue.tracking_id}
              </h3>
              <button onClick={() => setActiveIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-md bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{activeIssue.title}</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{activeIssue.description}</p>
            </div>

            <form onSubmit={handleUpdateIssueStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Update Lifecycle Progression
                </label>
                <select
                  value={issueStatusUpdate}
                  onChange={(e) => setIssueStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="submitted">Registered</option>
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
                  placeholder="e.g. Campus maintenance team dispatched; repair inspection scheduled."
                  value={issueAdminNote}
                  onChange={(e) => setIssueAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveIssue(null)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs transition-colors"
                >
                  Save Progression & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered Student Directory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Modify role permissions or audit user credentials.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{usersList.length} Accounts</span>
          </div>

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
                    className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium"
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
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Flagged Reports & Moderation</h2>
              <p className="text-xs text-slate-500 mt-0.5">Content flagged for policy or academic violations.</p>
            </div>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No reported items currently pending moderation.</p>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-semibold uppercase text-rose-700 dark:text-rose-400">
                      Violation on {rep.target_type}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">"{rep.reason}"</p>
                    <span className="text-[11px] text-slate-400">Status: {rep.status}</span>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'delete_target')}
                        className="px-3 py-1 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs transition-colors"
                      >
                        Remove Target
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismiss')}
                        className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
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
        <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-700 dark:text-brand-400" />
              Security & Administrative Audit Log
            </h2>
            <span className="text-xs text-slate-400 font-mono">Immutable System Logs</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2 font-medium">Resource: {log.resource}</span>
                  {log.details && <span className="text-slate-400 ml-2 font-mono text-[11px]">{log.details}</span>}
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
