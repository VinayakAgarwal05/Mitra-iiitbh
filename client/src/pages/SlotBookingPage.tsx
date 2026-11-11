import React, { useEffect, useState } from 'react';
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
    if (!window.confirm('Cancel this facility reservation request?')) return;

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
    'Computer Centre Lab 1 (High Performance Lab)',
    'Computer Centre Lab 2 (Software Development Lab)',
    'High Performance Computing & AI Cluster Lab',
    'VLSI & Embedded Systems Design Lab',
    'Seminar Hall 1 (Administrative Complex)',
    'Seminar Hall 2 (Academic Block)',
    'Music & Cultural Society Room (Tarang)',
    'Basketball & Volleyball Sports Court',
    'Badminton & Table Tennis Indoor Pavilion',
    'Sports Ground & Cricket Pavilion',
    'Open Air Amphitheatre & Student Quadrangle',
    'Central Library Discussion & Study Vault Room',
    'Conference Room A (Senate & Faculty Hall)',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-900 dark:text-blue-400" />
            Campus Facility & Society Room Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reserve auditoriums, laboratories, and club rooms with transactional conflict prevention.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex items-center self-start sm:self-auto">
          <button
            onClick={() => setViewTab('slots')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewTab === 'slots'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Available Slots
          </button>
          <button
            onClick={() => setViewTab('my-bookings')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewTab === 'my-bookings'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
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
          className={`p-3.5 rounded-lg flex items-center gap-2 text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-auto opacity-70 hover:opacity-100">
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
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {facilities.map((f) => (
                <option key={f} value={f}>
                  {f === 'all' ? 'All Campus Facilities & Laboratories' : f}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`human-card p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  slot.is_booked
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        slot.is_booked
                          ? 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {slot.is_booked ? 'Slot Reserved' : 'Slot Available'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{slot.slot_date}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-xs mt-1">
                    {slot.facility_or_club}
                  </h3>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {slot.start_time} - {slot.end_time}
                  </p>

                  {slot.notes && (
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                      {slot.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={slot.is_booked}
                    onClick={() => setActiveSlot(slot)}
                    className={`w-full py-1.5 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      slot.is_booked
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {slot.is_booked ? 'Reserved' : 'Request Slot'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* My Bookings History Tab */
        <div className="space-y-3">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No active booking requests
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Select an available slot from the "Available Slots" tab to reserve a campus facility.
              </p>
            </div>
          ) : (
            myBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {b.club_or_society}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {b.purpose}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>
                      <strong>Facility:</strong> {b.facility_or_club}
                    </span>
                    <span>•</span>
                    <span>
                      {b.slot_date} ({b.start_time} - {b.end_time})
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                    "{b.description}"
                  </p>
                  {b.reviewer_notes && (
                    <div className="mt-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Authority Note:</strong> {b.reviewer_notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                Facility Reservation Request
              </h2>
              <button onClick={() => setActiveSlot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 space-y-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">{activeSlot.facility_or_club}</p>
                <p className="mt-0.5 text-slate-500 font-mono">
                  Date: {activeSlot.slot_date} • Timing: {activeSlot.start_time} - {activeSlot.end_time}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Submitting this form dispatches a formal reservation request to Institute Administration. Once reviewed and approved, this slot will be confirmed and displayed on the College Calendar.</span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club / Society / Batch Committee *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics Club / Coding Society / IEEE Branch"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Booking Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hardware sensor testing & mock interview sessions"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Activity Details & Expected Headcount *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe activities, estimated student participants, and equipment requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-tactile px-4 py-1.5 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-semibold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {submitting ? 'Submitting to Admin...' : 'Submit Request to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
