import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  MapPin,
  Lock,
  Building2,
  ThumbsUp,
  MessageSquare,
  User,
  Shield,
  Hourglass,
  Share2,
} from 'lucide-react';
import api, { getSocketUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const IssueDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const { user, token } = useAuth();
  const [issue, setIssue] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchIssue = async () => {
    try {
      const res = await api.get(`/issues/track/${identifier}`);
      setIssue(res.data.issue);
      setMessages(res.data.messages || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [identifier]);

  // Setup Socket.IO for community and administrative replies
  useEffect(() => {
    if (token && issue?.id) {
      const socketUrl = getSocketUrl();
      const socket = io(socketUrl || undefined, { auth: { token } });
      socketRef.current = socket;

      socket.emit('join_issue_room', issue.id);

      socket.on('new_issue_message', (msg: any) => {
        if (msg.issue_id === issue.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      });

      socket.on('issue_reaction_updated', ({ issue_id, upvotes_count }: any) => {
        if (issue_id === issue.id) {
          setIssue((prev: any) => (prev ? { ...prev, upvotes_count } : prev));
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, issue?.id]);

  const handleToggleReaction = async () => {
    if (!issue) return;
    const currentlyReacted = !!issue.has_upvoted;
    setIssue((prev: any) => ({
      ...prev,
      has_upvoted: !currentlyReacted,
      upvotes_count: Math.max(0, (prev.upvotes_count || 0) + (!currentlyReacted ? 1 : -1)),
    }));

    try {
      const res = await api.post(`/issues/${issue.id}/react`);
      setIssue((prev: any) => ({
        ...prev,
        has_upvoted: res.data.reacted,
        upvotes_count: res.data.upvotes_count,
      }));
    } catch {
      fetchIssue();
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !issue) return;

    setSending(true);
    setError(null);

    try {
      const res = await api.post(`/issues/${issue.id}/messages`, {
        message: replyText.trim(),
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === res.data.data.id)) return prev;
        return [...prev, res.data.data];
      });
      setReplyText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deliver response.');
    } finally {
      setSending(false);
    }
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Hourglass className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading campus grievance dossier...</span>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-md">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Unable to Load Concern Dossier
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
        <Link
          to="/student-issues"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Campus Board
        </Link>
      </div>
    );
  }

  const statuses = ['submitted', 'under_review', 'in_progress', 'resolved'];
  const currentIndex = statuses.indexOf(issue.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-fadeIn">
      {/* Return Navigation & Share Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/student-issues"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Campus Concerns
        </Link>

        <button
          onClick={handleShareLink}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? 'Link Copied!' : 'Share Issue'}</span>
        </button>
      </div>

      {/* Main Issue Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {issue.tracking_id}
            </span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-900/60">
              {issue.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Reported by {issue.author_display}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Upvote Button */}
            <button
              onClick={handleToggleReaction}
              className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
                issue.has_upvoted
                  ? 'bg-blue-900 border-blue-900 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
              }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${
                  issue.has_upvoted ? 'text-white fill-white' : 'text-slate-500'
                }`}
              />
              <span>{issue.has_upvoted ? 'Upvoted' : 'Me Too'}</span>
              <span className="font-mono ml-0.5">({issue.upvotes_count || 0})</span>
            </button>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {issue.title}
        </h1>

        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 font-sans">
          {issue.description}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          {issue.location && (
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Location: {issue.location}</span>
            </span>
          )}
          <span>•</span>
          <span className="font-mono text-[11px]">
            Filed on {new Date(issue.created_at).toLocaleString()}
          </span>
          {issue.attachment_name && (
            <>
              <span>•</span>
              <a
                href={issue.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-semibold hover:underline"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attachment ({issue.attachment_name})</span>
              </a>
            </>
          )}
        </div>

        {/* Resolution Progress Tracker */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Investigation & Resolution Timeline
          </div>
          <div className="flex items-center justify-between relative px-2">
            {statuses.map((st, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={st} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-blue-900 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`block text-[11px] font-semibold mt-1.5 capitalize ${
                      isCurrent
                        ? 'text-blue-900 dark:text-blue-400 font-bold'
                        : isPastOrCurrent
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Community & Authority Responses Thread */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-900 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Discussion & Administrative Responses ({messages.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Open Town Hall & Authority Channel
          </span>
        </div>

        {/* Message Thread List */}
        <div className="space-y-3 min-h-[160px] max-h-[420px] overflow-y-auto p-1">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No replies logged yet. Are you experiencing this issue or have an update? Post a response below.
            </div>
          ) : (
            messages.map((m) => {
              const isAdmin =
                m.sender_role === 'admin' ||
                m.sender_name?.toLowerCase().includes('authority') ||
                m.sender_name?.toLowerCase().includes('administration');

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl text-xs space-y-1.5 transition-all ${
                    isAdmin
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : m.is_own
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                      : 'bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isAdmin ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" />
                          <span className="text-blue-900 dark:text-blue-300 font-bold">
                            {m.sender_name || 'Campus Administration / Wardens'}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{m.sender_name || 'Campus Student'}</span>
                        </>
                      )}
                      {m.is_own && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-normal">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line pt-0.5 font-sans">
                    {m.message}
                  </p>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply Form */}
        <form
          onSubmit={handleSendReply}
          className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"
        >
          <input
            type="text"
            placeholder="Share an update, confirm if you also face this, or reply to administration..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="btn-tactile px-5 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending...' : 'Reply'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
