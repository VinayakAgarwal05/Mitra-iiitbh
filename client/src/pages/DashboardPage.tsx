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
  Download,
  Shield,
  Users,
  GraduationCap,
  ExternalLink,
  MapPin,
  Sparkles,
  ChevronRight,
  Building2,
  FileText,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CampusHeroSlider } from '../components/common/CampusHeroSlider';

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

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* IIIT Bhagalpur Campus Interactive Photo Slider */}
      <CampusHeroSlider user={user} />

      {/* Daily Limits Overview with Visual Progress Meters */}
      {dailyUsage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="human-card p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase text-slate-500 text-[11px]">Career Room Quota</span>
              <Briefcase className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {dailyUsage.careerRoom.remaining}
              </span>
              <span className="text-xs text-slate-500">/ 10 left today</span>
            </div>
            {/* Visual progress meter */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dailyUsage.careerRoom.remaining / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="human-card p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase text-slate-500 text-[11px]">Student Connect Quota</span>
              <MessageSquare className="w-4 h-4 text-brand-700 dark:text-brand-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {dailyUsage.studentConnect.remaining}
              </span>
              <span className="text-xs text-slate-500">/ 10 left today</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dailyUsage.studentConnect.remaining / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="human-card p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase text-slate-500 text-[11px]">Grievance Tickets Quota</span>
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {dailyUsage.studentIssue.remaining}
              </span>
              <span className="text-xs text-slate-500">/ 2 submissions/day</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(dailyUsage.studentIssue.remaining / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Career Rooms & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Career Rooms */}
        <div className="lg:col-span-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Enrolled Career Path Rooms ({joinedRooms.length}/2)
              </h2>
              <p className="text-[11px] text-slate-500">
                Targeted preparation circles (strict limit of 2 active rooms)
              </p>
            </div>
            <Link
              to="/career-rooms"
              className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline flex items-center gap-1"
            >
              <span>Explore All Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {joinedRooms.length === 0 ? (
            <div className="p-6 text-center rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                You have not joined any career rooms yet
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Join up to two career path groups (GATE, Placement Prep, Software Dev, UPSC, AI/ML) to discuss strategies and exchange preparation resources.
              </p>
              <Link
                to="/career-rooms"
                className="btn-tactile mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-800 text-white text-xs font-medium hover:bg-brand-900 transition-colors"
              >
                <span>Browse & Join Rooms</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {joinedRooms.map((room) => (
                <div
                  key={room.id}
                  className="human-card p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-brand-800 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 uppercase">
                      {room.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-xs">
                      {room.name}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                      {room.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {room.member_count} members
                    </span>
                    <Link
                      to={`/career-rooms/${room.id}`}
                      className="btn-tactile px-2.5 py-1 rounded-md bg-brand-800 text-white text-xs font-medium hover:bg-brand-900 transition-colors"
                    >
                      Open Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming College Events */}
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Upcoming Events</h2>
              <p className="text-[11px] text-slate-500">Official college schedule</p>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline"
            >
              Full Calendar
            </Link>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/calendar?event=${evt.id}`}
                className="human-card block p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-[10px] font-semibold uppercase text-slate-500">
                  {evt.category}
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  {evt.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
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

      {/* Second Row: Study Materials & Student Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Materials Highlights */}
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Academic Resource Repository
              </h2>
              <p className="text-[11px] text-slate-500">Lecture notes, PYQs, and verified practical manuals</p>
            </div>
            <Link
              to="/study-materials"
              className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline"
            >
              Open Vault
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentMaterials.map((mat) => (
              <div
                key={mat.id}
                className="human-card p-3 rounded-md border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                    {mat.file_type} • {mat.category}
                  </span>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1 truncate">
                    {mat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{mat.subject} • {mat.department}</p>
                </div>
                <a
                  href={`/api/materials/${mat.id}/download`}
                  className="btn-tactile p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Student Connect Discussions */}
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Student Connect Feed
              </h2>
              <p className="text-[11px] text-slate-500">Cross-batch discussions and advice</p>
            </div>
            <Link
              to="/student-connect"
              className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline"
            >
              Open Feed
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to="/student-connect"
                className="human-card block p-3 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-[11px]">
                    {post.anonymous_alias}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Available Facilities & Slots Quick Booking */}
      <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Campus Facilities & Slot Reservations
            </h2>
            <p className="text-[11px] text-slate-500">
              Reserved facilities for approved student clubs and activities
            </p>
          </div>
          <Link
            to="/slot-booking"
            className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline"
          >
            Manage Reservations
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableSlots.map((slot) => (
            <div
              key={slot.id}
              className="human-card p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  Available Slot
                </span>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white mt-1.5">
                  {slot.facility_or_club}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  {slot.slot_date} • {slot.start_time} - {slot.end_time}
                </p>
              </div>
              <Link
                to="/slot-booking"
                className="btn-tactile mt-3 text-center py-1.5 px-3 rounded-md bg-brand-800 text-white text-xs font-medium hover:bg-brand-900 transition-colors"
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
