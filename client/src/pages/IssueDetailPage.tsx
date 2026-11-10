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
      setError(err.response?.data?.error || 'Failed to load grievance details.');
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
      setError(err.response?.data?.error || 'Failed to deliver response.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs text-slate-500 font-medium">Loading grievance dossier...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Unable to Load Grievance Record</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link
          to="/student-issues"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-800 text-white text-xs font-medium hover:bg-brand-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Grievances Registry
        </Link>
      </div>
    );
  }

  const statuses = ['submitted', 'under_review', 'in_progress', 'resolved'];
  const currentIndex = statuses.indexOf(issue.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Return Link */}
      <div>
        <Link
          to="/student-issues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Grievances Registry
        </Link>
      </div>

      {/* Ticket Record Card */}
      <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
              {issue.tracking_id}
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {issue.category}
            </span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Filed: {new Date(issue.created_at).toLocaleString()}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {issue.title}
        </h1>

        <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-700/60 font-sans">
          {issue.description}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          {issue.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location: <strong>{issue.location}</strong></span>
            </span>
          )}
          {issue.attachment_name && (
            <a
              href={issue.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-brand-700 dark:text-brand-300 underline font-medium hover:text-brand-900"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Evidence Attachment ({issue.attachment_name})</span>
            </a>
          )}
        </div>

        {/* Status Lifecycle Indicator */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Investigation & Resolution Progress
          </div>
          <div className="flex items-center justify-between relative px-2">
            {statuses.map((st, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={st} className="flex-1 text-center relative z-10">
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-brand-800 text-white ring-2 ring-brand-300 dark:ring-brand-700'
                        : isPastOrCurrent
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`block text-[11px] font-medium mt-1.5 capitalize ${
                      isCurrent
                        ? 'text-brand-900 dark:text-brand-300 font-bold'
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

      {/* Confidential Direct Channel */}
      <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Resolution & Communication Thread
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Confidential Internal Channel</span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 min-h-[160px] max-h-[350px] overflow-y-auto p-1">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No correspondence logged yet. You may provide additional updates or inquire regarding status below.
            </div>
          ) : (
            messages.map((m) => {
              const isAdmin = m.sender_role === 'admin';
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-md text-xs space-y-1 ${
                    isAdmin
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                      : 'bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isAdmin ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" />
                          <span>Campus Administration / Welfare Office</span>
                        </>
                      ) : (
                        <span>Student (Confidential)</span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line pt-1 font-sans">{m.message}</p>
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
            placeholder="Type your reply or additional information for authorities..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            className="flex-1 px-3.5 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 rounded-md bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
