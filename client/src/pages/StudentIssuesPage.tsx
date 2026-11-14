import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
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
  ThumbsUp,
  MessageSquare,
  Filter,
  Sparkles,
  UserCheck,
  HelpCircle,
  Flame,
  Plus,
  X,
  Hourglass,
  Layers,
  Building,
  Utensils,
  Wifi,
  GraduationCap,
  HeartPulse,
} from 'lucide-react';
import api, { getSocketUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/common/ScrollReveal';

type IssueCategory =
  | 'all'
  | 'hostel'
  | 'mess'
  | 'infrastructure'
  | 'classroom'
  | 'academic'
  | 'safety'
  | 'other';

const CATEGORIES: { id: IssueCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Concerns', icon: Layers },
  { id: 'hostel', label: 'Hostel Maintenance', icon: Building },
  { id: 'mess', label: 'Mess & Dining', icon: Utensils },
  { id: 'infrastructure', label: 'Wi-Fi & IT Systems', icon: Wifi },
  { id: 'classroom', label: 'Labs & Classrooms', icon: Sparkles },
  { id: 'academic', label: 'Academic & Exams', icon: GraduationCap },
  { id: 'safety', label: 'Campus Safety & Health', icon: HeartPulse },
];

const PRESET_QUICK_ISSUES = [
  {
    category: 'hostel',
    title: 'Water filter cartridge replacement needed in Hostel 2',
    desc: 'The RO drinking water dispenser on second floor is dispensing murky water with very low pressure.',
    loc: 'Hostel Block 2, 2nd Floor',
  },
  {
    category: 'infrastructure',
    title: 'Wi-Fi router packet drop during peak hours (8 PM - 11 PM)',
    desc: 'Wi-Fi connection repeatedly disconnects and packet loss exceeds 40% every evening.',
    loc: 'Academic Block 1 & Library Wing',
  },
  {
    category: 'mess',
    title: 'Evening snacks and tea timing inconsistency',
    desc: 'Mess snacks are frequently running out within 20 minutes of opening. Requesting adequate portioning.',
    loc: 'Central Student Dining Hall',
  },
  {
    category: 'classroom',
    title: 'Projector HDMI port flickering in Lecture Hall 3',
    desc: 'Display feed flickers to black during faculty slides and student presentations in LH-3.',
    loc: 'Lecture Hall Complex, LH-3',
  },
];

export const StudentIssuesPage: React.FC = () => {
  const { user, token, dailyUsage, refreshUser } = useAuth();
  const [communityIssues, setCommunityIssues] = useState<any[]>([]);
  const [myIssues, setMyIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'community' | 'my-tickets'>('community');
  const [remainingIssuesToday, setRemainingIssuesToday] = useState<number>(2);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'most_upvoted'>('recent');

  // Modal / Form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [category, setCategory] = useState('hostel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    trackingId?: string;
  } | null>(null);

  const fetchCommunityIssues = async () => {
    try {
      const res = await api.get('/issues', {
        params: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchQuery.trim() || undefined,
          sort: sortBy,
        },
      });
      setCommunityIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCommunityIssues([]);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/issues/my-submissions');
      setMyIssues(res.data.issues || []);
      if (res.data.dailyUsage) {
        setRemainingIssuesToday(res.data.dailyUsage.remaining);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchCommunityIssues(), fetchMySubmissions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [selectedCategory, selectedStatus, sortBy]);

  // Listen for real-time issues and reaction updates
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_campus_issue', (newIssue: any) => {
      fetchCommunityIssues();
    });

    socket.on('issue_reaction_updated', ({ issue_id, upvotes_count }: any) => {
      setCommunityIssues((prev) =>
        prev.map((iss) => (iss.id === issue_id ? { ...iss, upvotes_count } : iss))
      );
    });

    socket.on('issue_message_broadcast', ({ issue_id }: any) => {
      setCommunityIssues((prev) =>
        prev.map((iss) =>
          iss.id === issue_id ? { ...iss, responses_count: (iss.responses_count || 0) + 1 } : iss
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Handle instant upvote / Me Too reaction
  const handleToggleReaction = async (e: React.MouseEvent, issueId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setCommunityIssues((prev) =>
      prev.map((iss) => {
        if (iss.id === issueId) {
          const currentlyReacted = !!iss.has_upvoted;
          return {
            ...iss,
            has_upvoted: !currentlyReacted,
            upvotes_count: Math.max(0, (iss.upvotes_count || 0) + (!currentlyReacted ? 1 : -1)),
          };
        }
        return iss;
      })
    );

    try {
      const res = await api.post(`/issues/${issueId}/react`);
      setCommunityIssues((prev) =>
        prev.map((iss) =>
          iss.id === issueId
            ? { ...iss, has_upvoted: res.data.reacted, upvotes_count: res.data.upvotes_count }
            : iss
        )
      );
    } catch (err: any) {
      console.error('Failed to react:', err);
      fetchCommunityIssues();
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingIssuesToday <= 0) {
      setNotification({
        type: 'error',
        message: 'Daily submission quota reached. Maximum 2 grievance tickets may be submitted per day.',
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('is_anonymous', String(isAnonymous));
    if (location.trim()) formData.append('location', location.trim());
    if (attachment) formData.append('attachment', attachment);

    try {
      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setNotification({
        type: 'success',
        message: 'Your concern has been submitted to the Student Welfare Cell and published to the campus forum!',
        trackingId: res.data.trackingId,
      });

      setTitle('');
      setDescription('');
      setLocation('');
      setAttachment(null);
      setIsAnonymous(false);
      setShowSubmitModal(false);
      setRemainingIssuesToday(res.data.remainingSubmissionsToday);
      await refreshUser();
      fetchCommunityIssues();
      fetchMySubmissions();
      setActiveTab('community');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit grievance. Please verify input fields.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_QUICK_ISSUES)[0]) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setDescription(preset.desc);
    setLocation(preset.loc);
  };

  // Filtered community issues for search
  const filteredCommunityIssues = useMemo(() => {
    if (!searchQuery.trim()) return communityIssues;
    const q = searchQuery.toLowerCase().trim();
    return communityIssues.filter(
      (iss) =>
        iss.title?.toLowerCase().includes(q) ||
        iss.description?.toLowerCase().includes(q) ||
        iss.location?.toLowerCase().includes(q) ||
        iss.tracking_id?.toLowerCase().includes(q)
    );
  }, [communityIssues, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" /> In Progress
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Hourglass className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" /> Registered
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-16">
      {/* Human Campus Hero Header */}
      <ScrollReveal animation="fade">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-slate-950 text-white shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-blue-950/80" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>IIIT Bhagalpur • Campus Welfare & Student Voice</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Campus Concerns & Town Hall
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                A community-driven board where students surface hostel maintenance, mess hygiene, and academic needs. Upvote common issues to accelerate administrative resolution, or post your own.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-tactile px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                <Plus className="w-4 h-4" />
                <span>Register a Concern</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-medium border shadow-xs animate-slideDown ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{notification.message}</p>
            {notification.trackingId && (
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                Official Reference ID:{' '}
                <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {notification.trackingId}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'community'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Community Issues Board ({communityIssues.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my-tickets'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Registered Tickets ({myIssues.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Daily Quota:</span>
          <span className="font-mono font-bold text-blue-900 dark:text-blue-400">
            {remainingIssuesToday} / 2 remaining
          </span>
        </div>
      </div>

      {activeTab === 'community' ? (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search issues by title, location, or tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Registered</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="recent">Most Recent</option>
                <option value="most_upvoted">🔥 Most Upvoted (High Priority)</option>
              </select>
            </div>
          </div>

          {/* Issues Feed */}
          {filteredCommunityIssues.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No concerns found in this category
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Everything is currently running smoothly, or no issues match your filter query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredCommunityIssues.map((item, idx) => (
                <ScrollReveal key={item.id} animation="slide-up" delay={(idx % 6) * 30}>
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Content */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {getStatusBadge(item.status)}
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {item.tracking_id}
                        </span>
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Filed by {item.author_display}
                        </span>
                      </div>

                      <Link
                        to={`/student-issues/${item.tracking_id}`}
                        className="group block"
                      >
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap pt-1">
                        {item.location && (
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            {item.location}
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Right: Interactive Reactions & Discuss Button */}
                    <div className="flex items-center gap-2.5 self-start md:self-center shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 w-full md:w-auto justify-between md:justify-end">
                      {/* Upvote / Me Too Button */}
                      <button
                        onClick={(e) => handleToggleReaction(e, item.id)}
                        className={`btn-tactile px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
                          item.has_upvoted
                            ? 'bg-blue-900 border-blue-900 text-white shadow-blue-950/20'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                        }`}
                        title="Upvote or express 'Me Too' so authorities prioritize this concern"
                      >
                        <ThumbsUp
                          className={`w-3.5 h-3.5 ${
                            item.has_upvoted ? 'text-white fill-white' : 'text-slate-500'
                          }`}
                        />
                        <span>{item.has_upvoted ? 'Upvoted' : 'Me Too'}</span>
                        <span
                          className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            item.has_upvoted
                              ? 'bg-blue-800 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.upvotes_count || 0}
                        </span>
                      </button>

                      {/* Comments & Discussion Link */}
                      <Link
                        to={`/student-issues/${item.tracking_id}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Discuss</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          ({item.responses_count || 0})
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MY REGISTERED TICKETS TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Submitted Tickets ({myIssues.length})
            </h2>
            <span className="text-xs text-slate-500">
              Direct official communication with Institute Authorities
            </span>
          </div>

          {myIssues.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                You haven't filed any tickets yet
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Need maintenance support or have campus concerns? Click below to file a ticket.
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
              >
                Register New Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myIssues.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {item.tracking_id}
                      </span>
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] font-bold text-blue-900 dark:text-blue-400 uppercase">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      {item.location && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {item.location}
                        </span>
                      )}
                      <span>•</span>
                      <span>Filed on {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>👍 {item.upvotes_count || 0} peer upvotes</span>
                    </p>
                  </div>

                  <Link
                    to={`/student-issues/${item.tracking_id}`}
                    className="btn-tactile px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
                  >
                    <span>View Conversation & Thread</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ZERO-FRICTION GRIEVANCE REGISTRATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-7 shadow-2xl animate-scaleUp my-8">
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Campus Student Welfare Cell
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                  Register a Campus Concern / Grievance
                </h2>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-click Preset Suggestions */}
            <div className="my-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Autofill Presets:
                </span>
                <span className="text-[10px] text-slate-400">Click to fill form</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUICK_ISSUES.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    + {p.title.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="hostel">Hostel Maintenance & Utilities</option>
                    <option value="mess">Mess & Dining Hygiene</option>
                    <option value="infrastructure">Campus Wi-Fi & IT Systems</option>
                    <option value="classroom">Classroom & Academic Labs</option>
                    <option value="academic">Curriculum & Examination</option>
                    <option value="safety">Campus Safety & Medical Support</option>
                    <option value="admin">Administrative & Financial Services</option>
                    <option value="other">General Student Welfare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Venue / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hostel 2, Room 304, or Lab 2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Concise Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the core concern (min 5 characters)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide comprehensive details: relevant dates, frequency of the issue, prior steps taken..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Anonymity toggle option */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Post Anonymously to Peers
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Hides your name and roll number on the community board.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Photo / Document (Optional)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
                  onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-tactile px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Registering Ticket...' : 'Publish to Board'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
