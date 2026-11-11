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
  Info,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import api, { getSocketUrl } from '../api/client';
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

    // Cross-tab real-time sync for demo/preview environments
    const onStorage = (e: StorageEvent) => {
      if (e.key === `demo_career_msgs_${id}` || e.key?.startsWith('demo_usage_')) {
        fetchRoomAndMessages();
      }
    };
    window.addEventListener('storage', onStorage);

    // Periodic polling to keep messages fresh across tabs / devices
    const pollInterval = setInterval(() => {
      fetchRoomAndMessages();
    }, 4000);

    const socketUrl = getSocketUrl();
    if (token) {
      const socket = io(socketUrl || undefined, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.emit('join_career_room', id);

      socket.on('new_message', (msg: any) => {
        if (msg.context_id === id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [
              ...prev,
              {
                id: msg.id,
                user_id: msg.sender_id,
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
    }

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', onStorage);
      if (socketRef.current) {
        socketRef.current.emit('leave_career_room', id);
        socketRef.current.disconnect();
      }
    };
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

      const newMsg = res.data?.data || res.data?.message || res.data;
      if (newMsg && (newMsg.content || newMsg.id)) {
        setMessages((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { ...newMsg, user_id: user?.id, is_self: true },
        ]);
      }
      setInputContent('');
      if (typeof res.data?.remainingDailyMessages === 'number') {
        setRemainingDailyMessages(res.data.remainingDailyMessages);
      } else if (typeof res.data?.dailyUsage?.remaining === 'number') {
        setRemainingDailyMessages(res.data.dailyUsage.remaining);
      }
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-t-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/career-rooms"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
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

        <button
          onClick={handleLeaveRoom}
          className="px-2.5 py-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 border border-slate-200 dark:border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Guidelines Banner */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-x border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 shrink-0 text-slate-500" />
        <span className="truncate">
          <strong>Guidelines:</strong> {room?.guidelines}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100/60 dark:bg-slate-950/60 border-x border-slate-200 dark:border-slate-800 space-y-3.5">
        {(messages || []).length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Welcome to the {room?.name} discussion.
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Share interview preparation questions, problem solving strategies, or study tips anonymously.
            </p>
          </div>
        ) : (
          (messages || []).map((msg) => {
            const isMe = Boolean(user?.id && msg.user_id ? msg.user_id === user.id : msg.is_self);
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-mono">
                  <span className={`font-semibold ${isMe ? 'text-blue-900 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isMe ? `You (${msg.anonymous_alias})` : msg.anonymous_alias}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-md rounded-lg px-3.5 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-900 text-white rounded-tr-none shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input & Daily Limit Meter */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-b-xl">
        <div className="flex items-center justify-between text-xs mb-2 px-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Anonymous Academic Room</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Daily allowance:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {remainingDailyMessages} / 10 left
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {remainingDailyMessages <= 0 ? (
          <div className="p-3 text-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
            <strong>Daily messaging quota exhausted (10/10).</strong> Resets tomorrow at 00:00 midnight. Reading and search remain available.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Post a query, problem statement, or prep resource anonymously..."
              disabled={sending}
              className="flex-1 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={sending || !inputContent.trim()}
              className="px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
