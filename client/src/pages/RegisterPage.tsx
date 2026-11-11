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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
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

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.terms_accepted) {
      setError('You must accept the Community Regulations and Terms to register.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        roll_number: formData.roll_number,
        academic_year: formData.academic_year,
        department: formData.department,
        password: formData.password,
        terms_accepted: formData.terms_accepted,
      });

      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&otp=${res.data.debugOtp || ''}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = REGISTER_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row">
      {/* Left Column with Sliding IIIT Bhagalpur Photos */}
      <div className="lg:w-5/12 relative min-h-[340px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden select-none">
        {/* Slides */}
        {REGISTER_SLIDES.map((slide, idx) => {
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
                Student Registration Portal
              </p>
            </div>
          </div>

          <span className="glass-chip px-3 py-1 rounded-full text-[10px] font-semibold text-slate-200 tracking-wider hidden sm:inline-block">
            {currentSlide.tag}
          </span>
        </div>

        {/* Middle Highlights */}
        <div className="relative z-20 my-auto py-8 space-y-4 max-w-sm hidden sm:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-white/15 text-slate-200 text-xs font-semibold backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentSlide.location}</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {currentSlide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
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
              <span>Conflict-free club and lab facility reservations</span>
            </div>
          </div>
        </div>

        {/* Bottom Slide Indicators & Footer info */}
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
                    idx === slideIdx
                      ? 'w-7 bg-white shadow-xs'
                      : 'w-2 bg-white/40 hover:bg-white/70'
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

      {/* Right Column: Registration Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-50 dark:bg-slate-950">
        <ScrollReveal direction="slide-left" delay={100} className="w-full max-w-xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>New Student Enrollment</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create College Connect Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provide your official registration details. Your personal identity remains confidential on all public community forums.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-slideDown">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Legal Name (Confidential) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Roll / Student ID (Confidential) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="roll_number"
                      required
                      value={formData.roll_number}
                      onChange={handleChange}
                      placeholder="e.g. 2301CS45"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Authorized College Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rollno@iiitbh.ac.in or student@college.edu"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans transition-colors"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-sans">
                  Approved college whitelist: <strong className="font-mono text-slate-700 dark:text-slate-300">@iiitbh.ac.in</strong> or <strong className="font-mono text-slate-700 dark:text-slate-300">@college.edu</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department / Discipline *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  >
                    <option value="Computer Science and Engineering">Computer Science (CSE)</option>
                    <option value="Electronics and Communication">Electronics & Comm (ECE)</option>
                    <option value="Data Science & Artificial Intelligence">Data Science & AI (DSAI)</option>
                    <option value="Mechatronics & Automation">Mechatronics</option>
                    <option value="Electrical Engineering">Electrical Engg</option>
                    <option value="Administration / Other">Administration / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password (Min 6 characters) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="confirm_password"
                      required
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-brand-800 focus:ring-brand-700 border-slate-300"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    I accept the{' '}
                    <Link to="/terms" target="_blank" className="text-brand-700 dark:text-brand-300 font-medium underline">
                      Community Regulations & Code of Conduct
                    </Link>
                    , anonymous interaction policies, and institute welfare terms.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile w-full py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <span>Processing Registration...</span>
                ) : (
                  <>
                    <span>Create Account & Verify OTP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
