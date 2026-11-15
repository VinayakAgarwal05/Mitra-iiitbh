import React, { useEffect } from 'react';
import { Compass, Home, Briefcase, BookOpen, Clock, AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page Not Found — IIIT Bhagalpur MITRA';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Visual Badge */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-950/80 border-2 border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
          <Compass className="w-12 h-12 animate-pulseSlow" />
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white font-mono shadow-xs">
            404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            IIIT Bhagalpur Intranet
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Resource Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The page, study material repository, or campus room you are looking for does not exist or has been relocated to another department wing.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        {/* Quick Links Directory */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Popular Campus Destinations
          </p>
          <div className="grid grid-cols-2 gap-2 text-left text-xs">
            <Link
              to="/career-rooms"
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">Career Rooms</span>
            </Link>

            <Link
              to="/study-materials"
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">Study Materials</span>
            </Link>

            <Link
              to="/slot-booking"
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">Facility Slots</span>
            </Link>

            <Link
              to="/student-issues"
              className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-200 dark:hover:border-blue-900/60 transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">Campus Town Hall</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
