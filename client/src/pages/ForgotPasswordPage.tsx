import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/common/ScrollReveal';

const FORGOT_SLIDES = [
  {
    image: '/images/iiitbh_panoramic.jpg',
    tag: 'CAMPUS INTRANET ACCESS',
    title: 'Secure Account Recovery & OTP Authentication.',
    subtitle: 'Recover your student credentials using your official college email and one-time verification passcode.',
    location: 'Academic Complex, Sabour Campus',
  },
  {
    image: '/images/iiitbh_academic_block.jpg',
    tag: 'STUDENT PORTAL MITRA',
    title: 'Instant Access to Institute Resources.',
    subtitle: 'Academic vaults, verified peer career rooms, and campus facilities remain safe and accessible 24/7.',
    location: 'Main Academic Block, IIIT Bhagalpur',
  },
];

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Password Recovery & OTP Login — IIIT Bhagalpur MITRA';
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % FORGOT_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'OTP passcode generated.');
      if (res.data.debugOtp || res.data.debugResetCode) {
        const code = res.data.debugOtp || res.data.debugResetCode;
        setDebugOtp(code);
        setOtp(code);
      }
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/otp-login', {
        email,
        otp,
        new_password: newPassword.trim() ? newPassword.trim() : undefined,
      });

      setMessage('OTP verified! Redirecting to your dashboard...');
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/');
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check the passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'A new OTP has been generated.');
      if (res.data.debugOtp || res.data.debugResetCode) {
        const code = res.data.debugOtp || res.data.debugResetCode;
        setDebugOtp(code);
        setOtp(code);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const currentSlide = FORGOT_SLIDES[slideIdx];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* 
        ====================================================================
        MOBILE PHONE BRAND HEADER (VISIBLE ONLY ON MOBILE & TABLETS < LG)
        ====================================================================
      */}
      <div className="lg:hidden relative h-40 sm:h-48 w-full overflow-hidden select-none shrink-0 bg-slate-950">
        {FORGOT_SLIDES.map((slide, idx) => {
          const isActive = idx === slideIdx;
          return (
            <div
              key={`m-${slide.image}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950/75 to-slate-950/45 z-10" />

        <div className="relative z-20 h-full p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/iiitbh_logo.png"
                alt="IIIT Bhagalpur Seal"
                className="w-10 h-10 object-contain bg-white/95 p-1 rounded-xl shadow-md border border-white/20 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block leading-tight">
                  IIIT Bhagalpur
                </span>
                <span className="text-sm font-extrabold text-white tracking-tight leading-tight block truncate">
                  Account Recovery & OTP
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              Passcode Login
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate max-w-[240px] font-medium flex items-center gap-1 text-slate-200">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">Permanent Sabour Campus</span>
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {FORGOT_SLIDES.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slideIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 
        ====================================================================
        DESKTOP HERO COLUMN (VISIBLE ONLY ON LARGE SCREENS >= LG)
        ====================================================================
      */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen flex-col justify-between p-10 xl:p-12 overflow-hidden select-none">
        {FORGOT_SLIDES.map((slide, idx) => {
          const isActive = idx === slideIdx;
          return (
            <div
              key={`d-${slide.image}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40 z-10 pointer-events-none" />

        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/iiitbh_logo.png"
              alt="IIIT Bhagalpur Crest"
              className="w-12 h-12 object-contain bg-white p-1 rounded-xl shadow-xs"
            />
            <div>
              <h1 className="text-white font-extrabold text-sm tracking-tight uppercase">
                IIIT Bhagalpur
              </h1>
              <p className="text-[11px] font-semibold text-blue-300">
                Mitra • Account Recovery
              </p>
            </div>
          </div>
          <span className="glass-chip px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 tracking-wider">
            {currentSlide.tag}
          </span>
        </div>

        <div className="relative z-20 my-auto py-8 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/15 text-slate-200 text-xs font-semibold backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentSlide.location}</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {currentSlide.subtitle}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm text-xs space-y-1 max-w-md">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Instant Passcode Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              One-time passcodes are dispatched securely over TLS to your institutional email.
            </p>
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            {FORGOT_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIdx(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === slideIdx ? 'w-7 bg-white shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400">
            IIIT Bhagalpur Intranet Recovery
          </span>
        </div>
      </div>

      {/* 
        ====================================================================
        FORM CARD CONTAINER (RESPONSIVE & MOBILE OPTIMIZED)
        ====================================================================
      */}
      <div className="lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-slate-900 lg:bg-slate-50 dark:lg:bg-slate-950 flex-1 -mt-4 sm:-mt-6 lg:mt-0 relative z-20">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="px-1 sm:px-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-blue-400 lg:text-blue-700 dark:lg:text-blue-400 uppercase tracking-wider mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Recovery & OTP Login</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white lg:text-slate-900 dark:lg:text-white">
              {step === 'request' ? 'Forgot Password?' : 'Enter Verification Passcode'}
            </h2>
            <p className="text-xs text-slate-400 lg:text-slate-500 dark:lg:text-slate-400 mt-0.5 leading-relaxed">
              {step === 'request'
                ? 'Enter your institutional email to receive an instant one-time login passcode.'
                : `Enter the 6-digit passcode sent to ${email} to sign in immediately.`}
            </p>
          </div>

          <div className="bg-slate-800/90 lg:bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-700/80 lg:border-slate-200/90 dark:border-slate-800/90 space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 lg:text-rose-700 dark:lg:text-rose-300 text-xs flex items-start gap-2.5 animate-slideDown"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 lg:text-emerald-700 dark:lg:text-emerald-300 text-xs flex items-start gap-2.5 animate-slideDown">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed font-medium">{message}</span>
              </div>
            )}

            {debugOtp && (
              <div className="p-3 rounded-xl bg-blue-500/15 lg:bg-blue-50 dark:bg-blue-950/60 border border-blue-500/30 lg:border-blue-200 dark:border-blue-900 text-blue-200 lg:text-blue-900 dark:text-blue-300 text-xs animate-slideDown">
                <div className="font-semibold flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 lg:text-blue-700" />
                    <span>Your Verification Passcode:</span>
                  </div>
                  <span className="text-[10px] bg-blue-400/20 lg:bg-blue-200/60 px-1.5 py-0.5 rounded font-medium text-blue-300 lg:text-blue-800">
                    Instant Access
                  </span>
                </div>
                <p className="font-mono text-base font-bold text-white lg:text-slate-900 dark:text-white tracking-[0.25em] bg-slate-900 lg:bg-white dark:bg-slate-900 py-2 px-3 rounded-lg text-center border border-slate-700 lg:border-blue-200 dark:border-blue-800 my-1.5 shadow-xs">
                  {debugOtp}
                </p>
                <p className="text-[11px] text-slate-300 lg:text-slate-500 dark:text-slate-400 text-center">
                  Passcode auto-filled below. Click <strong>Verify & Sign In</strong>.
                </p>
              </div>
            )}

            {step === 'request' ? (
              /* Step 1: Request OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Institutional College Email
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactile w-full py-3.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Sending Passcode...</span>
                  ) : (
                    <>
                      <span>Send Login Passcode</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP & Login / Reset */
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    6-Digit Verification Passcode
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300">
                      New Password <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to just login, or set new password"
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactile w-full py-3.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] active:scale-[0.99]"
                >
                  {loading ? (
                    <span>Verifying & Signing In...</span>
                  ) : (
                    <>
                      <span>{newPassword.trim() ? 'Reset Password & Sign In' : 'Verify Passcode & Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 lg:text-slate-500 pt-2">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="flex items-center gap-1.5 text-blue-400 lg:text-blue-600 font-semibold hover:underline disabled:opacity-50 py-1"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    Resend Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('request');
                      setError(null);
                      setMessage(null);
                    }}
                    className="hover:underline py-1"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-3 border-t border-slate-700/60 lg:border-slate-100 dark:border-slate-800">
              <Link to="/login" className="text-xs font-semibold text-blue-400 lg:text-blue-600 dark:text-blue-400 hover:underline inline-block py-1">
                ← Back to Password Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
