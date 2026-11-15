import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from '../components/common/ScrollReveal';

const LOGIN_SLIDES = [
  {
    image: '/images/iiitbh_panoramic.jpg',
    tag: 'PERMANENT CAMPUS • SABOUR',
    title: 'A Modern Sanctuary of Tech Excellence on River Ganga.',
    subtitle: 'Ultra-modern 50-acre permanent campus at Sabour, Bhagalpur featuring state-of-the-art academic complexes and compute infrastructure.',
    location: 'Sabour, Bhagalpur (25.2425° N, 87.0177° E)',
  },
  {
    image: '/images/iiitbh_academic_block.jpg',
    tag: 'MAIN ACADEMIC COMPLEX',
    title: 'Smart Lecture Theatres & Research Clusters.',
    subtitle: 'Acoustically treated amphitheaters, multimedia learning auditoriums, and high-performance computing facilities.',
    location: 'Academic Complex, Sabour Campus',
  },
  {
    image: '/images/iiitbh_lab.jpg',
    tag: 'ADVANCED RESEARCH LABS',
    title: 'Artificial Intelligence, Robotics & VLSI Laboratories.',
    subtitle: 'Hands-on experimentation environments equipped for cutting-edge semiconductor, machine learning, and IoT research.',
    location: 'Research Block, IIIT Bhagalpur',
  },
  {
    image: '/images/iiitbh_auditorium.jpg',
    tag: 'CONVOCATION CONVENTION HALL',
    title: 'Grand Auditorium & Institutional Symposia.',
    subtitle: 'Venue for international conferences, national hackathons, cultural festivals, and institute convocations.',
    location: 'Central Auditorium, Sabour',
  },
  {
    image: '/images/iiitbh_hostel.jpg',
    tag: 'RESIDENTIAL SECTOR',
    title: 'Serene Residential Life Along the Ganga.',
    subtitle: 'Wi-Fi enabled student hostels with reading halls, indoor recreation, and 24/7 high-speed connectivity.',
    location: 'Brahmaputra & Ganga Hostels',
  },
  {
    image: '/images/iiitbh_fest.jpg',
    tag: 'TARANG CULTURAL FESTIVAL',
    title: 'Vibrant Campus Life, Arts & Inter-College Meets.',
    subtitle: 'Celebration of student innovation, competitive robotics, musical nights, and inter-batch synergy.',
    location: 'Open-Air Amphitheatre, Sabour',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hpWebsite, setHpWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In — IIIT Bhagalpur MITRA';
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % LOGIN_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Spam / bot trap
    if (hpWebsite) {
      setError('Bot submission detected.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid institutional email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        navigate(`/verify-email?email=${encodeURIComponent(err.response.data.email)}`);
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (eMail: string, pass: string) => {
    setEmail(eMail);
    setPassword(pass);
    setError(null);
  };

  const currentSlide = LOGIN_SLIDES[slideIdx];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* 
        ====================================================================
        MOBILE PHONE BRAND HEADER (VISIBLE ONLY ON MOBILE & TABLETS < LG)
        Provides an aesthetic, compact 160px campus banner without pushing
        the login form out of the user's viewport.
        ====================================================================
      */}
      <div className="lg:hidden relative h-40 sm:h-48 w-full overflow-hidden select-none shrink-0 bg-slate-950">
        {/* Dynamic sliding campus imagery */}
        {LOGIN_SLIDES.map((slide, idx) => {
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

        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950/75 to-slate-950/45 z-10" />

        {/* Compact Mobile Branding Strip */}
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
                  MITRA Intranet Portal
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              Sabour Campus
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate max-w-[240px] font-medium flex items-center gap-1 text-slate-200">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{currentSlide.location.split('(')[0]}</span>
            </span>

            {/* Quick Slide Dots */}
            <div className="flex items-center gap-1 shrink-0">
              {LOGIN_SLIDES.map((_, idx) => (
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
        Full 50% split-screen immersive experience with rich campus imagery.
        ====================================================================
      */}
      <div className="hidden lg:flex lg:w-1/2 relative min-h-screen flex-col justify-between p-10 xl:p-12 overflow-hidden select-none">
        {/* Sliding background images with crossfade */}
        {LOGIN_SLIDES.map((slide, idx) => {
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

        {/* Subtle Dark Scrim Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent z-10 pointer-events-none" />

        {/* Desktop Top Header */}
        <div className="relative z-20 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <img
              src="/images/iiitbh_logo.png"
              alt="IIIT Bhagalpur Seal"
              className="w-14 h-14 object-contain bg-white/95 p-1 rounded-xl shadow-xs border border-white/20"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Institute of National Importance
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                IIIT Bhagalpur — Mitra
              </h1>
              <p className="text-xs text-slate-300">
                College Connect Digital Community
              </p>
            </div>
          </div>

          <span className="glass-chip px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 tracking-wider">
            {currentSlide.tag}
          </span>
        </div>

        {/* Desktop Center Campus Slide Content */}
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

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 backdrop-blur-sm text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Career Rooms</span>
              </div>
              <p className="text-[11px] text-slate-300">12+ preparation tracks with quota protections.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 backdrop-blur-sm text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Study Vault</span>
              </div>
              <p className="text-[11px] text-slate-300">Lecture notes, PYQs, and verified practicals.</p>
            </div>
          </div>
        </div>

        {/* Desktop Bottom Slide Indicators */}
        <div className="relative z-20 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev - 1 + LOGIN_SLIDES.length) % LOGIN_SLIDES.length)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev + 1) % LOGIN_SLIDES.length)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {LOGIN_SLIDES.map((s, idx) => (
                <button
                  key={`slide-${idx}`}
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slideIdx ? 'w-7 bg-white shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-serif">
            विद्या ददाति विनयं • Knowledge Imparts Humility
          </span>
        </div>
      </div>

      {/* 
        ====================================================================
        SIGN IN FORM CONTAINER (RESPONSIVE & MOBILE OPTIMIZED)
        Elevated card on mobile with 16px inputs to prevent iOS auto-zoom,
        comfortable 48px touch targets, and immediate accessibility.
        ====================================================================
      */}
      <div className="lg:w-1/2 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-slate-900 lg:bg-slate-50 dark:lg:bg-slate-950 flex-1 -mt-4 sm:-mt-6 lg:mt-0 relative z-20">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Section Heading */}
          <div className="px-1 sm:px-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-blue-400 lg:text-blue-700 dark:lg:text-blue-400 uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Campus Intranet Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white lg:text-slate-900 dark:lg:text-white">
              Student Sign In
            </h2>
            <p className="text-xs text-slate-400 lg:text-slate-500 dark:lg:text-slate-400 mt-0.5 leading-relaxed">
              Enter your institutional college email (<code className="font-mono text-blue-400 lg:text-blue-700 dark:lg:text-blue-300">@iiitbh.ac.in</code>)
            </p>
          </div>

          {/* Elevated Auth Card */}
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

            <form onSubmit={handleLogin} className="space-y-4">
              {/* College Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                  College Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 sm:w-4 sm:h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rollno@iiitbh.ac.in"
                    /* text-base on mobile prevents iOS Safari auto-zoom; text-sm on sm screens */
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-400 lg:text-blue-600 dark:text-blue-400 hover:underline py-1 -mr-1"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 sm:w-4 sm:h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    /* text-base on mobile prevents iOS Safari auto-zoom; text-sm on sm screens */
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Invisible Honeypot Spam Trap for Automated Bots */}
              <input
                type="text"
                name="hp_website"
                value={hpWebsite}
                onChange={(e) => setHpWebsite(e.target.value)}
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Primary Call to Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full py-3.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] active:scale-[0.99]"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to MITRA Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Secondary Option: Direct Email OTP Login */}
              <div className="text-center pt-0.5">
                <Link
                  to="/forgot-password"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-700/60 lg:border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-300 lg:text-slate-600 dark:text-slate-300 hover:bg-slate-800/40 lg:hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Sign In with Email OTP instead</span>
                </Link>
              </div>
            </form>

            {/* Quick Evaluation Demo Accounts (Visible strictly during local development) */}
            {import.meta.env.DEV && (
              <div className="pt-3 border-t border-slate-700/60 lg:border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-slate-400 lg:text-slate-500 uppercase tracking-wider">
                    Dev Quick-Fill Credentials
                  </p>
                  <span className="text-[9px] font-mono text-amber-300 lg:text-amber-700 dark:text-amber-400 bg-amber-500/10 lg:bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 lg:border-amber-200 dark:border-amber-800 font-semibold">
                    DEV ONLY
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('student1@college.edu', 'Student@123')}
                    className="p-2 rounded-lg bg-slate-900/50 lg:bg-slate-50 dark:bg-slate-800/60 border border-slate-700 lg:border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition-colors"
                  >
                    <div className="font-semibold text-xs flex items-center gap-1 text-white lg:text-slate-900 dark:text-white">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span>Student 1</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">student1</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount('student2@college.edu', 'Student@123')}
                    className="p-2 rounded-lg bg-slate-900/50 lg:bg-slate-50 dark:bg-slate-800/60 border border-slate-700 lg:border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition-colors"
                  >
                    <div className="font-semibold text-xs flex items-center gap-1 text-white lg:text-slate-900 dark:text-white">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span>Student 2</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">student2</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickAccount('admin@iiitbh.ac.in', 'Admin@123')}
                    className="p-2 rounded-lg bg-slate-900/50 lg:bg-slate-50 dark:bg-slate-800/60 border border-slate-700 lg:border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition-colors"
                  >
                    <div className="font-semibold text-xs flex items-center gap-1 text-white lg:text-slate-900 dark:text-white">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">admin</div>
                  </button>
                </div>
              </div>
            )}

            {/* Registration Prompt & Statutory Legal Links */}
            <div className="text-center pt-2 space-y-3">
              <p className="text-xs text-slate-300 lg:text-slate-600 dark:text-slate-400">
                New student at IIIT Bhagalpur?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-400 lg:text-blue-600 dark:text-blue-400 hover:underline inline-block py-1"
                >
                  Create College Account &rarr;
                </Link>
              </p>

              <div className="pt-2 border-t border-slate-700/60 lg:border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-3 text-[11px] text-slate-400 lg:text-slate-500 dark:text-slate-400">
                <Link to="/terms" className="hover:text-blue-400 lg:hover:text-blue-600 underline py-1">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" className="hover:text-blue-400 lg:hover:text-blue-600 underline py-1">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
