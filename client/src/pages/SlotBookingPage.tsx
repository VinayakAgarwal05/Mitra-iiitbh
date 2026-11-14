import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  Ban,
  Check,
  X,
  History,
  Search,
  Filter,
  Cpu,
  Trophy,
  BookOpen,
  Users,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  ShieldCheck,
  Info,
  CalendarCheck2,
  Hourglass,
  Layers,
} from 'lucide-react';
import api, { getSocketUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/common/ScrollReveal';

type FacilityCategory = 'all' | 'labs' | 'auditoriums' | 'sports' | 'study';

const FACILITY_CATEGORIES: { id: FacilityCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Facilities', icon: Layers },
  { id: 'labs', label: 'Labs & AI Compute', icon: Cpu },
  { id: 'auditoriums', label: 'Auditoriums & Halls', icon: Building2 },
  { id: 'sports', label: 'Sports Pavilions', icon: Trophy },
  { id: 'study', label: 'Library & Cultural', icon: BookOpen },
];

const PRESET_CLUBS = [
  'Individual / Study Group',
  'Robotics & IoT Club',
  'Coding Society (GDSC / CP)',
  'Sports Council',
  'Tarang Cultural Society',
  'IEEE Student Branch',
  'Placement & Training Cell',
];

const QUICK_PURPOSE_TAGS: Record<FacilityCategory, string[]> = {
  all: [
    'Academic Project Work',
    'Society Workshop / Orientation',
    'Hackathon Preparation',
    'Sports Practice / Fitness',
    'Group Study & Discussion',
  ],
  labs: [
    'Sensor & Hardware Testing',
    'AI Model Training & Benchmark',
    'Software Project Sprint',
    'Competitive Programming Contest',
  ],
  auditoriums: [
    'Annual Society Orientation',
    'Guest Lecture / Seminar',
    'Technical Talk & Hackathon',
    'Cultural Rehearsal',
  ],
  sports: [
    'Inter-Batch Badminton Match',
    'Basketball Practice & Drills',
    'Cricket Team Training Session',
    'Evening Fitness & Games',
  ],
  study: [
    'Quiet Group Study Session',
    'Tarang Society Music Practice',
    'Interview & Debate Prep',
    'Research Paper Discussion',
  ],
};

function getFacilityCategory(facilityName: string): FacilityCategory {
  const name = facilityName.toLowerCase();
  if (name.includes('lab') || name.includes('comput') || name.includes('vlsi') || name.includes('cluster') || name.includes('robotics')) {
    return 'labs';
  }
  if (name.includes('auditorium') || name.includes('hall') || name.includes('amphitheatre') || name.includes('conference')) {
    return 'auditoriums';
  }
  if (name.includes('court') || name.includes('sports') || name.includes('badminton') || name.includes('cricket') || name.includes('pavilion')) {
    return 'sports';
  }
  return 'study';
}

function getFacilityAmenities(facilityName: string): string[] {
  const cat = getFacilityCategory(facilityName);
  switch (cat) {
    case 'labs':
      return ['Gigabit LAN', 'Smart Workstations', 'AC Climate Control', 'Power Backup'];
    case 'auditoriums':
      return ['Surround Sound', 'Smart Podium', 'Dual Projectors', 'Tiered Seating'];
    case 'sports':
      return ['Tournament Lighting', 'Wooden / Turf Court', 'First Aid Station', 'Locker Access'];
    default:
      return ['Acoustic Treatment', 'Power Outlets', 'Quiet Study Zone', 'Smart Screen'];
  }
}

function getTimeOfDay(startTime: string) {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) {
    return { label: 'Morning Slot', icon: Sun, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60' };
  } else if (hour < 17) {
    return { label: 'Afternoon Slot', icon: Sunset, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/60' };
  } else {
    return { label: 'Evening Slot', icon: Moon, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60' };
  }
}

export const SlotBookingPage: React.FC = () => {
  const { user, token } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | '09:00' | '14:00' | '17:30'>('all');
  const [viewTab, setViewTab] = useState<'slots' | 'my-bookings'>('slots');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');

  // Booking Modal
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  const [bookingType, setBookingType] = useState<'individual' | 'club'>('individual');
  const [clubName, setClubName] = useState('Individual / Study Group');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSlotsAndBookings = async () => {
    try {
      const [slotsRes, myRes] = await Promise.all([
        api.get('/bookings/slots', {
          params: {
            facility: selectedFacility !== 'all' ? selectedFacility : undefined,
            date: selectedDate || undefined,
          },
        }),
        api.get('/bookings/my'),
      ]);
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
      setMyBookings(Array.isArray(myRes.data) ? myRes.data : []);
    } catch (err) {
      console.error(err);
      setSlots([]);
      setMyBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsAndBookings();
  }, [selectedFacility, selectedDate]);

  // Real-time synchronization for status updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'demo_user_bookings') {
        fetchSlotsAndBookings();
      }
    };
    window.addEventListener('storage', onStorage);

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl || undefined, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('booking_status_updated', () => {
      fetchSlotsAndBookings();
    });

    return () => {
      window.removeEventListener('storage', onStorage);
      socket.disconnect();
    };
  }, [token]);

  // When opening a slot modal
  const handleOpenBookingModal = (slot: any) => {
    setActiveSlot(slot);
    setBookingType('individual');
    setClubName('Individual / Study Group');
    setPurpose('');
    setDescription('Campus facility reservation for academic and student development activities.');
    setModalError(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;

    // Friendly client-side check
    const finalClub = clubName.trim() || 'Individual / Study Group';
    const finalPurpose = purpose.trim();
    if (finalPurpose.length < 2) {
      setModalError('Please specify a brief purpose for this facility booking (e.g. Lab work, Sports practice).');
      return;
    }

    const finalDescription = description.trim() || 'Campus facility reservation for academic and student activities.';

    setSubmitting(true);
    setModalError(null);
    setNotification(null);

    try {
      const res = await api.post('/bookings', {
        slot_id: activeSlot.id,
        facility_or_club: activeSlot.facility_or_club,
        slot_date: activeSlot.slot_date,
        start_time: activeSlot.start_time,
        end_time: activeSlot.end_time,
        club_or_society: finalClub,
        purpose: finalPurpose,
        description: finalDescription,
      });

      setNotification({
        type: 'success',
        message: res.data.message || `Booking request for "${activeSlot.facility_or_club}" successfully submitted for administrative review!`,
      });
      setActiveSlot(null);
      fetchSlotsAndBookings();
      setViewTab('my-bookings');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        'Failed to submit booking request. Please check input values.';
      setModalError(errMsg);
      setNotification({
        type: 'error',
        message: errMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Cancel this facility reservation request?')) return;

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setNotification({ type: 'success', message: 'Booking request cancelled successfully.' });
      fetchSlotsAndBookings();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to cancel booking.',
      });
    }
  };

  // Date helper shortcuts
  const setDateShortcut = (type: 'all' | 'today' | 'tomorrow' | 'weekend') => {
    const now = new Date();
    if (type === 'all') {
      setSelectedDate('');
    } else if (type === 'today') {
      setSelectedDate(now.toISOString().slice(0, 10));
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setSelectedDate(tomorrow.toISOString().slice(0, 10));
    } else if (type === 'weekend') {
      const day = now.getDay();
      const diffToSaturday = (6 - day + 7) % 7;
      const saturday = new Date(now.getTime() + diffToSaturday * 24 * 60 * 60 * 1000);
      setSelectedDate(saturday.toISOString().slice(0, 10));
    }
  };

  // Filter slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = getFacilityCategory(slot.facility_or_club);
        if (cat !== selectedCategory) return false;
      }
      // Specific facility filter
      if (selectedFacility !== 'all' && slot.facility_or_club !== selectedFacility) {
        return false;
      }
      // Time filter
      if (selectedTimeFilter !== 'all' && slot.start_time !== selectedTimeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = slot.facility_or_club.toLowerCase().includes(q);
        const matchesDate = slot.slot_date.includes(q);
        const matchesNotes = slot.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesDate && !matchesNotes) return false;
      }
      return true;
    });
  }, [slots, selectedCategory, selectedFacility, selectedTimeFilter, searchQuery]);

  // Filter user bookings
  const filteredMyBookings = useMemo(() => {
    if (bookingStatusFilter === 'all') return myBookings;
    return myBookings.filter((b) => b.status === bookingStatusFilter);
  }, [myBookings, bookingStatusFilter]);

  const stats = useMemo(() => {
    const total = myBookings.length;
    const pending = myBookings.filter((b) => b.status === 'pending').length;
    const approved = myBookings.filter((b) => b.status === 'approved').length;
    const rejectedOrCancelled = myBookings.filter((b) => b.status === 'rejected' || b.status === 'cancelled').length;
    return { total, pending, approved, rejectedOrCancelled };
  }, [myBookings]);

  const allFacilityNames = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.facility_or_club));
    return Array.from(set);
  }, [slots]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Confirmed & Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Rejected by Admin
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Ban className="w-3.5 h-3.5 text-slate-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Hourglass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" /> Pending Admin Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Campus Facility Hero Banner */}
      <ScrollReveal animation="fade">
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-slate-950 text-white min-h-[170px] flex flex-col justify-between shadow-md">
          <img
            src="/images/iiitbh_auditorium.jpg"
            alt="IIIT Bhagalpur Campus Infrastructure"
            className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/60" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Centralized Campus Infrastructure & Sports Pavilions</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Facility & Room Reservations
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Reserve auditoriums, robotics arenas, high-performance computing labs, and sports courts with instant conflict detection and transparent administrative approval.
              </p>
            </div>

            {/* Tab switch */}
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl flex items-center self-start sm:self-auto border border-white/20 shrink-0">
              <button
                onClick={() => setViewTab('slots')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewTab === 'slots'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Available Slots
              </button>
              <button
                onClick={() => setViewTab('my-bookings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewTab === 'my-bookings'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                My Requests ({stats.total})
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Global Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs animate-slideDown shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewTab === 'slots' ? (
        <div className="space-y-4">
          {/* 1. Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {FACILITY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedFacility('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Search & Fine Filters Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by facility (e.g., Badminton, Robotics, Auditorium, HPC Lab)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Specific Facility Dropdown */}
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[200px]"
              >
                <option value="all">All Specific Facilities</option>
                {allFacilityNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Timing Filter */}
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Any Timing</option>
                <option value="09:00">Morning (09:00 - 12:00)</option>
                <option value="14:00">Afternoon (14:00 - 17:00)</option>
                <option value="17:30">Evening (17:30 - 20:30)</option>
              </select>
            </div>

            {/* Date filter shortcuts & picker */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Date:
                </span>
                <button
                  type="button"
                  onClick={() => setDateShortcut('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    !selectedDate
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut('today')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut('tomorrow')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDateShortcut('weekend')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Upcoming Weekend
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="text-[11px] font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    Clear Date
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Slot Results Count & Grid */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredSlots.length}</strong> available slots across campus
            </span>
            {(selectedCategory !== 'all' || selectedFacility !== 'all' || selectedDate || searchQuery || selectedTimeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedFacility('all');
                  setSelectedDate('');
                  setSearchQuery('');
                  setSelectedTimeFilter('all');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Reset all filters
              </button>
            )}
          </div>

          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No matching facility slots found
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try selecting "All Facilities" or picking a different date to see available timings.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedFacility('all');
                  setSelectedDate('');
                  setSearchQuery('');
                  setSelectedTimeFilter('all');
                }}
                className="mt-3.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
              >
                Show All Slots
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSlots.map((slot, idx) => {
                const timeInfo = getTimeOfDay(slot.start_time);
                const TimeIcon = timeInfo.icon;
                const amenities = getFacilityAmenities(slot.facility_or_club);

                return (
                  <ScrollReveal
                    key={slot.id}
                    animation="slide-up"
                    delay={(idx % 6) * 40}
                    className="h-full"
                  >
                    <div
                      className={`human-card p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between h-full ${
                        slot.is_booked
                          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-500/60 dark:hover:border-blue-400/60 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Top row: Status & Date */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              slot.is_booked
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            }`}
                          >
                            {slot.is_booked ? (
                              <>
                                <XCircle className="w-3 h-3 text-rose-500" /> Reserved
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available
                              </>
                            )}
                          </span>

                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {slot.slot_date}
                          </span>
                        </div>

                        {/* Facility Title */}
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                            {slot.facility_or_club}
                          </h3>
                        </div>

                        {/* Timing pill with icon */}
                        <div className={`p-2 rounded-xl border flex items-center justify-between text-xs ${timeInfo.color}`}>
                          <div className="flex items-center gap-1.5 font-bold font-mono">
                            <TimeIcon className="w-3.5 h-3.5" />
                            <span>
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold uppercase">{timeInfo.label}</span>
                        </div>

                        {/* Amenities Tags */}
                        <div className="flex flex-wrap gap-1">
                          {amenities.map((am) => (
                            <span
                              key={am}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                            >
                              {am}
                            </span>
                          ))}
                        </div>

                        {/* Facility Notes */}
                        {slot.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                            {slot.notes}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          disabled={slot.is_booked}
                          onClick={() => handleOpenBookingModal(slot)}
                          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                            slot.is_booked
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-900 hover:bg-blue-800 text-white hover:shadow'
                          }`}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          {slot.is_booked ? 'Slot Reserved' : 'Book Facility Slot'}
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* MY BOOKINGS HISTORY TAB */
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Requests
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Under Review
              </span>
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Approved
              </span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Past / Cancelled
              </span>
              <p className="text-xl font-extrabold text-slate-600 dark:text-slate-400 mt-1">
                {stats.rejectedOrCancelled}
              </p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setBookingStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition-colors border ${
                  bookingStatusFilter === st
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredMyBookings.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2.5 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No reservation requests found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Switch to the "Available Slots" tab to reserve campus facilities.
              </p>
              <button
                onClick={() => setViewTab('slots')}
                className="mt-3.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
              >
                Browse Available Facilities
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyBookings.map((b, idx) => (
                <ScrollReveal key={b.id} animation="slide-up" delay={idx * 40}>
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getStatusBadge(b.status)}
                        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {b.club_or_society || 'Individual Reservation'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ID: {b.id.slice(0, 14)}...
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {b.purpose}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-blue-900 dark:text-blue-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {b.facility_or_club}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {b.slot_date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {b.start_time} - {b.end_time}
                        </span>
                      </div>

                      {b.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          "{b.description}"
                        </p>
                      )}

                      {b.reviewer_notes && (
                        <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-xs text-blue-950 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Administrative Note:</span> {b.reviewer_notes}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ZERO-FRICTION FACILITY RESERVATION MODAL */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-scaleUp my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Institutional Reservation Request
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-900 dark:text-blue-400 shrink-0" />
                  {activeSlot.facility_or_club}
                </h2>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slot summary card */}
            <div className="my-3.5 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200 font-semibold">
                <CalendarCheck2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>{activeSlot.slot_date}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-bold text-blue-900 dark:text-blue-300">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {activeSlot.start_time} - {activeSlot.end_time}
                </span>
              </div>
            </div>

            {/* Error inside modal */}
            {modalError && (
              <div className="mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Booking Type Pill Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reservation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingType('individual');
                      setClubName('Individual / Study Group');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                      bookingType === 'individual'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Individual / Peer Study
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingType('club');
                      setClubName('Robotics & IoT Club');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                      bookingType === 'club'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Club / Society Activity
                  </button>
                </div>
              </div>

              {/* Club / Entity Input & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {bookingType === 'club' ? 'Club / Society / Committee *' : 'Group or Student Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics Club / Batch 2026 / Badminton Group"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                {bookingType === 'club' && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PRESET_CLUBS.slice(1).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setClubName(c)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          clubName === c
                            ? 'bg-blue-900 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Purpose with quick suggestion chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Booking Purpose *
                  </label>
                  <span className="text-[10px] text-slate-400">Click a tag to autofill</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware sensor testing & mock interview sessions"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                {/* Quick tags */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(QUICK_PURPOSE_TAGS[getFacilityCategory(activeSlot.facility_or_club)] || QUICK_PURPOSE_TAGS.all).map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setPurpose(tag)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          purpose === tag
                            ? 'bg-blue-900 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        + {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Description & Requirements */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Activity Overview & Safety Notes
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDescription(
                        'Campus facility reservation for academic and student development activities adhering to institutional guidelines.'
                      )
                    }
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Use standard note
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Describe activity overview, estimated participants, or equipment required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400 block text-right mt-0.5">
                  {description.length} characters
                </span>
              </div>

              {/* Form Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-tactile px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                >
                  {submitting ? (
                    <>
                      <Hourglass className="w-3.5 h-3.5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Submit Reservation Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
