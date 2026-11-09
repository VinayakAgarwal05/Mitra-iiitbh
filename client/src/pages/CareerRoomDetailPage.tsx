import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  Users,
  Send,
  Shield,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  LogOut,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CareerRoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [remainingDailyMessages, setRemainingDailyMessages] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchRoomAndMessages = async () => {
      try {
        const [roomRes, msgRes] = await Promise.all([
          api.get(`/career-rooms/${id}`),
          api.get(`/career-rooms/${id}/messages`),
        ]);

        setRoom(roomRes.data.room);
        setMessages(msgRes.data.messages || []);
        if (msgRes.data.dailyUsage) {
          setRemainingDailyMessages(msgRes.data.dailyUsage.remaining);
        }
      } catch (err: any) {
        if (err.response?.data?.code === 'NOT_A_MEMBER') {
          navigate('/career-rooms');
        } else {
          setError(err.response?.data?.error || 'Failed to load career room.');
        }
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchRoomAndMessages();

    // Socket.IO setup
    if (token) {
      const socket = io({
        auth: { token },
      });
      socketRef.current = socket;

      socket.emit('join_career_room', id);

      socket.on('new_message', (msg: any) => {
        if (msg.context_id === id) {
          setMessages((prev) => {
            // Avoid duplicate if already added via local API response
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [
              ...prev,
              {
                id: msg.id,
                anonymous_alias: msg.anonymous_alias,
                content: msg.content,
                created_at: msg.created_at,
                is_self: msg.sender_id === user?.id,
              },
            ];
          });
          setTimeout(scrollToBottom, 50);
        }
      });

      return () => {
        socket.emit('leave_career_room', id);
        socket.disconnect();
      };
    }
  }, [id, token, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    if (remainingDailyMessages <= 0) {
      setError('Daily limit exhausted! You can send up to 10 messages per day in Career Rooms.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await api.post(`/career-rooms/${id}/messages`, {
        content: inputContent,
      });

      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);
      setInputContent('');
      setRemainingDailyMessages(res.data.remainingDailyMessages);
      await refreshUser();
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!window.confirm('Leave this career room?')) return;
    try {
      await api.delete(`/career-rooms/${id}/leave`);
      navigate('/career-rooms');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to leave room.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-t-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/career-rooms"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">
                {room?.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {room?.member_count} members
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {room?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLeaveRoom}
            className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Guidelines Banner */}
      <div className="px-4 py-2 bg-teal-50/70 dark:bg-teal-950/30 border-x border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300">
        <Info className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
        <span className="truncate">
          <strong>Guidelines:</strong> {room?.guidelines}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 border-x border-slate-200 dark:border-slate-800 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-teal-500/40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Welcome to {room?.name}!
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to post a study doubt, resource link, or prep strategy anonymously.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.is_self ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                <span className={`font-semibold ${msg.is_self ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {msg.is_self ? `You (${msg.anonymous_alias})` : msg.anonymous_alias}
                </span>
                <span>•</span>
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`max-w-lg rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.is_self
                    ? 'bg-teal-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input & Daily Limit Meter */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-2xl">
        {/* Daily limit badge */}
        <div className="flex items-center justify-between text-xs mb-2 px-1">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Anonymous Peer Room</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Messages remaining today:
            </span>
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                remainingDailyMessages > 3
                  ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                  : remainingDailyMessages > 0
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}
            >
              {remainingDailyMessages} / 10
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {remainingDailyMessages <= 0 ? (
          <div className="p-3 text-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            <strong>Daily message limit reached (10/10)!</strong> Your career room messaging allowance resets tomorrow at 00:00 midnight according to campus time. You can still read all discussions.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Post a query, resource, or advice anonymously..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={sending || !inputContent.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
