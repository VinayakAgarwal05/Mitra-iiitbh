import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  Reply,
  Shield,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Lock,
  Tag,
  Share2,
} from 'lucide-react';
import api, { getSocketUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const StudentConnectPage: React.FC = () => {
  const { user, token, dailyUsage, refreshUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New post state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General Discussion');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Remaining limit
  const [remainingDailyMessages, setRemainingDailyMessages] = useState<number>(10);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Report modal state
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const socketRef = useRef<Socket | null>(null);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/student-connect/messages', {
        params: { search, category: selectedCategory },
      });
      const postList = Array.isArray(res.data) ? res.data : (res.data?.posts || []);
      setPosts(postList);
      if (res.data?.dailyUsage) {
        setRemainingDailyMessages(res.data.dailyUsage.remaining);
      }
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Cross-tab real-time sync for demo/preview environments
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'demo_sc_posts' || e.key?.startsWith('demo_usage_')) {
        fetchFeed();
      }
    };
    window.addEventListener('storage', onStorage);

    // Periodic polling to keep feed fresh
    const pollInterval = setInterval(() => {
      fetchFeed();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', onStorage);
    };
  }, [search, selectedCategory]);

  // Socket.IO real-time feed updates
  useEffect(() => {
    if (token) {
      const socketUrl = getSocketUrl();
      const socket = io(socketUrl || undefined, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.emit('join_student_connect');

      socket.on('new_connect_message', (incoming: any) => {
        if (incoming.parent_id) {
          // It's a reply
          setPosts((prev) =>
            (prev || []).map((p) => {
              if (p.id === incoming.parent_id) {
                const currentReplies = Array.isArray(p.replies) ? p.replies : [];
                if (currentReplies.some((r: any) => r.id === incoming.id)) return p;
                return {
                  ...p,
                  replies: [...currentReplies, incoming],
                  replies_count: (p.replies_count || 0) + 1,
                };
              }
              return p;
            })
          );
        } else {
          // It's a root post
          setPosts((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            if (list.some((p) => p.id === incoming.id)) return list;
            return [incoming, ...list];
          });
        }
      });

      return () => {
        socket.emit('leave_student_connect');
        socket.disconnect();
      };
    }
  }, [token]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (remainingDailyMessages <= 0) {
      setNotification({
        type: 'error',
        message: 'Daily message limit reached (10/10) for Student Connect.',
      });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await api.post('/student-connect/messages', {
        content: newContent,
        category: newCategory,
        tags: newTags,
      });

      const incomingPost = res.data.post || res.data.data;
      if (incomingPost) {
        setPosts((prev) => [{ ...incomingPost, user_id: user?.id, is_self: true }, ...prev]);
      }
      setNewContent('');
      setNewTags('');
      const rem = typeof res.data.remainingDailyMessages === 'number'
        ? res.data.remainingDailyMessages
        : res.data.dailyUsage?.remaining;
      if (typeof rem === 'number') {
        setRemainingDailyMessages(rem);
      }
      await refreshUser();
      setNotification({ type: 'success', message: 'Discussion thread initiated successfully.' });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to post message.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    if (remainingDailyMessages <= 0) {
      setNotification({
        type: 'error',
        message: 'Daily message limit reached (10/10) for Student Connect.',
      });
      return;
    }

    setSubmittingReply(true);
    setNotification(null);

    try {
      const res = await api.post('/student-connect/messages', {
        content: replyContent,
        parent_id: parentId,
      });

      const incomingReply = res.data.post || res.data.data;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === parentId) {
            return {
              ...p,
              replies: [...(p.replies || []), incomingReply ? { ...incomingReply, user_id: user?.id, is_self: true } : incomingReply],
              replies_count: (p.replies_count || 0) + 1,
            };
          }
          return p;
        })
      );

      setReplyContent('');
      setReplyParentId(null);
      const rem = typeof res.data.remainingDailyMessages === 'number'
        ? res.data.remainingDailyMessages
        : res.data.dailyUsage?.remaining;
      if (typeof rem === 'number') {
        setRemainingDailyMessages(rem);
      }
      await refreshUser();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit reply.',
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTargetId || !reportReason.trim()) return;

    try {
      await api.post(`/student-connect/messages/${reportTargetId}/report`, {
        reason: reportReason,
      });
      setNotification({
        type: 'success',
        message: 'Message reported to administrative proctorial committee.',
      });
      setReportTargetId(null);
      setReportReason('');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Report submission failed.',
      });
    }
  };

  const categories = [
    'all',
    'General Discussion',
    'Academics & Advice',
    'Projects & Collaborations',
    'Hostel & Campus Life',
    'Events & Fests',
    'Senior Guidance',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Anonymous Academic Intranet Board</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Connect
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Cross-batch student exchange, project collaborations, and senior guidance. All communications preserve complete individual privacy while upholding campus conduct standards.
          </p>
        </div>

        {/* Quota tracker */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 text-right shrink-0 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Daily Message Quota
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
            <span className="font-mono text-brand-700 dark:text-brand-400 font-bold">
              {remainingDailyMessages}
            </span>
            <span className="text-slate-400"> / 10 remaining</span>
          </div>
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

      {/* New Post Creator Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <MessageSquare className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <span>Create Discussion Thread</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Identity Protected</span>
          </div>
        </div>

        {remainingDailyMessages <= 0 ? (
          <div className="p-3.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
            <strong>Daily Message Limit Exhausted (10/10):</strong> Your daily transmission allocation resets automatically at midnight (00:00 IST). You may continue reading, searching, and referencing ongoing threads.
          </div>
        ) : (
          <form onSubmit={handleCreatePost} className="space-y-3.5">
            <div>
              <textarea
                required
                rows={3}
                placeholder="Share an academic query, seek advice from seniors, or discuss campus initiatives..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 resize-none font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                <div className="w-full sm:w-56">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="General Discussion">General Discussion</option>
                    <option value="Academics & Advice">Academics & Advice</option>
                    <option value="Projects & Collaborations">Projects & Collaborations</option>
                    <option value="Hostel & Campus Life">Hostel & Campus Life</option>
                    <option value="Events & Fests">Events & Fests</option>
                    <option value="Senior Guidance">Senior Guidance</option>
                  </select>
                </div>

                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tags (e.g. algorithms, hostel-2, advice)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !newContent.trim()}
                className="px-4 py-2 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Publish Thread'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussion threads by topic, keywords, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Topic Sections' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            Loading discussions...
          </div>
        ) : (posts || []).length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            No active discussions found for the specified criteria.
          </div>
        ) : (
          (posts || []).map((post) => {
            const isMyPost = Boolean(user?.id && post.user_id ? post.user_id === user.id : post.is_self);
            return (
              <article
                key={post.id}
                className="human-card p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] uppercase font-mono">
                      #
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {isMyPost ? `${post.anonymous_alias} (You)` : post.anonymous_alias}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                      {post.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <span className="font-mono text-[11px]">
                      {new Date(post.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => setReportTargetId(post.id)}
                      title="Report violation to administration"
                      className="hover:text-rose-600 transition-colors p-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(typeof post.tags === 'string'
                      ? post.tags.split(',')
                      : Array.isArray(post.tags)
                      ? post.tags
                      : []
                    ).map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700"
                      >
                        #{typeof t === 'string' ? t.trim() : t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Replies Container */}
                {Array.isArray(post.replies) && post.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-brand-200 dark:border-brand-900 space-y-2.5 pt-1">
                    {post.replies.map((reply: any) => {
                      const isMyReply = Boolean(user?.id && reply.user_id ? reply.user_id === user.id : reply.is_self);
                      return (
                        <div
                          key={reply.id}
                          className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {isMyReply ? `${reply.anonymous_alias} (You)` : reply.anonymous_alias}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{reply.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Form or Trigger */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {replyParentId === post.id ? (
                  <div className="w-full space-y-2 mt-2">
                    <textarea
                      rows={2}
                      placeholder="Write your anonymous response..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyParentId(null)}
                        className="px-3 py-1.5 rounded-md text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={submittingReply || !replyContent.trim()}
                        onClick={() => handleSendReply(post.id)}
                        className="px-3.5 py-1.5 rounded-md bg-brand-800 hover:bg-brand-900 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Submit Response
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyParentId(post.id)}
                    className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline flex items-center gap-1.5 py-1"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Responses ({post.replies_count || 0})</span>
                  </button>
                )}
              </div>
            </article>
          );
        })
      )}
      </div>

      {/* Report Modal */}
      {reportTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Report Code of Conduct Violation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Please specify the guideline violation (harassment, spam, academic dishonesty, or policy breach). Reports are forwarded directly to the proctorial board.
            </p>

            <form onSubmit={handleReportMessage} className="mt-4 space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Specific description of violation..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReportTargetId(null)}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                >
                  File Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
