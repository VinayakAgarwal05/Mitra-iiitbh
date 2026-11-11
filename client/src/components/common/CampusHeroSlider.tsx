import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Shield,
  Sparkles,
} from 'lucide-react';

interface CampusHeroSliderProps {
  user: any;
}

interface SlideItem {
  id: number;
  image: string;
  tag: string;
  title: string;
  subtitle: string;
  location: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 0,
    image: '/images/iiitbh_panoramic.jpg',
    tag: 'PERMANENT CAMPUS • SABOUR',
    title: 'Indian Institute of Information Technology Bhagalpur',
    subtitle: 'State-of-the-art permanent campus situated along the holy River Ganga with cutting-edge academic architecture.',
    location: 'Sabour, Bhagalpur, Bihar (25.2425° N, 87.0177° E)',
  },
  {
    id: 1,
    image: '/images/iiitbh_academic_block.jpg',
    tag: 'ACADEMIC COMPLEX & INNOVATION',
    title: 'High-Tech Engineering & Research Infrastructure',
    subtitle: 'World-class compute clusters, dynamic lecture theatres, and dedicated research centers for CSE, ECE, MAE, and MNC.',
    location: 'Main Academic Block, IIIT Bhagalpur',
  },
  {
    id: 2,
    image: '/images/iiitbh_lab.jpg',
    tag: 'ROBOTICS & VLSI LABS',
    title: 'Advanced Laboratories & Research Arenas',
    subtitle: 'Hands-on experimentation in IoT, Robotics, Embedded Systems, and High Performance Computing.',
    location: 'Departmental Laboratories & Innovation Hub',
  },
  {
    id: 3,
    image: '/images/iiitbh_auditorium.jpg',
    tag: 'CONVOCATION & AUDITORIUM',
    title: 'Campus Auditoriums & Seminar Halls',
    subtitle: 'Hosting international symposia, institute convocations, guest lectures, and student hackathons.',
    location: 'Central Auditorium & Convention Center',
  },
  {
    id: 4,
    image: '/images/iiitbh_hostel.jpg',
    tag: 'STUDENT RESIDENCE & LIFE',
    title: 'Modern Hostels & Student Well-Being',
    subtitle: 'Comfortable hostel accommodation with high-speed campus LAN, sports facilities, and 24x7 proctorial oversight.',
    location: 'Hostel Blocks & Student Residential Sector',
  },
  {
    id: 5,
    image: '/images/iiitbh_fest.jpg',
    tag: 'CULTURAL FEST & TARANG',
    title: 'Tarang • Vibrance, Arts & Innovation',
    subtitle: 'Annual institutional fest celebrating creativity, technical hackathons, music performances, and campus camaraderie.',
    location: 'Open Air Amphitheatre & Campus Arena',
  },
  {
    id: 6,
    image: '/images/iiitbh_campus_infrastructure.jpg',
    tag: 'INSTITUTE REGISTRY & SERVICES',
    title: 'Mitra Intranet • Student Care & Mentorship',
    subtitle: 'Academic vault, confidential grievances, senior peer mentors, and transparent facility reservations.',
    location: 'Administrative Complex, Sabour Campus',
  },
];

export const CampusHeroSlider: React.FC<CampusHeroSliderProps> = ({ user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentSlide]);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xs min-h-[300px] sm:min-h-[340px] flex flex-col justify-between bg-slate-950 text-white select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade and Subtle Zoom */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
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

      {/* Aesthetic Scrim Gradient (Whisper subtle left-to-right & bottom-to-top) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 z-10 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-20 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/images/iiitbh_logo.png"
            alt="IIIT Bhagalpur Emblem"
            className="w-9 h-9 object-contain bg-white/95 p-0.5 rounded-lg shadow-xs"
          />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              IIIT Bhagalpur • Mitra Portal
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{SLIDES[currentSlide].location}</span>
            </div>
          </div>
        </div>

        {/* Live slide tag & intranet indicator */}
        <div className="flex items-center gap-2">
          <span className="glass-chip px-3 py-1 rounded-full text-[11px] font-medium text-slate-200 tracking-wider">
            {SLIDES[currentSlide].tag}
          </span>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulseSlow" />
            <span>Active Intranet</span>
          </div>
        </div>
      </div>

      {/* Main Slide Content with smooth transition keying */}
      <div className="relative z-20 px-5 sm:px-8 py-4 space-y-2 max-w-2xl my-auto">
        <div className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[11px] font-medium text-slate-300 mb-1 border border-white/15">
          {greeting}, {user?.full_name?.split(' ')[0] || user?.full_name}
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          {SLIDES[currentSlide].title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
          {SLIDES[currentSlide].subtitle}
        </p>
      </div>

      {/* Bottom Controls Strip: Slide Progress Pills & Quick Action Buttons */}
      <div className="relative z-20 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
        {/* Interactive Indicator Pills */}
        <div className="flex items-center gap-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
          <span className="text-[11px] text-slate-400 ml-2 font-mono">
            {(currentSlide + 1).toString().padStart(2, '0')} / {SLIDES.length.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/student-issues"
            className="btn-tactile px-3.5 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>File Grievance</span>
          </Link>

          <Link
            to="/study-materials"
            className="btn-tactile px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs flex items-center gap-1.5 transition-colors backdrop-blur-xs border border-white/20"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Notes</span>
          </Link>

          <Link
            to="/career-rooms"
            className="btn-tactile px-3.5 py-1.5 rounded-lg bg-brand-800 hover:bg-brand-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Career Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/15">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
