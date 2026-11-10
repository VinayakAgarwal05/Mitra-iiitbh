import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  CalendarPlus,
  HelpCircle,
  FileText,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../api/client';

export const CalendarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // Active event detail modal
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events', {
        params: { search, category: selectedCategory },
      });
      setEvents(res.data);

      const targetId = searchParams.get('event');
      if (targetId) {
        const found = res.data.find((e: any) => e.id === targetId);
        if (found) setSelectedEvent(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, selectedCategory]);

  const categories = [
    'all',
    'booked_slot',
    'fest',
    'tech',
    'cultural',
    'workshop',
    'seminar',
    'guest_lecture',
    'club',
    'sports',
    'meeting',
    'academic',
    'placement',
  ];

  const getGoogleCalendarUrl = (event: any) => {
    const startIso = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endIso = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(
      `${event.description}\n\nOrganizer: ${event.organizer}\nCoordinator: ${event.coordinator_name} (${event.coordinator_contact})`
    );
    const location = encodeURIComponent(event.venue);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-700 dark:text-brand-400" />
            Campus Academic & Activity Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional timeline: examinations, hackathons, seminars, placement drives, and club activities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('month')}
              className={`btn-tactile px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-tactile px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Upcoming List
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, workshops, guest lectures, or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all'
                ? 'All Events & Booked Slots'
                : cat === 'booked_slot'
                ? '📌 Booked Facility Slots'
                : cat.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* View Mode: Month Calendar */}
      {viewMode === 'month' ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] rounded-lg bg-slate-50 dark:bg-slate-800/20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = events.filter((e) => {
                const eDate = new Date(e.start_time);
                return (
                  eDate.getDate() === day &&
                  eDate.getMonth() === month &&
                  eDate.getFullYear() === year
                );
              });

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-2 rounded-lg border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-600'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded bg-blue-900 text-white flex items-center justify-center text-[10px]'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 rounded text-[10px] font-semibold truncate transition-all ${
                          evt.is_slot_booking
                            ? evt.booking_status === 'approved'
                              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={evt.title}
                      >
                        {evt.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-slate-400 pl-0.5">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode: List */
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                evt.is_slot_booking
                  ? evt.booking_status === 'approved'
                    ? 'border-teal-500/30 bg-teal-500/[0.02]'
                    : 'border-amber-500/30 bg-amber-500/[0.02]'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      evt.is_slot_booking
                        ? evt.booking_status === 'approved'
                          ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-transparent'
                    }`}
                  >
                    {evt.is_slot_booking
                      ? evt.booking_status === 'approved'
                        ? '📌 Facility Reserved'
                        : '⏳ Pending Reservation'
                      : evt.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    Host: <strong className="text-slate-700 dark:text-slate-300">{evt.organizer}</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(evt.start_time).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {evt.venue}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(evt);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                    evt.is_slot_booking
                      ? 'bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                    selectedEvent.is_slot_booking
                      ? selectedEvent.booking_status === 'approved'
                        ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-transparent'
                  }`}
                >
                  {selectedEvent.is_slot_booking
                    ? selectedEvent.booking_status === 'approved'
                      ? '📌 Confirmed Facility Booking'
                      : '⏳ Pending Booking Reservation'
                    : selectedEvent.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Timing & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Schedule
                  </span>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(selectedEvent.start_time).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Venue
                  </span>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {selectedEvent.venue}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Event Description
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Coordinator & Organizer */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1 bg-white dark:bg-slate-900">
                <p>
                  <strong>Organized by:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Coordinator:</strong> {selectedEvent.coordinator_name} ({selectedEvent.coordinator_contact})
                </p>
                {selectedEvent.eligibility && (
                  <p>
                    <strong>Eligibility:</strong> {selectedEvent.eligibility}
                  </p>
                )}
              </div>

              {/* Preparation Notes */}
              {selectedEvent.preparation_notes && (
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">
                    Instructions & Required Materials:
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedEvent.preparation_notes}
                  </p>
                </div>
              )}

              {/* FAQs */}
              {selectedEvent.faqs && (
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-1.5">
                    {(typeof selectedEvent.faqs === 'string'
                      ? JSON.parse(selectedEvent.faqs)
                      : selectedEvent.faqs
                    ).map((faq: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-white">Q: {faq.question}</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Links */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/events/${selectedEvent.id}/ics`}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ICS</span>
                  </a>

                  <a
                    href={getGoogleCalendarUrl(selectedEvent)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-blue-800 dark:text-blue-400" />
                    <span>Google Calendar</span>
                  </a>
                </div>

                {selectedEvent.registration_link && (
                  <a
                    href={selectedEvent.registration_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
