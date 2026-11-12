import React, { useState } from 'react';
import {
  Compass,
  Award,
  BookOpen,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Target,
  Sparkles,
  CheckCircle2,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Globe,
  Quote,
  Lightbulb,
  FileCheck,
  Rocket,
  Landmark,
} from 'lucide-react';
import { ScrollReveal } from '../components/common/ScrollReveal';

export const VisionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'vision' | 'director' | 'registrar' | 'deans' | 'hods'>('all');

  const missionPillars = [
    {
      number: '01',
      title: 'Enhance Student Learning Environment',
      icon: GraduationCap,
      color: 'blue',
      description:
        'Cultivating active learning through project-based education, continuous research internships, ethical grounding, problem-solving pedagogy, and rigorous academic standards.',
    },
    {
      number: '02',
      title: 'Multi-Disciplinary Curricular Transition (NEP 2020)',
      icon: Cpu,
      color: 'teal',
      description:
        'Implementing National Education Policy 2020 tenets with flexible multiple entry/exit options, minor degrees, honours tracks, and cross-disciplinary electives in AI, IoT, sustainability, and management.',
    },
    {
      number: '03',
      title: 'Research, Innovation & Resource Development',
      icon: Rocket,
      color: 'purple',
      description:
        'Building a vibrant research and consultancy ecosystem supported by central and state grants, DST/MeitY sponsored clusters, patent generation, and high-impact publications.',
    },
    {
      number: '04',
      title: 'Campus Community & Holistic Transformation',
      icon: Users,
      color: 'emerald',
      description:
        'Recruiting and retaining premier faculty, mentoring diverse student cohorts, supporting incubators and startups, and providing modern residential living on the River Ganga.',
    },
    {
      number: '05',
      title: 'Regional Outreach & Vikshit Bharat 2047',
      icon: Globe,
      color: 'amber',
      description:
        'Leveraging information technology for local socioeconomic empowerment across Eastern Bihar—improving healthcare technology, agro-informatics, regional skill building, and national digital infrastructure.',
    },
  ];

  const associateDeans = [
    {
      name: 'Dr. Himadri Nayak',
      role: 'Associate Dean (Academic Affairs)',
      portfolio: 'Academic curriculum execution, examination governance, credit transfers, and NEP 2020 multi-disciplinary course offerings.',
      email: 'doaa@iiitbh.ac.in',
      altEmail: 'hnayak.ece@iiitbh.ac.in',
      department: 'Electronics & Communication Engineering',
      icon: BookOpen,
      badge: 'DOAA',
    },
    {
      name: 'Dr. Dheeraj Kumar Sinha',
      role: 'Associate Dean (Student Welfare)',
      portfolio: 'Student well-being, club governance, Tarang annual festival, hostel administration, mental wellness support, and grievance redressal.',
      email: 'dosa@iiitbh.ac.in',
      altEmail: 'dksinha.ece@iiitbh.ac.in',
      department: 'Electronics & Communication Engineering',
      icon: Users,
      badge: 'DOSA',
    },
    {
      name: 'Dr. Thejaswini M',
      role: 'Associate Dean (Research & Consultancy)',
      portfolio: 'Sponsored research projects, MoUs, industrial consultancy, intellectual property & patents, and PhD scholar development.',
      email: 'dornc@iiitbh.ac.in',
      altEmail: 'thejaswini.cse@iiitbh.ac.in',
      department: 'Computer Science & Engineering',
      icon: Rocket,
      badge: 'DORnC',
    },
    {
      name: 'Dr. Pradeep Kumar Biswal',
      role: 'Associate Dean (Development & Planning)',
      portfolio: 'Permanent Sabour campus infrastructure expansion, smart energy networks, laboratory modernization, and capital projects.',
      email: 'dodnp@iiitbh.ac.in',
      altEmail: 'pkbiswal.cse@iiitbh.ac.in',
      department: 'Computer Science & Engineering',
      icon: Building2,
      badge: 'DODnP',
    },
    {
      name: 'Dr. Purnendu Kumar Mandal',
      role: 'Associate Dean (Faculty Welfare)',
      portfolio: 'Faculty career progression, recruitment coordination, academic leave administration, and research facilitation.',
      email: 'dofa@iiitbh.ac.in',
      altEmail: 'pkmandal.ece@iiitbh.ac.in',
      department: 'Electronics & Communication Engineering',
      icon: Award,
      badge: 'DOFA',
    },
    {
      name: 'Dr. Prakash Ranjan',
      role: 'Associate Dean (Alumni & Institutional Relations)',
      portfolio: 'Global alumni engagement network, corporate relations, industry placement synergy, and international university partnerships.',
      email: 'dean.ir@iiitbh.ac.in',
      altEmail: 'pranjan.ece@iiitbh.ac.in',
      department: 'Electronics & Communication Engineering',
      icon: Globe,
      badge: 'DOIR',
    },
  ];

  const departmentHeads = [
    {
      department: 'Computer Science & Engineering',
      head: 'Dr. Pradeep Kumar Biswal',
      designation: 'Assistant Professor & Head of Department',
      email: 'hod.cse@iiitbh.ac.in',
      focus: 'High Performance Computing, AI & Machine Learning, Distributed Systems, Algorithms, and Software Engineering.',
    },
    {
      department: 'Electronics & Communication Engineering',
      head: 'Dr. Sanjay Kumar',
      designation: 'Assistant Professor & Head of Department',
      email: 'hod.ece@iiitbh.ac.in',
      focus: 'VLSI Design, Embedded Systems, Wireless Communication, Signal Processing, and Semiconductor Devices.',
    },
    {
      department: 'Mechatronics & Automation Engineering',
      head: 'Dr. Abhinav Gautam',
      designation: 'Assistant Professor & Head of Department',
      email: 'hod.mea@iiitbh.ac.in',
      focus: 'Robotics, Industrial Automation, Cyber-Physical Systems, Control Systems, and Micro-Electro-Mechanical Systems (MEMS).',
    },
    {
      department: 'Basic Science & Humanities',
      head: 'Dr. Pankaj Kumar Tiwari',
      designation: 'Assistant Professor & Head of Department',
      email: 'hod.bsh@iiitbh.ac.in',
      focus: 'Applied Mathematics, Quantum Physics, Materials Science, Technical Communication, and Professional Ethics.',
    },
    {
      department: 'Centre of Excellence in AI & Data Science',
      head: 'Dr. Dilip Kumar Choubey',
      designation: 'Assistant Professor & Head of Centre',
      email: 'hocoe@iiitbh.ac.in',
      focus: 'Interdisciplinary Deep Learning, Natural Language Processing, Computer Vision, and Healthcare AI Diagnostics.',
    },
    {
      department: 'Computer Centre Infrastructure',
      head: 'Dr. Dilip Kumar Choubey',
      designation: 'Faculty In-Charge, Central Computing Facilities',
      email: 'hocc@iiitbh.ac.in',
      focus: 'Campus Gigabit Backbone, High Performance Compute Clusters, Cloud Virtualization, and Academic Intranet Services.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. HERO BANNER */}
      <ScrollReveal direction="slide-down" delay={50}>
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-xl bg-slate-950 text-white">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src="/images/iiitbh_academic_block.jpg"
              alt="IIIT Bhagalpur Main Academic Complex"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  <Landmark className="w-3.5 h-3.5 text-blue-400" />
                  <span>Institute of National Importance • PPP Mode</span>
                </div>
                <div className="glass-chip px-3 py-1 rounded-full text-[11px] font-semibold text-slate-200 hidden sm:block">
                  Permanent Campus • Sabour, Bhagalpur
                </div>
              </div>

              <div className="space-y-2 max-w-3xl">
                <div className="text-xs sm:text-sm font-semibold tracking-widest text-blue-300 uppercase font-mono">
                  विद्या ददाति विनयं • Knowledge Imparts Humility
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Institutional Vision & Executive Leadership
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
                  Strategic governance, administrative mandates, and the future-ready roadmap guiding the Indian Institute of Information Technology Bhagalpur toward global technical excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. SECTION NAVIGATION TABS */}
      <ScrollReveal direction="fade" delay={100}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
          {[
            { id: 'all', label: 'Complete Overview' },
            { id: 'vision', label: 'Vision & Mission Pillars' },
            { id: 'director', label: "Director's Vision & Message" },
            { id: 'registrar', label: 'Registrar & Administration' },
            { id: 'deans', label: "Deans' Council" },
            { id: 'hods', label: 'Department Heads & Centres' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`btn-tactile px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* 3. CORE INSTITUTE VISION & MISSION (When 'all' or 'vision') */}
      {(activeTab === 'all' || activeTab === 'vision') && (
        <section className="space-y-6">
          <ScrollReveal direction="slide-up" delay={120}>
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-950/20 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950 border border-blue-200/60 dark:border-blue-900/40 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Guiding Institutional North Star
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    The Vision of IIIT Bhagalpur
                  </h2>
                </div>
              </div>

              <blockquote className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-600 dark:border-blue-500 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                “To create technocrats by providing high-quality education and research by inculcating technical skills so that they can play a pivotal role in transforming the world and serving the community.”
              </blockquote>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    <Rocket className="w-4 h-4" />
                    <span>Research & Development Vision</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    To build a dynamic and vibrant research and development ecosystem that serves as a catalyst for innovation, technology-driven solutions, patent filings, and socioeconomic progress across India.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Vikshit Bharat 2047 Roadmap</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Aligning higher technical education with the national aspiration of a self-reliant, technologically sovereign nation by advancing semiconductor design, AI infrastructure, and indigenous robotics.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 5 Strategic Mission Pillars */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-600" />
                  Five Strategic Mission Pillars
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The foundational tenets driving curriculum design, research grants, student welfare, and regional outreach.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missionPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <ScrollReveal key={pillar.number} direction="slide-up" delay={idx * 60}>
                    <div className="h-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400">
                            Pillar {pillar.number}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {pillar.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. DIRECTOR'S VISION & MESSAGE (When 'all' or 'director') */}
      {(activeTab === 'all' || activeTab === 'director') && (
        <section className="space-y-6 pt-4">
          <ScrollReveal direction="slide-up" delay={100}>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
              {/* Director Header Card */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row items-center gap-6">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800">
                    <img
                      src="/images/director_madhusudan_singh.jpg"
                      alt="Prof. Madhusudan Singh, Director IIIT Bhagalpur"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white border border-white/20 shadow-xs">
                    Director
                  </span>
                </div>

                <div className="space-y-2 text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>Executive Leadership of the Institute</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Prof. Madhusudan Singh
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200 font-medium">
                    Director, Indian Institute of Information Technology Bhagalpur
                  </p>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Senior Professor, Department of Electrical Engineering, Delhi Technological University (DTU, formerly Delhi College of Engineering). Assumed office on June 17, 2025.
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300 flex-wrap">
                    <a
                      href="mailto:director@iiitbh.ac.in"
                      className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>director@iiitbh.ac.in</span>
                    </a>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5" />
                      <span>0641-2201064</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Director’s Office, Sabour Campus</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Director's Message */}
              <div className="p-6 sm:p-8 space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
                  <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="font-semibold text-slate-900 dark:text-blue-100 text-sm sm:text-base italic leading-snug">
                    “Let us join hands together to realize the vision of Vikshit Bharat 2047 and a technologically empowered India.”
                  </p>
                </div>

                <div className="space-y-4">
                  <p>
                    It gives me immense pride to lead the <strong>Indian Institute of Information Technology (IIIT) Bhagalpur</strong>, an institute of national importance committed to academic excellence, cutting-edge research, and innovation/entrepreneurial activities in the domain of Information Technology and its allied areas.
                  </p>
                  <p>
                    The institute is situated on the southern bank of the holy River Ganga in Bhagalpur. The construction of <strong>Phase-I of the permanent campus was completed in 2024</strong>, and the institute is now fully functional from its permanent campus in <strong>Sabour, Bhagalpur</strong>. The new campus is equipped with state-of-the-art facilities like the administrative building, modern lecture theaters, laboratories, computer centre, library, hostels, cafeteria, and indoor/outdoor sports infrastructures.
                  </p>
                  <p>
                    At IIIT Bhagalpur, we strive to nurture innovation, foster critical thinking, and develop the next generation of technocrats and leaders for a rapidly evolving world. The institute admits students in B.Tech programs through the prestigious <strong>JEE (Mains)</strong> via <strong>JoSAA/CSAB counselling</strong> conducted jointly with IITs, NITs, and IIITs.
                  </p>
                  <p>
                    <strong>National Education Policy (NEP 2020) Alignment:</strong> IIIT Bhagalpur has comprehensively revised its curriculum based on NEP 2020. The new curriculum emphasizes multi-disciplinary and trans-disciplinary study and includes courses in engineering, sciences, social sciences, humanities, environmental sustainability, artificial intelligence, and management. Provisions for exiting at different levels of study have been instituted towards multiple entry and exit options in all programs.
                  </p>
                  <p>
                    Students have expansive options for minors, core specializations/Honours degrees, and skill-oriented learning. Strong emphasis is placed on industry-relevant certifications, hands-on workshops, project work, and <strong>semester-long industrial internships</strong>, ensuring that our students are not only academically sound but also equipped with the practical skills needed to excel globally.
                  </p>
                  <p>
                    I invite all stakeholders—students, faculty, alumni, industry partners, employers, and government organizations—to join us in this exciting journey of growth, excellence, and nation-building.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Prof. Madhusudan Singh</span>
                    <span className="text-slate-500 text-xs block">Director, IIIT Bhagalpur</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Official Message Verified from iiitbh.ac.in
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 5. REGISTRAR & ADMINISTRATIVE RECTOR (When 'all' or 'registrar') */}
      {(activeTab === 'all' || activeTab === 'registrar') && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Registrar’s Office & General Administration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Executive custody of institute records, e-governance infrastructure, statutory compliance, and campus operations.
              </p>
            </div>
          </div>

          <ScrollReveal direction="slide-up" delay={100}>
            <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    DS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Dr. Dheeraj Kumar Sinha
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Registrar (I/C)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Took Charge on May 7, 2026 • Assistant Professor, Dept. of ECE
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <a
                    href="mailto:registrar@iiitbh.ac.in"
                    className="btn-tactile px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>registrar@iiitbh.ac.in</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Administrative Responsibilities</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>• Statutory custody of official records, campus assets, and institute agreements.</li>
                    <li>• Implementation of Board of Governors (BoG) and Senate resolutions.</li>
                    <li>• General administration, establishment, legal compliance, and RTI management.</li>
                    <li>• Seamless coordination with Ministry of Education (MoE) and state authorities.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Administrative Vision for Students</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    “Fostering a transparent, paperless, and empathetic campus administration where every student grievance is resolved swiftly, digital portal workflows are frictionless, and the Sabour permanent campus functions with world-class efficiency and safety.”
                  </p>
                </div>
              </div>

              {/* Assistant Registrars */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Assistant Registrars in Administration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                      AA
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        Mr. Akshay Agarwal
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Assistant Registrar (Store & Purchase, Establishment & General Admin)
                      </p>
                      <a
                        href="mailto:akshay.ar@iiitbh.ac.in"
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-block pt-1 font-mono"
                      >
                        akshay.ar@iiitbh.ac.in
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                      AB
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        Ms. Abhilasha Bharti
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Assistant Registrar (Academic Affairs & Student Welfare)
                      </p>
                      <a
                        href="mailto:abhilasha.ar@iiitbh.ac.in"
                        className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline inline-block pt-1 font-mono"
                      >
                        abhilasha.ar@iiitbh.ac.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* 6. ASSOCIATE DEANS COUNCIL (When 'all' or 'deans') */}
      {(activeTab === 'all' || activeTab === 'deans') && (
        <section className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              The Deans' Council (Associate Deans)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty leadership presiding over academic curriculum, research grants, student welfare, and campus infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {associateDeans.map((dean, idx) => {
              const Icon = dean.icon;
              return (
                <ScrollReveal key={dean.name} direction="slide-up" delay={idx * 50}>
                  <div className="h-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-mono">
                          {dean.badge}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {dean.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        {dean.role}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Dept. of {dean.department}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {dean.portfolio}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <a
                        href={`mailto:${dean.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 font-mono"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{dean.email}</span>
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. HEADS OF ACADEMIC DEPARTMENTS & CENTRES (When 'all' or 'hods') */}
      {(activeTab === 'all' || activeTab === 'hods') && (
        <section className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Heads of Departments & Centres of Excellence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Departmental leadership steering laboratory research, faculty allocation, student project mentorship, and specialized curriculum tracks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentHeads.map((hod, idx) => (
              <ScrollReveal key={hod.department} direction="slide-up" delay={idx * 50}>
                <div className="h-full p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {hod.department}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {hod.head}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {hod.designation}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {hod.focus}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`mailto:${hod.email}`}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5 font-mono"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{hod.email}</span>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* 8. CHAIRPERSON & BOARD OF GOVERNORS STATEMENT */}
      <ScrollReveal direction="slide-up" delay={150}>
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5" />
              <span>Apex Institutional Governance</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Board of Governors (BoG) • IIIT Bhagalpur
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Presided over by <strong>Dr. Ashok Khade</strong> (Chairperson, Board of Governors & Managing Director, DAS Offshore Limited). Mandated to steer strategic expansions, industry-academia research consortia, and institutional autonomy under the Public-Private Partnership (PPP) Act of the Parliament of India.
            </p>
          </div>

          <a
            href="https://www.iiitbh.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs"
          >
            <span>Visit Official Portal (iiitbh.ac.in)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
};
