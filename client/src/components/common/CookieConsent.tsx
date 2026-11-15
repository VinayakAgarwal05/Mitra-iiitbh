import React, { useState, useEffect } from 'react';
import { Shield, Cookie, X, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'iiitbh_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay so it doesn't jarringly block initial render
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: true,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: false,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent Banner"
      role="dialog"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-slideUp"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-slate-100 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/50">
            <Cookie className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Institutional Privacy & Cookies
              </h3>
              <button
                onClick={handleAcceptNecessary}
                aria-label="Dismiss cookie notice with necessary settings"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              IIIT Bhagalpur MITRA uses strictly necessary session cookies and local storage tokens to safeguard authentication and remember preferences. We do not sell data or deploy advertising trackers.
            </p>

            <div className="mt-2 text-[11px]">
              <Link
                to="/privacy"
                onClick={() => setIsVisible(false)}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Read our Privacy Policy</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptNecessary}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
