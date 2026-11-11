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
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/common/ScrollReveal';

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
      const roomList = Array.isArray(res.data) ? res.data : (res.data?.rooms || []);
      setRooms(roomList);
      setJoinedCount(res.data?.joinedCount ?? roomList.filter((r: any) => r.is_member).length);
      setMaxRoomsAllowed(res.data?.maxRoomsAllowed ?? 2);
    } catch (err) {
      console.error(err);
      setRooms([]);
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

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const categories = ['all', ...Array.from(new Set(safeRooms.map((r) => r.category).filter(Boolean)))];

  const filteredRooms = safeRooms.filter((room) => {
    const matchesSearch =
      (room.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || room.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Campus Photo Header */}
      <ScrollReveal animation="fade">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-slate-900 text-white min-h-[160px] flex flex-col justify-between shadow-xs">
          <img
            src="/images/iiitbh_panoramic.jpg"
            alt="IIIT Bhagalpur Campus Aerial Panorama"
            className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/60" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>Professional & Competitive Examination Circles</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Career Path Preparation Rooms
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Anonymous student tracks for GATE, Coding Placements, Software Development, UPSC, and Higher Studies with daily discussion allowances.
              </p>
            </div>

            {/* Membership quota badge */}
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white self-start sm:self-auto shrink-0 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                  Enrolled Quota
                </p>
                <p className="text-xs text-white font-medium">
                  Joined:{' '}
                  <span className="font-bold font-mono text-emerald-400">
                    {joinedCount} / {maxRoomsAllowed} Max
                  </span>
                </p>
              </div>
              {joinedCount >= maxRoomsAllowed && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                  Quota Filled
                </span>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Notifications */}
      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Strict Rule Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Institutional Policy:</strong> Maximum of <strong>2 career rooms</strong> enrolled at once. Daily limit: <strong>10 messages/day</strong>.
          </span>
        </div>
        {dailyUsage && (
          <span className="font-mono text-xs font-semibold">
            Messages remaining: {dailyUsage.careerRoom?.remaining ?? 10}/10
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search career fields (GATE, Software Dev, Placement, AI/ML, UPSC)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Disciplines & Fields' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Career Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room, idx) => {
          const isFull = joinedCount >= maxRoomsAllowed && !room.is_member;

          return (
            <ScrollReveal
              key={room.id}
              animation="slide-up"
              delay={(idx % 6) * 60}
              className="h-full"
            >
              <div
                className={`human-card rounded-xl border transition-all flex flex-col justify-between h-full ${
                  room.is_member
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-lg'
                } p-5`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {room.category}
                    </span>
                    {room.is_member && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {room.member_count} enrolled students
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  {room.is_member ? (
                    <>
                      <Link
                        to={`/career-rooms/${room.id}`}
                        className="flex-1 py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs text-center flex items-center justify-center gap-1 transition-colors shadow-xs"
                      >
                        <span>Enter Discussion</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleLeave(room.id)}
                        title="Leave Room"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoin(room.id)}
                      disabled={isFull}
                      className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
                        isFull
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-900 hover:bg-blue-800 text-white shadow-xs'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      {isFull ? 'Limit Reached (2 Rooms Max)' : 'Enroll in Track'}
                    </button>
                  )}
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
};
