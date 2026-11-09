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
} from 'lucide-react';
import api from '../api/client';
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

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchIssue = async () => {
    try {
      const res = await api.get(`/issues/track/${identifier}`);
      setIssue(res.data.issue);
      setMessages(res.data.messages || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [identifier]);

  // Setup Socket.IO for confidential issue thread
  useEffect(() => {
    if (token && issue?.id) {
      const socket = io({ auth: { token } });
      socketRef.current = socket;

      socket.emit('join_issue_room', issue.id);

      socket.on('new_issue_message', (msg: any) => {
        if (msg.issue_id === issue.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, issue?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !issue) return;

    setSending(true);
    setError(null);

    try {
      const res = await api.post(`/issues/${issue.id}/messages`, {
        message: replyText,
      });

      setMessages((prev) => [...prev, res.data.data]);
      setReplyText('');
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Unable to Load Concern</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link
          to="/student-issues"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Issues
        </Link>
      </div>
    );
  }

  const statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];
  const currentIndex = statuses.indexOf(issue.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/student-issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Issues List
        </Link>
      </div>

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
              {issue.tracking_id}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {issue.category}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Registered on {new Date(issue.created_at).toLocaleString()}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {issue.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          {issue.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
          {issue.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {issue.location}
            </span>
          )}
          {issue.attachment_name && (
            <a
              href={issue.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-teal-600 dark:text-teal-400 underline"
            >
              <Paperclip className="w-3.5 h-3.5" /> Attachment: {issue.attachment_name}
            </a>
          )}
        </div>

        {/* Status Lifecycle Progress Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Investigation & Resolution Status
          </p>
          <div className="flex items-center justify-between relative">
            {statuses.slice(0, 4).map((st, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={st} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 shadow-md'
                        : isPastOrCurrent
                        ? 'bg-teal-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`block text-[10px] font-semibold mt-1.5 capitalize ${
                      isCurrent
                        ? 'text-teal-600 dark:text-teal-400'
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

      {/* Confidential Conversation Thread with Handling Authority */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Confidential Authority Discussion Thread
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Encrypted internal channel</span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 min-h-[160px] max-h-[350px] overflow-y-auto p-1">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No messages exchanged yet. You can post questions or additional evidence below.
            </div>
          ) : (
            messages.map((m) => {
              const isAdmin = m.sender_role === 'admin';
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    isAdmin
                      ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[11px]">
                    <span>{isAdmin ? '🛡️ Campus Authority / Review Team' : '👤 You (Student)'}</span>
                    <span className="opacity-70 font-normal">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{m.message}</p>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Type confidential note or query to authorities..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
