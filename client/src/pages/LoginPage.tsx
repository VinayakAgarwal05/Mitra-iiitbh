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
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const LOGIN_SLIDES = [
  {
    image: '/images/iiitbh_drone_aerial.jpg',
    tag: 'PERMANENT CAMPUS • SABOUR',
    title: 'A verified digital home for the students of IIIT Bhagalpur.',
    subtitle: 'Collaborate anonymously in Career Path Rooms, access verified study materials, and report campus concerns privately.',
    location: 'Sabour, Bhagalpur (25.2425° N, 87.0177° E)',
  },
  {
    image: '/images/iiitbh_academic_block.jpg',
    tag: 'ACADEMIC COMPLEX',
    title: 'Cutting-Edge Laboratories & Research Clusters.',
    subtitle: 'High-performance computing resources, IoT development labs, and automated campus facility bookings.',
    location: 'Main Academic Block, Sabour Campus',
  },
  {
    image: '/images/iiitbh_campus_infrastructure.jpg',
    tag: 'STUDENT RESIDENCE & LIFE',
    title: 'Inter-Batch Knowledge Exchange & Community.',
    subtitle: 'Engage with senior mentors, coordinate club activities, and exchange guidance with complete identity privacy.',
    location: 'Residential Campus & Quadrangle',
  },
  {
    image: '/images/iiitbh_campus_1.jpg',
    tag: 'ADMINISTRATIVE SUPPORT',
    title: 'Confidential Grievance & Student Welfare Cell.',
    subtitle: 'Direct encrypted communication with institute authorities for swift resolution of campus and hostel issues.',
    location: 'Administrative Complex, IIIT Bhagalpur',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % LOGIN_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
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
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Left Column with Auto-Sliding IIIT Bhagalpur Campus Photographs */}
      <div className="lg:w-1/2 relative min-h-[360px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden select-none">
        {/* Sliding background images with crossfade */}
        {LOGIN_SLIDES.map((slide, idx) => {
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

        {/* Subtle Dark Scrim Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent z-10 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <img
              src="/images/iiitbh_logo.png"
              alt="IIIT Bhagalpur Seal"
              className="w-13 h-13 sm:w-14 sm:h-14 object-contain bg-white/95 p-1 rounded-xl shadow-xs border border-white/20"
            />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Institute of National Importance
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                IIIT Bhagalpur — Mitra
              </h1>
              <p className="text-xs text-slate-300">
                College Connect Digital Community
              </p>
            </div>
          </div>

          <span className="glass-chip px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 tracking-wider hidden sm:inline-block">
            {currentSlide.tag}
          </span>
        </div>

        {/* Center Campus Slide Content */}
        <div className="relative z-20 my-auto py-8 space-y-4 max-w-lg hidden sm:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/15 text-slate-200 text-xs font-semibold backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentSlide.location}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
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

        {/* Bottom Slide Indicators & Footer info */}
        <div className="relative z-20 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            {LOGIN_SLIDES.map((s, idx) => (
              <button
                key={s.image}
                onClick={() => setSlideIdx(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === slideIdx
                    ? 'w-7 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-400">
            विद्या ददाति विनयं • Knowledge Imparts Humility
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-6 animate-fadeIn">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Campus Intranet Authentication</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your verified college email address (<code className="font-mono text-brand-700 dark:text-brand-300">@iiitbh.ac.in</code> or <code className="font-mono text-brand-700 dark:text-brand-300">@college.edu</code>)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-slideDown">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Evaluation Demo Accounts */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                1-Click Evaluation Accounts
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickAccount('student1@college.edu', 'Student@123')}
                  className="btn-tactile p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-brand-500 text-left transition-colors"
                >
                  <div className="font-semibold text-xs flex items-center gap-1 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-3 h-3 text-brand-600" />
                    <span>Student 1</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">student1</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickAccount('student2@college.edu', 'Student@123')}
                  className="btn-tactile p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-brand-500 text-left transition-colors"
                >
                  <div className="font-semibold text-xs flex items-center gap-1 text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-3 h-3 text-brand-600" />
                    <span>Student 2</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">student2</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickAccount('admin@iiitbh.ac.in', 'Admin@123')}
                  className="btn-tactile p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-brand-500 text-left transition-colors"
                >
                  <div className="font-semibold text-xs flex items-center gap-1 text-slate-900 dark:text-white">
                    <Shield className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">admin</div>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                New student at IIIT Bhagalpur?{' '}
                <Link to="/register" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
                  Register with College Email
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
