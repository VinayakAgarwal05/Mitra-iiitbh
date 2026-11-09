import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Download,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, dailyUsage, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joinedRooms, setJoinedRooms] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsRes, eventsRes, materialsRes, connectRes, slotsRes] = await Promise.all([
          api.get('/career-rooms'),
          api.get('/events'),
          api.get('/materials'),
          api.get('/student-connect/messages'),
          api.get('/bookings/slots'),
        ]);

        const joined = (roomsRes.data.rooms || []).filter((r: any) => r.is_member);
        setJoinedRooms(joined);
        setUpcomingEvents((eventsRes.data || []).slice(0, 3));
        setRecentMaterials((materialsRes.data || []).slice(0, 4));
        setRecentPosts((connectRes.data.posts || []).slice(0, 3));
        setAvailableSlots((slotsRes.data || []).filter((s: any) => !s.is_booked).slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    refreshUser();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              IIITBH Mitra Verified Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="mt-1 text-sm text-teal-100/90 max-w-xl">
              {user?.department} • {user?.academic_year} • Private College Student Community
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student-issues"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              Report Private Concern
            </Link>
            <Link
              to="/career-rooms"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-sm border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <span>Explore Career Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Limits Overview Cards */}
      {dailyUsage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Career Rooms Allowance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono">
                  {dailyUsage.careerRoom.remaining}
                </span>
                <span className="text-xs text-slate-400">/ 10 remaining today</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student Connect Allowance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {dailyUsage.studentConnect.remaining}
                </span>
                <span className="text-xs text-slate-400">/ 10 remaining today</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student Issues Submissions</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {dailyUsage.studentIssue.remaining}
                </span>
                <span className="text-xs text-slate-400">/ 2 allowed per day</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Career Rooms & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Rooms Joined */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Your Career Path Rooms ({joinedRooms.length}/2 joined)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Peer preparation network (strict max 2 rooms simultaneously)
              </p>
            </div>
            <Link
              to="/career-rooms"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              Browse All Rooms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {joinedRooms.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                You haven't joined any career room yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Join up to 2 career categories (e.g. Software Dev, GATE, UPSC, Placement Prep) to collaborate anonymously.
              </p>
              <Link
                to="/career-rooms"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
              >
                Join Your First Room
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joinedRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-xl border border-teal-500/20 bg-teal-50/30 dark:bg-teal-950/20 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">
                      {room.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-sm">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {room.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {room.member_count} members
                    </span>
                    <Link
                      to={`/career-rooms/${room.id}`}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors"
                    >
                      Enter Discussion
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming College Events */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Upcoming Events</h2>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View Calendar
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/calendar?event=${evt.id}`}
                className="block p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {evt.category}
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1 line-clamp-1">
                  {evt.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(evt.start_time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Study Materials & Student Connect Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Uploaded Study Materials */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Study Materials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notes, PYQs, and lecture files shared by students
              </p>
            </div>
            <Link
              to="/study-materials"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Browse All
            </Link>
          </div>

          <div className="space-y-3">
            {recentMaterials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {mat.file_type} • {mat.category}
                  </span>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1 truncate">
                    {mat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{mat.subject} • {mat.department}</p>
                </div>
                <a
                  href={`/api/materials/${mat.id}/download`}
                  className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-600 dark:text-teal-300 transition-colors shrink-0"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Student Connect Discussions */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Student Connect Feed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                General anonymous discussions & advice
              </p>
            </div>
            <Link
              to="/student-connect"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Open Feed
            </Link>
          </div>

          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to="/student-connect"
                className="block p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {post.anonymous_alias}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {post.content}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Available Facilities & Slots Quick Booking */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Available Club & Facility Slots
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reserved facilities for approved student activities (double booking prevented)
            </p>
          </div>
          <Link
            to="/slot-booking"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Manage Bookings
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableSlots.map((slot) => (
            <div
              key={slot.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  Available
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1.5">
                  {slot.facility_or_club}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {slot.slot_date} • {slot.start_time} - {slot.end_time}
                </p>
              </div>
              <Link
                to="/slot-booking"
                className="mt-3 text-center py-1.5 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Request Slot
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
