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
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Left Column with Sliding IIIT Bhagalpur Photos */}
      <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden select-none">
        {FORGOT_SLIDES.map((slide, idx) => {
          const isActive = idx === slideIdx;
          return (
            <div
              key={slide.image}
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

        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/iiitbh_logo.png"
              alt="IIIT Bhagalpur Crest"
              className="w-11 h-11 object-contain bg-white p-1 rounded-xl shadow-xs"
            />
            <div>
              <h1 className="text-white font-extrabold text-sm tracking-tight uppercase">
                IIIT Bhagalpur
              </h1>
              <p className="text-[11px] font-semibold text-brand-300">
                Mitra • Account Recovery
              </p>
            </div>
          </div>
        </div>

        {/* Middle Slide Info */}
        <div className="relative z-20 my-auto py-8 max-w-lg space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium text-slate-200 glass-chip">
            {currentSlide.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Slide Controls */}
        <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/10 text-xs">
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

      {/* Right Column: Form Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-50 dark:bg-slate-950">
        <ScrollReveal direction="slide-left" delay={100} className="w-full max-w-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password Recovery & OTP Login</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {step === 'request' ? 'Forgot Password?' : 'Enter Verification Passcode'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {step === 'request'
                ? 'Enter your institutional email address to receive an instant one-time login passcode.'
                : `Enter the 6-digit passcode sent to ${email} to sign in immediately.`}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-slideDown">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs animate-slideDown">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {debugOtp && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs animate-slideDown">
                <div className="font-semibold flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>Your Verification Passcode:</span>
                  </div>
                  <span className="text-[10px] bg-blue-200/60 dark:bg-blue-900/80 px-1.5 py-0.5 rounded font-medium text-blue-800 dark:text-blue-200">
                    Instant Access
                  </span>
                </div>
                <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-[0.25em] bg-white dark:bg-slate-900 py-2 px-3 rounded text-center border border-blue-200 dark:border-blue-800 my-1.5 shadow-xs">
                  {debugOtp}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Passcode pre-filled below. Check your Spam folder if delayed, or click <strong>Verify & Sign In</strong> below.
                </p>
              </div>
            )}

            {step === 'request' ? (
              /* Step 1: Request OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Institutional College Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rollno@iiitbh.ac.in or student@college.edu"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactile w-full py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {loading ? (
                    <span>Sending Passcode...</span>
                  ) : (
                    <>
                      <span>Send Login Passcode</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter OTP & Login / Reset */
              <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    6-Digit Verification Passcode
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.3em] font-mono text-lg py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      New Password <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to just login, or set new password"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-tactile w-full py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {loading ? (
                    <span>Verifying & Signing In...</span>
                  ) : (
                    <>
                      <span>{newPassword.trim() ? 'Reset Password & Sign In' : 'Verify Passcode & Sign In'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResend}
                    className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300 font-medium hover:underline disabled:opacity-50"
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
                    className="hover:underline"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link to="/login" className="text-xs font-medium text-brand-700 dark:text-brand-300 hover:underline">
                ← Back to Password Login
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
