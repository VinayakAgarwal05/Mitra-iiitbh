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
  Compass,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CampusHeroSlider } from '../components/common/CampusHeroSlider';
import { ScrollReveal } from '../components/common/ScrollReveal';

const CAMPUS_LANDMARKS = [
  {
    id: 'landmark-academic',
    title: 'Main Academic Block',
    tag: 'Academic Complex',
    description: 'Smart lecture halls, computational clusters, departmental laboratories, and seminar centers.',
    image: '/images/iiitbh_academic_block.jpg',
    actionText: 'Study Materials Vault',
    link: '/study-materials',
  },
  {
    id: 'landmark-lab',
    title: 'Robotics & VLSI Laboratories',
    tag: 'Research Center',
    description: 'Specialized lab setups for IoT, Embedded Systems, Mechatronics, and VLSI circuit design.',
    image: '/images/iiitbh_lab.jpg',
    actionText: 'Reserve Lab Slot',
    link: '/slot-booking',
  },
  {
    id: 'landmark-auditorium',
    title: 'Central Auditorium & Arena',
    tag: 'Convocation Arena',
    description: 'State-of-the-art acoustic convention hall hosting convocations, symposiums, and guest addresses.',
    image: '/images/iiitbh_auditorium.jpg',
    actionText: 'Campus Schedule',
    link: '/calendar',
  },
  {
    id: 'landmark-hostels',
    title: 'Student Residential Hostels',
    tag: 'Hostel Sector',
    description: 'Modern residential facilities by the River Ganga with campus LAN, sports, and 24x7 security.',
    image: '/images/iiitbh_hostel.jpg',
    actionText: 'Wardens & Reps',
    link: '/contacts',
  },
  {
    id: 'landmark-fest',
    title: 'Tarang Cultural & Fest Grounds',
    tag: 'Student Life',
    description: 'Open air amphitheatre and grounds for Tarang, hackathons, music societies, and student sports.',
    image: '/images/iiitbh_fest.jpg',
    actionText: 'Student Connect',
    link: '/student-connect',
  },
  {
    id: 'landmark-panorama',
    title: 'Permanent Sabour Campus',
    tag: 'Panoramic Aerial',
    description: '50-acre permanent campus along the sacred banks of River Ganga in Sabour, Bhagalpur.',
    image: '/images/iiitbh_panoramic.jpg',
    actionText: 'Career Path Tracks',
    link: '/career-rooms',
  },
];

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
    <div className="space-y-8 animate-fadeIn">
      {/* IIIT Bhagalpur Campus Interactive Photo Slider */}
      <ScrollReveal animation="fade" duration={800}>
        <CampusHeroSlider user={user} />
      </ScrollReveal>

      {/* Daily Limits Overview with Visual Progress Meters */}
      {dailyUsage && (
        <ScrollReveal animation="slide-up" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase text-slate-500 text-[11px]">Career Room Quota</span>
                <Briefcase className="w-4 h-4 text-brand-700 dark:text-brand-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {dailyUsage.careerRoom?.remaining ?? 10}
                </span>
                <span className="text-xs text-slate-500">/ 10 left today</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(((dailyUsage.careerRoom?.remaining ?? 10) / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase text-slate-500 text-[11px]">Student Connect Quota</span>
                <MessageSquare className="w-4 h-4 text-brand-700 dark:text-brand-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {dailyUsage.studentConnect?.remaining ?? 10}
                </span>
                <span className="text-xs text-slate-500">/ 10 left today</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(((dailyUsage.studentConnect?.remaining ?? 10) / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div className="human-card p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase text-slate-500 text-[11px]">Grievance Tickets Quota</span>
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {dailyUsage.studentIssue?.remaining ?? 2}
                </span>
                <span className="text-xs text-slate-500">/ 2 submissions/day</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(((dailyUsage.studentIssue?.remaining ?? 2) / 2) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Featured Institutional Vision & Leadership Banner */}
      <ScrollReveal animation="slide-up" delay={130}>
        <div className="relative rounded-2xl overflow-hidden border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-300">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="glass-chip px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Institutional Leadership
                </span>
                <span className="text-[11px] text-slate-300 hidden sm:inline-block">
                  NEP 2020 • Vikshit Bharat 2047
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Our Vision, Mission & Executive Administration
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Read Director Prof. Madhusudan Singh’s address on experiential research, Registrar Dr. Dheeraj Kumar Sinha’s governance mandate, the Deans’ Council, and Department Heads.
              </p>
            </div>
          </div>

          <Link
            to="/vision"
            className="btn-tactile px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <span>Explore Vision</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </ScrollReveal>

      {/* Main Grid: Career Rooms & Upcoming Events */}
      <ScrollReveal animation="slide-up" delay={150}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrolled Career Rooms */}
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Enrolled Career Path Rooms ({(joinedRooms || []).length}/2)
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

            {(joinedRooms || []).length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  You have not joined any career rooms yet
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Join up to two career path groups (GATE, Placement Prep, Software Dev, UPSC, AI/ML) to discuss strategies and exchange preparation resources.
                </p>
                <Link
                  to="/career-rooms"
                  className="btn-tactile mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-medium hover:bg-blue-800 transition-colors shadow-xs"
                >
                  <span>Browse & Join Rooms</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(joinedRooms || []).map((room) => (
                  <div
                    key={room.id}
                    className="human-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase">
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
                        className="btn-tactile px-2.5 py-1 rounded-md bg-blue-900 text-white text-xs font-medium hover:bg-blue-800 transition-colors"
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
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
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
              {(upcomingEvents || []).map((evt) => (
                <Link
                  key={evt.id}
                  to={`/calendar?event=${evt.id}`}
                  className="human-card block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
      </ScrollReveal>

      {/* IIIT Bhagalpur Campus Visual Landmarks Tour (Photo Gallery with Sliding Animation) */}
      <ScrollReveal animation="slide-up" delay={200}>
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Permanent Campus Infrastructure • Sabour, Bhagalpur</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                Campus Landmarks & Student Life
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Explore key campus facilities & academic complexes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPUS_LANDMARKS.map((landmark, idx) => (
              <ScrollReveal
                key={landmark.id}
                animation="slide-up"
                delay={idx * 80}
                className="h-full"
              >
                <div className="group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between h-full shadow-xs hover:shadow-lg">
                  {/* Photo Container with smooth zoom */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={landmark.image}
                      alt={landmark.title}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white border border-white/20">
                      {landmark.tag}
                    </span>
                    <h3 className="absolute bottom-2.5 left-3 right-3 font-bold text-sm text-white drop-shadow-sm">
                      {landmark.title}
                    </h3>
                  </div>

                  {/* Body Content & Quick Action */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {landmark.description}
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <Link
                        to={landmark.link}
                        className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>{landmark.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Second Row: Study Materials & Student Connect */}
      <ScrollReveal animation="slide-up" delay={250}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Materials Highlights */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Academic Resource Vault
                </h2>
                <p className="text-[11px] text-slate-500">270+ ADHYAAY Lecture notes, PYQs, and verified practical manuals</p>
              </div>
              <Link
                to="/study-materials"
                className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline"
              >
                Open Vault
              </Link>
            </div>

            <div className="space-y-2.5">
              {(recentMaterials || []).map((mat) => (
                <div
                  key={mat.id}
                  className="human-card p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
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
                  {mat.file_path && (mat.file_path.startsWith('http://') || mat.file_path.startsWith('https://')) ? (
                    <a
                      href={mat.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 hover:bg-blue-100 transition-colors shrink-0"
                      title="Open Google Drive Vault"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <a
                      href={`/api/materials/${mat.id}/download`}
                      className="btn-tactile p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Student Connect Discussions */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
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
              {(recentPosts || []).map((post) => (
                <Link
                  key={post.id}
                  to="/student-connect"
                  className="human-card block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
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
      </ScrollReveal>

      {/* Available Facilities & Slots Quick Booking */}
      <ScrollReveal animation="slide-up" delay={300}>
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
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
            {(availableSlots || []).map((slot) => (
              <div
                key={slot.id}
                className="human-card p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between"
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
                  className="btn-tactile mt-3 text-center py-1.5 px-3 rounded-lg bg-blue-900 text-white text-xs font-medium hover:bg-blue-800 transition-colors shadow-xs"
                >
                  Request Slot
                </Link>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
