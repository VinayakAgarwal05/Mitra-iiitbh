import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Hash,
  BookOpen,
  Lock,
  AlertCircle,
  ArrowRight,
  Shield,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { ScrollReveal } from '../components/common/ScrollReveal';

const REGISTER_SLIDES = [
  {
    image: '/images/iiitbh_panoramic.jpg',
    tag: 'SABOUR PERMANENT CAMPUS',
    title: 'A Vibrant New Home for Future Technologists.',
    subtitle: '50-acre cutting-edge campus on the banks of River Ganga, fostering academic brilliance and community.',
    location: 'Permanent Campus, Sabour, Bhagalpur',
  },
  {
    image: '/images/iiitbh_academic_block.jpg',
    tag: 'MAIN ACADEMIC COMPLEX',
    title: 'Smart Lecture Halls & Interdisciplinary Research.',
    subtitle: 'Access protected career discussions, student-led study repositories, and verified mentors.',
    location: 'Main Academic Block, Sabour Campus',
  },
  {
    image: '/images/iiitbh_lab.jpg',
    tag: 'RESEARCH LABORATORIES',
    title: 'Hardware & AI Computing Infrastructure.',
    subtitle: 'Equipped with next-generation GPU servers, embedded system suites, and IoT testing arenas.',
    location: 'Advanced Computing Cluster, IIITBH',
  },
  {
    image: '/images/iiitbh_auditorium.jpg',
    tag: 'CENTRAL AUDITORIUM',
    title: 'Conferences, Hackathons & Convocations.',
    subtitle: 'A grand auditorium hosting national technical symposiums, research summits, and guest keynote lectures.',
    location: 'Convention Complex, Sabour',
  },
  {
    image: '/images/iiitbh_hostel.jpg',
    tag: 'STUDENT RESIDENCE',
    title: 'Modern Hostel Facilities & Campus Life.',
    subtitle: 'Wi-Fi enabled student hostels with reading halls, indoor recreation, and 24/7 high-speed connectivity.',
    location: 'Residential Sector, IIIT Bhagalpur',
  },
  {
    image: '/images/iiitbh_fest.jpg',
    tag: 'TARANG CULTURAL FEST',
    title: 'Arts, Cultural Nights & Technical Showcases.',
    subtitle: 'Annual institute festival uniting student talents across Bihar and national collegiate networks.',
    location: 'Amphitheatre & Arena, Sabour',
  },
];

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    academic_year: '1st Year',
    department: 'Computer Science and Engineering',
    password: '',
    confirm_password: '',
    terms_accepted: false,
  });
  const [hpWebsite, setHpWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account — IIIT Bhagalpur MITRA';
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % REGISTER_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Spam / bot trap
    if (hpWebsite) {
      setError('Automated submission rejected.');
      return;
    }

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setError('Please provide your full legal name (minimum 2 characters).');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid institutional college email address.');
      return;
    }

    if (!formData.roll_number.trim()) {
      setError('College Roll Number / Student ID is required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.terms_accepted) {
      setError('You must accept the Community Regulations and Privacy Policy to register.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        full_name: formData.full_name.trim(),
        email: cleanEmail,
        roll_number: formData.roll_number.trim(),
        academic_year: formData.academic_year,
        department: formData.department,
        password: formData.password,
        terms_accepted: formData.terms_accepted,
      });

      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = REGISTER_SLIDES[slideIdx];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-900 flex flex-col lg:flex-row overflow-x-hidden">
      {/* 
        ====================================================================
        MOBILE PHONE BRAND HEADER (VISIBLE ONLY ON MOBILE & TABLETS < LG)
        ====================================================================
      */}
      <div className="lg:hidden relative h-40 sm:h-48 w-full overflow-hidden select-none shrink-0 bg-slate-950">
        {REGISTER_SLIDES.map((slide, idx) => {
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
                  Student Registration
                </span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              New Account
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate max-w-[240px] font-medium flex items-center gap-1 text-slate-200">
              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{currentSlide.location.split('(')[0]}</span>
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {REGISTER_SLIDES.map((_, idx) => (
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
      <div className="hidden lg:flex lg:w-5/12 relative min-h-screen flex-col justify-between p-10 xl:p-12 overflow-hidden select-none">
        {REGISTER_SLIDES.map((slide, idx) => {
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

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent z-10 pointer-events-none" />

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
                Student Registration Portal
              </p>
            </div>
          </div>

          <span className="glass-chip px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 tracking-wider">
            {currentSlide.tag}
          </span>
        </div>

        <div className="relative z-20 my-auto py-8 space-y-4 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/15 text-slate-200 text-xs font-semibold backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentSlide.location}</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {currentSlide.subtitle}
          </p>

          <div className="space-y-2 pt-2 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Identity privacy guaranteed across public rooms</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified college email OTP authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Access to academic materials & lab booking</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev - 1 + REGISTER_SLIDES.length) % REGISTER_SLIDES.length)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSlideIdx((prev) => (prev + 1) % REGISTER_SLIDES.length)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {REGISTER_SLIDES.map((s, idx) => (
                <button
                  key={s.image}
                  onClick={() => setSlideIdx(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slideIdx ? 'w-7 bg-white shadow-xs' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Sabour Campus • Bihar 813210
          </span>
        </div>
      </div>

      {/* 
        ====================================================================
        REGISTRATION FORM CONTAINER (RESPONSIVE & MOBILE OPTIMIZED)
        ====================================================================
      */}
      <div className="lg:w-7/12 flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-slate-900 lg:bg-slate-50 dark:lg:bg-slate-950 flex-1 -mt-4 sm:-mt-6 lg:mt-0 relative z-20">
        <div className="w-full max-w-xl space-y-4 sm:space-y-6">
          <div className="px-1 sm:px-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-blue-400 lg:text-blue-700 dark:lg:text-blue-400 uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>New Student Enrollment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white lg:text-slate-900 dark:lg:text-white">
              Create College Connect Account
            </h2>
            <p className="text-xs text-slate-400 lg:text-slate-500 dark:lg:text-slate-400 mt-0.5 leading-relaxed">
              Official institutional registration for IIIT Bhagalpur students.
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

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Full Legal Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      required
                      autoComplete="name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Roll / Student ID *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="roll_number"
                      required
                      value={formData.roll_number}
                      onChange={handleChange}
                      placeholder="e.g. 2301CS45"
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-mono uppercase transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* College Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                  Authorized College Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rollno@iiitbh.ac.in"
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400 lg:text-slate-500 font-sans">
                  Approved domain whitelist: <strong className="font-mono text-blue-400 lg:text-blue-700 dark:text-blue-300">@iiitbh.ac.in</strong> or <strong className="font-mono text-blue-400 lg:text-blue-700 dark:text-blue-300">@college.edu</strong>
                </p>
              </div>

              {/* Year & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className="w-full px-3 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white text-base sm:text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate (M.Tech/MS/PhD)">Postgraduate (M.Tech/MS/PhD)</option>
                    <option value="Faculty / Staff">Faculty / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Department / Branch *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white text-base sm:text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="Computer Science and Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Electronics and Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                    <option value="Mechatronics and Automation Engineering">Mechatronics & Automation Engineering (MEA)</option>
                    <option value="Mathematics and Computing">Mathematics and Computing (MnC)</option>
                    <option value="Administration / Other">Administration / Other</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Password (Min 6 characters) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 lg:text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="confirm_password"
                      required
                      autoComplete="new-password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 rounded-xl bg-slate-900/80 lg:bg-slate-50 dark:bg-slate-800 border border-slate-600/80 lg:border-slate-300 dark:border-slate-700 text-white lg:text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-xs font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Invisible Honeypot Spam Trap */}
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

              {/* Terms & Conditions Acceptance */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-500 lg:border-slate-300 shrink-0"
                  />
                  <span className="text-xs text-slate-300 lg:text-slate-600 dark:text-slate-400 leading-normal">
                    I accept the{' '}
                    <Link to="/terms" target="_blank" className="text-blue-400 lg:text-blue-600 font-semibold underline">
                      Community Regulations
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" className="text-blue-400 lg:text-blue-600 font-semibold underline">
                      Privacy Policy
                    </Link>
                    , including anonymous discourse and academic integrity guidelines.
                  </span>
                </label>
              </div>

              {/* Primary Call to Action */}
              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full py-3.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] active:scale-[0.99]"
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <span>Create Account & Verify Passcode</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 space-y-3">
              <p className="text-xs text-slate-300 lg:text-slate-600 dark:text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-blue-400 lg:text-blue-600 dark:text-blue-400 hover:underline inline-block py-1">
                  Sign In to MITRA &rarr;
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
