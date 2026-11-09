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
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../api/client';
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
      setPosts(res.data.posts);
      if (res.data.dailyUsage) {
        setRemainingDailyMessages(res.data.dailyUsage.remaining);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [search, selectedCategory]);

  // Socket.IO real-time feed updates
  useEffect(() => {
    if (token) {
      const socket = io({
        auth: { token },
      });
      socketRef.current = socket;

      socket.emit('join_student_connect');

      socket.on('new_connect_message', (incoming: any) => {
        if (incoming.parent_id) {
          // It's a reply
          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === incoming.parent_id) {
                if (p.replies.some((r: any) => r.id === incoming.id)) return p;
                return {
                  ...p,
                  replies: [...p.replies, incoming],
                  replies_count: p.replies_count + 1,
                };
              }
              return p;
            })
          );
        } else {
          // It's a root post
          setPosts((prev) => {
            if (prev.some((p) => p.id === incoming.id)) return prev;
            return [incoming, ...prev];
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

      setPosts((prev) => [res.data.post, ...prev]);
      setNewContent('');
      setNewTags('');
      setRemainingDailyMessages(res.data.remainingDailyMessages);
      await refreshUser();
      setNotification({ type: 'success', message: 'Discussion posted anonymously.' });
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

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === parentId) {
            return {
              ...p,
              replies: [...p.replies, res.data.post],
              replies_count: p.replies_count + 1,
            };
          }
          return p;
        })
      );

      setReplyContent('');
      setReplyParentId(null);
      setRemainingDailyMessages(res.data.remainingDailyMessages);
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
        message: 'Message reported to campus administrators for review.',
      });
      setReportTargetId(null);
      setReportReason('');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Report failed.',
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Student Connect (Anonymous Feed)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect across batches, ask seniors, and exchange guidance with complete identity privacy.
          </p>
        </div>

        {/* Daily limit badge */}
        <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Daily Message Limit
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Allowance:{' '}
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                {remainingDailyMessages} / 10 left
              </span>
            </p>
          </div>
        </div>
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
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* New Post Creator Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Post will be published anonymously as a verified student</span>
        </div>

        {remainingDailyMessages <= 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            <strong>Daily limit exhausted (10/10)!</strong> Your daily Student Connect messaging allowance resets at midnight 00:00. You can still read and search all conversations.
          </div>
        ) : (
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              required
              rows={3}
              placeholder="Ask an academic question, share an experience, or seek senior guidance anonymously..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="General Discussion">General Discussion</option>
                  <option value="Academics & Advice">Academics & Advice</option>
                  <option value="Projects & Collaborations">Projects & Collaborations</option>
                  <option value="Hostel & Campus Life">Hostel & Campus Life</option>
                  <option value="Events & Fests">Events & Fests</option>
                  <option value="Senior Guidance">Senior Guidance</option>
                </select>

                <input
                  type="text"
                  placeholder="Tags (e.g. cp, advice)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex-1 sm:w-44"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !newContent.trim()}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Discussion</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussions by topic, keywords, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Topics' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Discussions Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {post.is_self ? `You (${post.anonymous_alias})` : post.anonymous_alias}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                  {post.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={() => setReportTargetId(post.id)}
                  title="Report Post"
                  className="hover:text-rose-500 p-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-1">
                {post.tags.split(',').map((t: string) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    #{t.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Thread Replies */}
            {post.replies && post.replies.length > 0 && (
              <div className="pl-4 border-l-2 border-teal-500/30 space-y-2.5 pt-2">
                {post.replies.map((reply: any) => (
                  <div
                    key={reply.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {reply.is_self ? `You (${reply.anonymous_alias})` : reply.anonymous_alias}
                      </span>
                      <span className="text-slate-400">
                        {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Form or Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {replyParentId === post.id ? (
                <div className="w-full space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write your anonymous reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyParentId(null)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={submittingReply || !replyContent.trim()}
                      onClick={() => handleSendReply(post.id)}
                      className="px-3.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyParentId(post.id)}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply anonymously ({post.replies_count || 0})</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {reportTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Report Inappropriate Discussion
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please specify why this message violates college community guidelines.
            </p>

            <form onSubmit={handleReportMessage} className="mt-4 space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Reason for report..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportTargetId(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
