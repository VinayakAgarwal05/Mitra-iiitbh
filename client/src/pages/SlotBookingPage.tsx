import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  Ban,
  Check,
  X,
  History,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const SlotBookingPage: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewTab, setViewTab] = useState<'slots' | 'my-bookings'>('slots');

  // Booking Modal
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  const [clubName, setClubName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSlotsAndBookings = async () => {
    try {
      const [slotsRes, myRes] = await Promise.all([
        api.get('/bookings/slots', {
          params: { facility: selectedFacility, date: selectedDate || undefined },
        }),
        api.get('/bookings/my'),
      ]);
      setSlots(slotsRes.data);
      setMyBookings(myRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsAndBookings();
  }, [selectedFacility, selectedDate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await api.post('/bookings', {
        slot_id: activeSlot.id,
        club_or_society: clubName,
        purpose,
        description,
      });

      setNotification({ type: 'success', message: res.data.message });
      setActiveSlot(null);
      setClubName('');
      setPurpose('');
      setDescription('');
      fetchSlotsAndBookings();
      setViewTab('my-bookings');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit booking request.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setNotification({ type: 'success', message: 'Booking request cancelled.' });
      fetchSlotsAndBookings();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to cancel booking.',
      });
    }
  };

  const facilities = [
    'all',
    'Robotics & IoT Innovation Lab',
    'Main Campus Auditorium',
    'Music & Cultural Society Room',
    'Basketball & Sports Court',
    'Seminar Hall A (Computing Center)',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Ban className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Club & Facility Slot Booking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reserve campus facilities, labs, and seminar halls with automated conflict detection.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex items-center self-start sm:self-auto">
          <button
            onClick={() => setViewTab('slots')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewTab === 'slots'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Available Slots
          </button>
          <button
            onClick={() => setViewTab('my-bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewTab === 'my-bookings'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            My Requests ({myBookings.length})
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {viewTab === 'slots' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {facilities.map((f) => (
                <option key={f} value={f}>
                  {f === 'all' ? 'All Campus Facilities & Clubs' : f}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  slot.is_booked
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/40 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        slot.is_booked
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {slot.is_booked ? 'Reserved' : 'Slot Available'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{slot.slot_date}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                    {slot.facility_or_club}
                  </h3>

                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.start_time} - {slot.end_time}
                  </p>

                  {slot.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {slot.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={slot.is_booked}
                    onClick={() => setActiveSlot(slot)}
                    className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      slot.is_booked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    {slot.is_booked ? 'Already Reserved' : 'Request Reservation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* My Bookings History Tab */
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-400/60" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No booking requests submitted yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Select an available slot from the "Available Slots" tab to reserve a campus facility.
              </p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {b.club_or_society}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {b.purpose}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                    <span>
                      <strong>Facility:</strong> {b.facility_or_club}
                    </span>
                    <span>•</span>
                    <span>
                      {b.slot_date} ({b.start_time} - {b.end_time})
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{b.description}"
                  </p>
                  {b.reviewer_notes && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                      <strong>Admin Note:</strong> {b.reviewer_notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
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
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Facility Reservation Request
              </h2>
              <button onClick={() => setActiveSlot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
              <p className="font-semibold">{activeSlot.facility_or_club}</p>
              <p className="mt-0.5">
                Date: {activeSlot.slot_date} • Time: {activeSlot.start_time} - {activeSlot.end_time}
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club, Society, or Batch Group *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding Club / Robotics Society / IEEE Student Branch"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Booking Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Mentorship & Hardware Testing"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Activity Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the scheduled activities, estimated student attendance, and any special equipment required..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
