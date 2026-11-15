import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, AlertCircle, ArrowRight, CheckCircle2, RotateCw, GraduationCap } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      setMessage('Email verified. Redirecting to your dashboard...');
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/');
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your institutional email.');
      return;
    }
    setResending(true);
    setError(null);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setMessage(res.data.message || 'A new verification passcode has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-900 lg:bg-slate-100 dark:lg:bg-slate-950 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/iiitbh_logo.png"
            alt="IIIT Bhagalpur Crest"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-white p-1 rounded-2xl shadow-md border border-slate-700 lg:border-slate-200"
          />
        </div>
        <h2 className="mt-3 text-center text-lg sm:text-xl font-bold tracking-tight text-white lg:text-slate-900 dark:lg:text-white uppercase">
          Verify Institutional Email
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 lg:text-slate-500 max-w-sm mx-auto">
          Enter the 6-digit one-time verification passcode issued to your official college email
        </p>
      </div>

      <div className="mt-5 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 lg:bg-white dark:bg-slate-900 py-6 px-4 sm:py-8 sm:px-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-700/80 lg:border-slate-200 dark:border-slate-800">
          {error && (
            <div className="mb-4 sm:mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 lg:text-rose-700 dark:lg:text-rose-300 text-xs flex items-start gap-2.5 animate-slideDown">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 sm:mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 lg:text-emerald-700 dark:lg:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="font-medium leading-relaxed">{message}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rollno@iiitbh.ac.in"
                  className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                6-Digit Passcode
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-[0.35em] font-mono text-xl sm:text-2xl py-3 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-tactile w-full py-3.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px] active:scale-[0.99]"
            >
              {loading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <span>Verify Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-400 lg:text-slate-500 pt-4 border-t border-slate-700/60 lg:border-slate-200 dark:border-slate-800">
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="flex items-center gap-1.5 text-blue-400 lg:text-blue-700 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 py-1"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend Passcode
            </button>
            <Link to="/login" className="hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
