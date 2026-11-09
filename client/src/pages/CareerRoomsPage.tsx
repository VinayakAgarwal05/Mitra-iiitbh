import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  LogOut,
  ArrowRight,
  Shield,
  Search,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const CareerRoomsPage: React.FC = () => {
  const { dailyUsage, refreshUser } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [joinedCount, setJoinedCount] = useState(0);
  const [maxRoomsAllowed, setMaxRoomsAllowed] = useState(2);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/career-rooms');
      setRooms(res.data.rooms);
      setJoinedCount(res.data.joinedCount);
      setMaxRoomsAllowed(res.data.maxRoomsAllowed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoin = async (roomId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.post(`/career-rooms/${roomId}/join`);
      setActionSuccess(res.data.message);
      await fetchRooms();
      await refreshUser();
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to join career room.');
    }
  };

  const handleLeave = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to leave this career room?')) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.delete(`/career-rooms/${roomId}/leave`);
      setActionSuccess(res.data.message);
      await fetchRooms();
      await refreshUser();
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to leave career room.');
    }
  };

  const categories = ['all', ...Array.from(new Set(rooms.map((r) => r.category)))];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || room.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Career Path Rooms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join professional goal groups to prepare together anonymously.
          </p>
        </div>

        {/* Membership quota badge */}
        <div className="px-4 py-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              Membership Limit
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Joined:{' '}
              <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                {joinedCount} / {maxRoomsAllowed} Max
              </span>
            </p>
          </div>
          {joinedCount >= maxRoomsAllowed && (
            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
              Limit Reached
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Strict Rule Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>
            <strong>Strict Platform Rule:</strong> Each student may join at most <strong>2 career rooms</strong> at any given time and send up to <strong>10 messages per day</strong>.
          </span>
        </div>
        {dailyUsage && (
          <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">
            Messages remaining today: {dailyUsage.careerRoom.remaining}/10
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search career rooms (e.g. GATE, Placement, AI/ML, UPSC)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Career Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const isFull = joinedCount >= maxRoomsAllowed && !room.is_member;

          return (
            <div
              key={room.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between ${
                room.is_member
                  ? 'bg-teal-50/40 dark:bg-teal-950/30 border-teal-500/40 shadow-sm ring-1 ring-teal-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } p-5`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">
                    {room.category}
                  </span>
                  {room.is_member && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Joined
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {room.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {room.member_count} active members
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {room.is_member ? (
                  <>
                    <Link
                      to={`/career-rooms/${room.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Enter Chat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleLeave(room.id)}
                      title="Leave Room"
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoin(room.id)}
                    disabled={isFull}
                    className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isFull
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    {isFull ? 'Limit Reached (Leave a Room First)' : 'Join Room'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
