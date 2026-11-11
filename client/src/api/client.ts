import axios from 'axios';
import {
  DEMO_USERS,
  DEMO_CAREER_ROOMS,
  DEMO_EVENTS,
  DEMO_CONTACTS,
  DEMO_SLOTS,
  DEMO_STUDY_MATERIALS,
} from './demoData';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '/api';
};

export const getSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '';
};

// Detect if running on a static hosting environment without a dedicated backend server
const isStaticPreview =
  !import.meta.env.VITE_API_BASE_URL &&
  !import.meta.env.VITE_API_URL &&
  typeof window !== 'undefined' &&
  (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('onrender.com') ||
    window.location.hostname.includes('surge.sh') ||
    window.location.search.includes('demo=true')
  );

// Security & Administrative Audit Logging Helper
function addAuditLog(action: string, resource: string, details: string) {
  try {
    const logs = JSON.parse(localStorage.getItem('demo_audit_logs') || '[]');
    const newEntry = {
      id: 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      action,
      resource,
      details,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    if (logs.length > 100) logs.length = 100;
    localStorage.setItem('demo_audit_logs', JSON.stringify(logs));
  } catch {}
}

// Initial Audit Logs Seed
const DEFAULT_AUDIT_LOGS = [
  {
    id: 'audit-log-1',
    action: 'USER_LOGIN',
    resource: 'auth',
    details: 'admin@iiitbh.ac.in authenticated via Intranet SSO',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'audit-log-2',
    action: 'BOOKING_REQUEST_RECEIVED',
    resource: 'bookings',
    details: 'Robotics & Automation Society submitted reservation for Robotics & IoT Lab',
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'audit-log-3',
    action: 'GRIEVANCE_REGISTERED',
    resource: 'issues',
    details: 'Encrypted grievance ticket ISSUE-84912 registered for Hostel Block C Wi-Fi',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'audit-log-4',
    action: 'ROLE_ASSIGNMENT',
    resource: 'users',
    details: 'Priya Verma (2401EC15) assigned Class Representative role',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'audit-log-5',
    action: 'DOMAIN_WHITELISTED',
    resource: 'domains',
    details: 'Primary institutional domain @iiitbh.ac.in verified active',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'audit-log-6',
    action: 'SECURITY_SCAN',
    resource: 'system',
    details: 'Intranet identity privacy audit: 100% compliant, all student aliases masked',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'audit-log-7',
    action: 'STUDY_MATERIAL_VERIFIED',
    resource: 'materials',
    details: 'Advanced DSA Comprehensive Notes approved by Academic Affairs Cell',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// Initial Seed Student Grievances
const DEFAULT_STUDENT_ISSUES = [
  {
    id: 'issue-seed-1',
    tracking_id: 'ISSUE-84912',
    category: 'hostel',
    title: 'Wi-Fi & LAN Dead Zones in Hostel Block C, 3rd Floor',
    description: 'Internet access points on the 3rd floor of Hostel C have been intermittently dropping out during peak study hours (8 PM - 12 AM). Multiple students preparing for online coding contests are affected.',
    location: 'Hostel Block C, Wings 3A & 3B',
    status: 'in_progress',
    priority: 'high',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      {
        id: 'im-1',
        sender_role: 'admin',
        content: 'Our IT team has dispatched a technician to replace the network switch and reconfigure the AP antennas this afternoon.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'issue-seed-2',
    tracking_id: 'ISSUE-72045',
    category: 'academics',
    title: 'Request for Additional Reference Books in Central Library for VLSI',
    description: 'The Central Library has only 2 copies of "CMOS VLSI Design" by Weste & Harris. Since 80 students are enrolled in this core elective, we request at least 5 additional copies or e-book access.',
    location: 'Central Library, Reference Section',
    status: 'under_review',
    priority: 'medium',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    messages: [
      {
        id: 'im-2',
        sender_role: 'admin',
        content: 'Forwarded to the Library Committee Chair for budget allocation.',
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
  },
  {
    id: 'issue-seed-3',
    tracking_id: 'ISSUE-61389',
    category: 'infrastructure',
    title: 'Air Conditioning Maintenance in Computer Centre Lab 2',
    description: 'AC units 3 and 4 in Computer Centre Lab 2 are making rattling noises and not cooling properly during lab sessions with 60 workstations running.',
    location: 'Main Academic Block, 1st Floor',
    status: 'submitted',
    priority: 'medium',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [],
  },
  {
    id: 'issue-seed-4',
    tracking_id: 'ISSUE-55201',
    category: 'mess',
    title: 'Night Canteen Hygiene & Extended Operating Hours During Exams',
    description: 'Requesting institute oversight for hygiene audits in the student mess and extending night canteen hours till 2:30 AM during the upcoming mid-semester examinations.',
    location: 'Student Dining Hall & Canteen Complex',
    status: 'under_review',
    priority: 'low',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    messages: [],
  },
  {
    id: 'issue-seed-5',
    tracking_id: 'ISSUE-49182',
    category: 'sports',
    title: 'Replacement of Badminton Court Floodlights at Sports Pavilion',
    description: 'Two floodlight halogen bulbs on Court 2 are fused, creating dark spots during evening inter-batch badminton matches.',
    location: 'Sports Pavilion & Indoor Badminton Complex',
    status: 'resolved',
    priority: 'low',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    messages: [
      {
        id: 'im-5',
        sender_role: 'admin',
        content: 'Estate section has replaced all bulbs with high-efficiency LED sports floodlights. Tested and operational.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  },
];

// Initial Seed Users for Admin
const DEFAULT_ADMIN_USERS = [
  DEMO_USERS.admin,
  DEMO_USERS.student1,
  DEMO_USERS.student2,
  {
    id: 'user-rohan-03',
    email: 'rohan.2101cs45@iiitbh.ac.in',
    full_name: 'Rohan Gupta',
    roll_number: '2101CS45',
    academic_year: '4th Year',
    department: 'Computer Science and Engineering',
    role: 'representative' as const,
    is_verified: true,
  },
  {
    id: 'user-sneha-04',
    email: 'sneha.2401me08@iiitbh.ac.in',
    full_name: 'Sneha Patel',
    roll_number: '2401ME08',
    academic_year: '2nd Year',
    department: 'Mechatronics and Automation',
    role: 'student' as const,
    is_verified: true,
  },
  {
    id: 'user-vikram-05',
    email: 'vikram.2201cs19@iiitbh.ac.in',
    full_name: 'Vikramaditya Singh',
    roll_number: '2201CS19',
    academic_year: '3rd Year',
    department: 'Computer Science and Engineering',
    role: 'student' as const,
    is_verified: true,
  },
  {
    id: 'user-ananya-06',
    email: 'ananya.2301ec32@iiitbh.ac.in',
    full_name: 'Ananya Sen',
    roll_number: '2301EC32',
    academic_year: '3rd Year',
    department: 'Electronics and Communication',
    role: 'student' as const,
    is_verified: true,
  },
  {
    id: 'user-aditya-07',
    email: 'aditya.2201me14@iiitbh.ac.in',
    full_name: 'Aditya Raj',
    roll_number: '2201ME14',
    academic_year: '3rd Year',
    department: 'Mechatronics and Automation',
    role: 'representative' as const,
    is_verified: true,
  },
  {
    id: 'user-neha-08',
    email: 'neha.2501cs03@iiitbh.ac.in',
    full_name: 'Neha Kumari',
    roll_number: '2501CS03',
    academic_year: '1st Year',
    department: 'Computer Science and Engineering',
    role: 'student' as const,
    is_verified: true,
  },
  {
    id: 'user-dean-09',
    email: 'dean.academic@iiitbh.ac.in',
    full_name: 'Prof. A. K. Choudhary',
    roll_number: 'FAC-DEAN-02',
    academic_year: 'Dean Academic',
    department: 'Academic Affairs Council',
    role: 'admin' as const,
    is_verified: true,
  },
];

// Initial Seed Flagged Moderation Reports
const DEFAULT_REPORTS = [
  {
    id: 'rep-1',
    target_type: 'Student Connect Discussion',
    reason: 'Commercial promotional spam offering paid assignment solutions',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'rep-2',
    target_type: 'Study Vault Upload',
    reason: 'Unverified draft practical manual with erroneous formula citations',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

// All Campus Facilities for Comprehensive Slot Booking
const ALL_CAMPUS_FACILITIES = [
  { name: 'Computer Centre Lab 1 (High Performance Lab)', capacity: 60, notes: '60 High-end Linux workstations, Gigabit LAN, dual laser projectors' },
  { name: 'Computer Centre Lab 2 (Software Development Lab)', capacity: 60, notes: 'Full stack development tools, IDEs, and local server clusters' },
  { name: 'High Performance Computing & AI Cluster Lab', capacity: 35, notes: 'GPU computing nodes (NVIDIA A100), PyTorch, TensorFlow' },
  { name: 'Robotics & IoT Innovation Lab', capacity: 40, notes: 'Testing arena, 3D printers, soldering benches, logic analyzers' },
  { name: 'VLSI & Embedded Systems Design Lab', capacity: 30, notes: 'Cadence & Synopsys EDA suites, FPGA development boards' },
  { name: 'Main Campus Auditorium', capacity: 500, notes: 'Acoustic stage sound, 4K digital screen, centralized climate control' },
  { name: 'Seminar Hall 1 (Administrative Complex)', capacity: 150, notes: 'Tiered executive seating, video conferencing, audio recording' },
  { name: 'Seminar Hall 2 (Academic Block)', capacity: 120, notes: 'Interactive smart podium, dual laser projection, air conditioned' },
  { name: 'Music & Cultural Society Room (Tarang)', capacity: 30, notes: 'Acoustic soundproofing, drum kit, amplifiers, recording console' },
  { name: 'Basketball & Volleyball Sports Court', capacity: 50, notes: 'All-weather synthetic floodlight court with digital scoreboard' },
  { name: 'Badminton & Table Tennis Indoor Pavilion', capacity: 40, notes: '3 wooden badminton courts, 4 Stiga competition TT tables' },
  { name: 'Sports Ground & Cricket Pavilion', capacity: 100, notes: 'Standard turf wicket, floodlights for approved evening matches' },
  { name: 'Open Air Amphitheatre & Student Quadrangle', capacity: 350, notes: 'Open stone amphitheatre for student club rallies and fests' },
  { name: 'Central Library Discussion & Study Vault Room', capacity: 25, notes: 'Whiteboards, high-speed Wi-Fi, peer study pods' },
  { name: 'Conference Room A (Senate & Faculty Hall)', capacity: 45, notes: 'Formal conference microphone setup and presentation screen' },
];

// Dynamic Slot Generator
function generateSlotsForCampus(dateFilter?: string, facilityFilter?: string) {
  const times = [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' },
    { start: '17:30', end: '20:30' },
  ];

  // Base dates covering today and next 10 days
  const dates: string[] = [];
  const baseTime = Date.now();
  for (let i = 0; i <= 10; i++) {
    const d = new Date(baseTime + i * 86400000);
    dates.push(d.toISOString().slice(0, 10));
  }
  // Ensure historical demo dates are also included
  ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16'].forEach((d) => {
    if (!dates.includes(d)) dates.push(d);
  });

  const targetDates = dateFilter ? [dateFilter] : dates;
  const targetFacilities =
    facilityFilter && facilityFilter !== 'all'
      ? ALL_CAMPUS_FACILITIES.filter((f) => f.name.toLowerCase().includes(facilityFilter.toLowerCase()) || facilityFilter.toLowerCase().includes(f.name.toLowerCase()))
      : ALL_CAMPUS_FACILITIES;

  const actualFacilities = targetFacilities.length > 0 ? targetFacilities : ALL_CAMPUS_FACILITIES;

  let customBookings: any[] = [];
  try {
    customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
  } catch {}
  const approvedBookings = customBookings.filter((b: any) => b.status === 'approved');

  const slots: any[] = [];
  let counter = 1;

  for (const d of targetDates) {
    for (const fac of actualFacilities) {
      for (const t of times) {
        const slotId = `slot-${fac.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}-${d}-${t.start.replace(':', '')}`;
        const isBooked = approvedBookings.some(
          (b: any) =>
            b.slot_id === slotId ||
            (b.slot_date === d && b.facility_or_club === fac.name && b.start_time === t.start)
        );

        slots.push({
          id: slotId,
          facility_or_club: fac.name,
          slot_date: d,
          start_time: t.start,
          end_time: t.end,
          is_available: true,
          max_capacity: fac.capacity,
          notes: fac.notes,
          is_booked: isBooked,
        });
        counter++;
      }
    }
  }

  return slots;
}

// Retrieve current logged in demo user
function getCurrentDemoUser(): any {
  try {
    const cached = localStorage.getItem('college_connect_user');
    if (cached && cached !== 'undefined' && cached !== 'null') {
      const u = JSON.parse(cached);
      if (u && u.id) return u;
    }
  } catch {}
  return DEMO_USERS.student1;
}

// Deterministic Anonymous Alias generator per user and context (room / category)
const ALIAS_ADJECTIVES = [
  'Crimson', 'Azure', 'Golden', 'Emerald', 'Silver', 'Shadow',
  'Solar', 'Cosmic', 'Silent', 'Apex', 'Night', 'Iron',
  'Echo', 'Vortex', 'Mystic', 'Quantum', 'Obsidian', 'Hyper'
];
const ALIAS_NOUNS = [
  'Falcon', 'Phoenix', 'Wolf', 'Hawk', 'Tiger', 'Viper',
  'Eagle', 'Panda', 'Otter', 'Lynx', 'Raven', 'Fox',
  'Dragon', 'Cobra', 'Jaguar', 'Bear', 'Stag', 'Titan'
];

function getDemoAnonymousAlias(userId: string, contextId?: string): string {
  if (userId === DEMO_USERS.admin.id || userId.includes('admin')) {
    return 'Campus Administrator';
  }
  const str = `${userId}:${contextId || 'general'}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const adj = ALIAS_ADJECTIVES[posHash % ALIAS_ADJECTIVES.length];
  const noun = ALIAS_NOUNS[(posHash >> 4) % ALIAS_NOUNS.length];
  const num = (posHash % 89) + 10;
  return `${adj} ${noun} #${num}`;
}

function getDemoStudentConnectAlias(userId: string): string {
  if (userId === DEMO_USERS.admin.id || userId.includes('admin')) {
    return 'Campus Administrator';
  }
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const num = (Math.abs(hash) % 90) + 10;
  return `Anonymous Student #${num}`;
}

// Persistent daily usage per user
interface DemoDailyUsage {
  date: string;
  careerRoom: { used: number; limit: number; remaining: number };
  studentConnect: { used: number; limit: number; remaining: number };
  studentIssue: { used: number; limit: number; remaining: number };
}

function getDemoDailyUsage(userId: string): DemoDailyUsage {
  const today = new Date().toISOString().slice(0, 10);
  const key = `demo_usage_${userId}_${today}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === today && parsed.careerRoom) {
        return parsed;
      }
    }
  } catch {}

  const defaultUsage: DemoDailyUsage = {
    date: today,
    careerRoom: { used: 0, limit: 10, remaining: 10 },
    studentConnect: { used: 0, limit: 10, remaining: 10 },
    studentIssue: { used: 0, limit: 2, remaining: 2 },
  };
  try {
    localStorage.setItem(key, JSON.stringify(defaultUsage));
  } catch {}
  return defaultUsage;
}

function incrementDemoDailyUsage(userId: string, type: 'career' | 'connect' | 'issue'): DemoDailyUsage {
  const usage = getDemoDailyUsage(userId);
  if (type === 'career') {
    usage.careerRoom.used = Math.min(usage.careerRoom.limit, usage.careerRoom.used + 1);
    usage.careerRoom.remaining = Math.max(0, usage.careerRoom.limit - usage.careerRoom.used);
  } else if (type === 'connect') {
    usage.studentConnect.used = Math.min(usage.studentConnect.limit, usage.studentConnect.used + 1);
    usage.studentConnect.remaining = Math.max(0, usage.studentConnect.limit - usage.studentConnect.used);
  } else if (type === 'issue') {
    usage.studentIssue.used = Math.min(usage.studentIssue.limit, usage.studentIssue.used + 1);
    usage.studentIssue.remaining = Math.max(0, usage.studentIssue.limit - usage.studentIssue.used);
  }
  const key = `demo_usage_${userId}_${usage.date}`;
  try {
    localStorage.setItem(key, JSON.stringify(usage));
  } catch {}
  return usage;
}

// Fallback Mock Engine for Vercel Preview Deployments (when remote backend is not running)
function handleDemoFallback(config: any): any {
  const fullUrl = config.url || '';
  const urlPath = fullUrl.split('?')[0];
  const method = (config.method || 'get').toLowerCase();
  let body: any = {};
  try {
    body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  } catch {}

  const ok = (data: any, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  });

  const reject = (error: string, status = 400, code?: string) =>
    Promise.reject({
      response: {
        status,
        data: { error, code },
      },
      config,
    });

  // 1. LOGIN (/auth/login)
  if (urlPath.includes('/auth/login') && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const isCollegeEmail = email.endsWith('@iiitbh.ac.in') || email.endsWith('@college.edu');

    if (!isCollegeEmail) {
      return reject('Registration and login restricted to @iiitbh.ac.in or @college.edu.', 400);
    }

    if (email.includes('admin')) {
      const user = DEMO_USERS.admin;
      try {
        localStorage.setItem('college_connect_token', 'demo-jwt-token-admin');
        localStorage.setItem('college_connect_user', JSON.stringify(user));
      } catch {}
      addAuditLog('USER_LOGIN', 'auth', `Super Admin (${email}) signed in via intranet SSO`);
      return ok({ message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-admin', user });
    }

    const studentUser = email.includes('student2')
      ? DEMO_USERS.student2
      : email.includes('student1')
      ? DEMO_USERS.student1
      : {
          id: 'student-' + email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_'),
          email,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          roll_number: '2301CS99',
          academic_year: '3rd Year',
          department: 'Computer Science and Engineering',
          role: 'student' as const,
          is_verified: true,
        };

    try {
      localStorage.setItem('college_connect_token', 'demo-jwt-token-student');
      localStorage.setItem('college_connect_user', JSON.stringify(studentUser));
    } catch {}

    addAuditLog('USER_LOGIN', 'auth', `Student (${email}) signed in via institutional credentials`);
    return ok({ message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-student', user: studentUser });
  }

  // 2. REGISTER (/auth/register)
  if (urlPath.includes('/auth/register') && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const isCollegeEmail = email.endsWith('@iiitbh.ac.in') || email.endsWith('@college.edu');

    if (!isCollegeEmail) {
      return reject('Registration restricted to verified @iiitbh.ac.in or @college.edu addresses.', 400);
    }

    addAuditLog('STUDENT_REGISTRATION', 'auth', `New registration initiated for ${email}`);
    return ok(
      {
        message: 'Account created! A verification code has been dispatched to your institutional inbox.',
        email,
      },
      201
    );
  }

  // 3. VERIFY EMAIL (/auth/verify-email)
  if (urlPath.includes('/auth/verify-email') && method === 'post') {
    const user = DEMO_USERS.student1;
    addAuditLog('EMAIL_VERIFIED', 'auth', `Account verified successfully for ${user.email}`);
    return ok({
      message: 'Email verified successfully. Welcome to IIIT Bhagalpur — Mitra!',
      token: 'demo-jwt-token-student',
      user,
    });
  }

  // 4. RESEND OTP (/auth/resend-otp)
  if (urlPath.includes('/auth/resend-otp') && method === 'post') {
    return ok({ message: 'Verification code resent successfully.' });
  }

  // 5. CURRENT USER PROFILE (/auth/me)
  if (urlPath.includes('/auth/me')) {
    const user = getCurrentDemoUser();
    const usage = getDemoDailyUsage(user.id);

    let joined: string[] = ['room-placement-prep', 'room-software-dev'];
    try {
      joined = JSON.parse(localStorage.getItem('demo_joined_rooms') || JSON.stringify(joined));
    } catch {}

    const joinedRoomsList = DEMO_CAREER_ROOMS.filter((r) => joined.includes(r.id));

    return ok({
      user,
      dailyUsage: usage,
      joinedRooms: joinedRoomsList,
    });
  }

  // 6. EVENTS & BOOKED SLOTS (/events)
  if (urlPath.includes('/events')) {
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}

    const bookingEvents = customBookings.map((b: any) => ({
      id: `booking-${b.id}`,
      title: `${b.status === 'approved' ? '📌 [Booked Slot]' : '⏳ [Pending Approval]'} ${b.club_or_society}: ${b.purpose}`,
      category: 'booked_slot',
      description: `Facility: ${b.facility_or_club}\nTime: ${b.start_time} - ${b.end_time}\nStatus: ${b.status.toUpperCase()}\n\nPurpose:\n${b.purpose}\n\nDetails:\n${b.description}`,
      start_time: `${b.slot_date}T${b.start_time}:00`,
      end_time: `${b.slot_date}T${b.end_time}:00`,
      venue: b.facility_or_club,
      organizer: b.club_or_society,
      coordinator_name: b.student_name || 'Aarav Sharma',
      coordinator_contact: b.student_email || 'student1@college.edu',
      status: b.status === 'approved' ? 'confirmed' : 'pending',
      is_slot_booking: true,
      booking_status: b.status,
      attachments: '[]',
      faqs: '[]',
    }));

    const allEvents = [...DEMO_EVENTS, ...bookingEvents];

    if (config.params?.category && config.params.category !== 'all') {
      const filtered = allEvents.filter((e) => e.category === config.params.category);
      return ok(filtered);
    }

    return ok(allEvents);
  }

  // 7. SLOTS (/bookings/slots) — Abundant Campus Facilities & Dynamic Slot Generation
  if (urlPath.includes('/bookings/slots')) {
    const slots = generateSlotsForCampus(config.params?.date, config.params?.facility);
    return ok(slots);
  }

  // 8. SUBMIT BOOKING (/bookings)
  if (urlPath.endsWith('/bookings') && method === 'post') {
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}

    // Find slot details or fallback
    const allGenSlots = generateSlotsForCampus();
    const slot = allGenSlots.find((s) => s.id === body.slot_id) || {
      facility_or_club: 'Main Campus Auditorium',
      slot_date: new Date().toISOString().slice(0, 10),
      start_time: '14:00',
      end_time: '17:00',
    };

    const currentUser = getCurrentDemoUser();

    const newBooking = {
      id: 'demo-bkg-' + Date.now(),
      slot_id: body.slot_id,
      club_or_society: body.club_or_society,
      purpose: body.purpose,
      description: body.description,
      facility_or_club: slot.facility_or_club,
      slot_date: slot.slot_date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      student_name: currentUser?.full_name || 'Aarav Sharma',
      student_email: currentUser?.email || 'student1@college.edu',
      status: 'pending', // Submits request to admin for review
      created_at: new Date().toISOString(),
    };

    customBookings.unshift(newBooking);
    try {
      localStorage.setItem('demo_user_bookings', JSON.stringify(customBookings));
    } catch {}

    addAuditLog(
      'SLOT_BOOKING_REQUESTED',
      'bookings',
      `Booking request submitted by ${newBooking.club_or_society} for ${newBooking.facility_or_club} (${newBooking.slot_date})`
    );

    return ok(
      {
        message: 'Booking request submitted successfully! A notification has been sent to the Administration for review. Once approved, it will be officially confirmed on the College Calendar.',
        booking: newBooking,
      },
      201
    );
  }

  // 9. MY BOOKINGS (/bookings/my)
  if (urlPath.includes('/bookings/my')) {
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}
    return ok(customBookings);
  }

  // 10. CANCEL BOOKING (/bookings/:id/cancel)
  if (urlPath.includes('/bookings/') && urlPath.endsWith('/cancel') && method === 'patch') {
    const parts = urlPath.split('/');
    const bookingId = parts[parts.length - 2];
    try {
      let customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
      customBookings = customBookings.map((b: any) =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      localStorage.setItem('demo_user_bookings', JSON.stringify(customBookings));
    } catch {}
    addAuditLog('BOOKING_CANCELLED', 'bookings', `Reservation request ${bookingId} cancelled by student`);
    return ok({ message: 'Booking reservation cancelled.' });
  }

  // 11. CAREER ROOMS (/career-rooms)
  if (urlPath.includes('/career-rooms')) {
    const currentUser = getCurrentDemoUser();
    const currentUserId = currentUser?.id || DEMO_USERS.student1.id;
    const currentUsage = getDemoDailyUsage(currentUserId);

    // 11a. Messages in a specific career room
    if (urlPath.includes('/messages')) {
      const parts = urlPath.split('/');
      const msgIdx = parts.indexOf('messages');
      const roomId = msgIdx > 0 ? parts[msgIdx - 1] : 'room-placement-prep';

      let roomMsgs: any[] = [];
      try {
        roomMsgs = JSON.parse(localStorage.getItem(`demo_career_msgs_${roomId}`) || '[]');
      } catch {}

      if (method === 'post') {
        const usage = incrementDemoDailyUsage(currentUserId, 'career');
        const alias = getDemoAnonymousAlias(currentUserId, roomId);

        const newMsg = {
          id: 'msg-' + Date.now(),
          user_id: currentUserId,
          anonymous_alias: alias,
          content: (body.content || '').trim(),
          created_at: new Date().toISOString(),
        };

        roomMsgs.push(newMsg);
        try {
          localStorage.setItem(`demo_career_msgs_${roomId}`, JSON.stringify(roomMsgs));
        } catch {}

        addAuditLog('CAREER_ROOM_MESSAGE', 'career_rooms', `Anonymous message posted in ${roomId} by ${alias}`);

        return ok(
          {
            message: 'Message sent successfully.',
            data: {
              ...newMsg,
              is_self: true,
            },
            remainingDailyMessages: usage.careerRoom.remaining,
            dailyUsage: usage.careerRoom,
          },
          201
        );
      }

      const seedMessages = [
        {
          id: 'msg-seed-1',
          user_id: 'seed-user-1',
          anonymous_alias: 'Solar Hawk #42',
          content: 'Has anyone reviewed the latest Google OA dynamic programming problem?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg-seed-2',
          user_id: 'seed-user-2',
          anonymous_alias: 'Silver Phoenix #14',
          content: 'Yes! It was a variation of 2D grid DP with obstacle costs. Vetted notes are in the Study Vault.',
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      const allMessages = [...seedMessages, ...roomMsgs];
      const safeMessages = allMessages.map((m) => ({
        id: m.id,
        user_id: m.user_id,
        anonymous_alias: m.anonymous_alias,
        content: m.content,
        created_at: m.created_at,
        is_self: Boolean(currentUserId && m.user_id && m.user_id === currentUserId),
      }));

      return ok({
        messages: safeMessages,
        dailyUsage: currentUsage.careerRoom,
        remainingDailyMessages: currentUsage.careerRoom.remaining,
      });
    }

    // 11b. Join career room
    if (urlPath.endsWith('/join') && method === 'post') {
      const parts = urlPath.split('/');
      const roomId = parts[parts.length - 2];
      try {
        let joined: string[] = JSON.parse(localStorage.getItem('demo_joined_rooms') || '["room-placement-prep", "room-software-dev"]');
        if (!joined.includes(roomId)) joined.push(roomId);
        localStorage.setItem('demo_joined_rooms', JSON.stringify(joined));
      } catch {}
      addAuditLog('JOINED_CAREER_ROOM', 'career_rooms', `Student joined preparation track ${roomId}`);
      return ok({ message: 'Successfully joined career room.', roomId });
    }

    // 11c. Leave career room
    if (urlPath.endsWith('/leave') && method === 'delete') {
      const parts = urlPath.split('/');
      const roomId = parts[parts.length - 2];
      try {
        let joined: string[] = JSON.parse(localStorage.getItem('demo_joined_rooms') || '["room-placement-prep", "room-software-dev"]');
        joined = joined.filter((id) => id !== roomId);
        localStorage.setItem('demo_joined_rooms', JSON.stringify(joined));
      } catch {}
      addAuditLog('LEFT_CAREER_ROOM', 'career_rooms', `Student left track ${roomId}`);
      return ok({ message: 'Successfully left career room.', roomId });
    }

    // 11d. Single room detail
    const pathSegments = urlPath.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment !== 'career-rooms') {
      let joined: string[] = ['room-placement-prep', 'room-software-dev'];
      try {
        joined = JSON.parse(localStorage.getItem('demo_joined_rooms') || JSON.stringify(joined));
      } catch {}
      const singleRoom = DEMO_CAREER_ROOMS.find((r) => r.id === lastSegment) || DEMO_CAREER_ROOMS[0];
      return ok({
        room: {
          ...singleRoom,
          is_member: joined.includes(singleRoom.id),
          member_count: 52,
        },
        userJoinedTotal: joined.length,
        maxRoomsAllowed: 2,
        dailyUsage: currentUsage.careerRoom,
      });
    }

    // 11e. All career rooms list
    let joined: string[] = ['room-placement-prep', 'room-software-dev'];
    try {
      joined = JSON.parse(localStorage.getItem('demo_joined_rooms') || JSON.stringify(joined));
    } catch {}

    const enrichedRooms = DEMO_CAREER_ROOMS.map((r) => ({
      ...r,
      is_member: joined.includes(r.id),
      member_count: joined.includes(r.id) ? (r.member_count || 48) : 48,
    }));

    return ok({
      rooms: enrichedRooms,
      joinedCount: joined.length,
      maxRoomsAllowed: 2,
      canJoinMore: joined.length < 2,
      dailyUsage: currentUsage.careerRoom,
    });
  }

  // 12. STUDENT CONNECT ANONYMOUS CHAT (/student-connect/messages)
  if (urlPath.includes('/student-connect/messages')) {
    const currentUser = getCurrentDemoUser();
    const currentUserId = currentUser?.id || DEMO_USERS.student1.id;
    const currentUsage = getDemoDailyUsage(currentUserId);

    const seedPosts = [
      {
        id: 'sc-seed-1',
        category: 'Academics & Notes',
        user_id: 'seed-sc-user-1',
        anonymous_alias: 'Anonymous Student #19',
        content: 'Does anyone have the past semester Digital Signal Processing question paper?',
        tags: 'DSP,ECE,PYQ',
        is_pinned: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        replies: [
          {
            id: 'sc-reply-1',
            parent_id: 'sc-seed-1',
            user_id: 'seed-sc-user-2',
            anonymous_alias: 'Anonymous Student #31',
            content: 'Check the Study Vault under ECE resources! Uploaded yesterday by the club leads.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        replies_count: 1,
      },
      {
        id: 'sc-seed-2',
        category: 'Campus Facilities',
        user_id: 'seed-sc-user-3',
        anonymous_alias: 'Anonymous Student #54',
        content: 'Great initiative by the Robotics Society booking the lab slot on Saturday for rover testing!',
        tags: 'Robotics,Lab',
        is_pinned: false,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        replies: [],
        replies_count: 0,
      },
    ];

    let allPosts: any[] = [];
    try {
      const stored = localStorage.getItem('demo_sc_posts');
      if (stored) {
        allPosts = JSON.parse(stored);
      } else {
        allPosts = seedPosts;
        localStorage.setItem('demo_sc_posts', JSON.stringify(seedPosts));
      }
    } catch {
      allPosts = seedPosts;
    }

    if (method === 'post') {
      const usage = incrementDemoDailyUsage(currentUserId, 'connect');
      const alias = getDemoStudentConnectAlias(currentUserId);
      const isReply = !!body.parent_id;

      const newPost = {
        id: 'sc-msg-' + Date.now(),
        parent_id: body.parent_id || null,
        category: body.category || 'General Discussion',
        user_id: currentUserId,
        anonymous_alias: alias,
        content: (body.content || '').trim(),
        tags: body.tags || null,
        is_pinned: false,
        created_at: new Date().toISOString(),
        replies: [],
        replies_count: 0,
      };

      if (isReply) {
        allPosts = allPosts.map((p) => {
          if (p.id === body.parent_id) {
            return {
              ...p,
              replies: [...(p.replies || []), newPost],
              replies_count: (p.replies_count || 0) + 1,
            };
          }
          return p;
        });
      } else {
        allPosts.unshift(newPost);
      }
      try {
        localStorage.setItem('demo_sc_posts', JSON.stringify(allPosts));
      } catch {}

      addAuditLog('STUDENT_CONNECT_POST', 'student_connect', `Anonymous post created by ${alias} under category: ${newPost.category}`);

      return ok(
        {
          message: 'Message posted successfully.',
          post: {
            ...newPost,
            is_self: true,
          },
          remainingDailyMessages: usage.studentConnect.remaining,
          dailyUsage: usage.studentConnect,
        },
        201
      );
    }

    // Filter by category or search if provided
    let filtered = allPosts;
    if (config.params?.category && config.params.category !== 'all') {
      filtered = filtered.filter((p) => p.category === config.params.category);
    }
    if (config.params?.search) {
      const q = config.params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.content || '').toLowerCase().includes(q) || (p.tags || '').toLowerCase().includes(q)
      );
    }

    const mappedPosts = filtered.map((p) => ({
      ...p,
      is_self: Boolean(currentUserId && p.user_id && p.user_id === currentUserId),
      replies: (p.replies || []).map((r: any) => ({
        ...r,
        is_self: Boolean(currentUserId && r.user_id && r.user_id === currentUserId),
      })),
    }));

    return ok({
      posts: mappedPosts,
      dailyUsage: currentUsage.studentConnect,
      remainingDailyMessages: currentUsage.studentConnect.remaining,
    });
  }

  // 13. CONTACTS (/contacts)
  if (urlPath.includes('/contacts')) {
    return ok(DEMO_CONTACTS);
  }

  // 14. STUDY MATERIALS (/materials)
  if (urlPath.includes('/materials')) {
    if (method === 'post') {
      addAuditLog('STUDY_MATERIAL_UPLOADED', 'materials', 'New study document uploaded for verification');
      return ok({ message: 'Study material uploaded and pending faculty verification.' }, 201);
    }
    if (method === 'delete') {
      addAuditLog('STUDY_MATERIAL_REMOVED', 'materials', 'Study material removed');
      return ok({ message: 'Material removed successfully.' });
    }
    return ok(DEMO_STUDY_MATERIALS);
  }

  // 15. STUDENT ISSUES / GRIEVANCES (/issues)
  if (urlPath.includes('/issues')) {
    const currentUser = getCurrentDemoUser();
    const currentUserId = currentUser?.id || DEMO_USERS.student1.id;
    const currentUsage = getDemoDailyUsage(currentUserId);

    let storedIssues: any[] = [];
    try {
      const stored = localStorage.getItem('demo_student_issues');
      storedIssues = stored ? JSON.parse(stored) : DEFAULT_STUDENT_ISSUES;
    } catch {
      storedIssues = DEFAULT_STUDENT_ISSUES;
    }

    if (urlPath.includes('/my-submissions')) {
      return ok({
        issues: storedIssues,
        dailyUsage: currentUsage.studentIssue,
        remainingDailySubmissions: currentUsage.studentIssue.remaining,
      });
    }

    if (urlPath.includes('/track/')) {
      const parts = urlPath.split('/');
      const identifier = parts[parts.length - 1];
      const found =
        storedIssues.find((i: any) => i.id === identifier || i.tracking_id === identifier) ||
        storedIssues[0];
      return ok({
        issue: found,
        messages: found?.messages || [],
      });
    }

    if (method === 'post') {
      const usage = incrementDemoDailyUsage(currentUserId, 'issue');
      const trackingId = `ISSUE-${Math.floor(10000 + Math.random() * 90000)}`;
      const newIssue = {
        id: 'issue-' + Date.now(),
        tracking_id: trackingId,
        user_id: currentUserId,
        category: body.category || 'hostel',
        title: body.title || 'Student Concern',
        description: body.description || '',
        location: body.location || '',
        status: 'submitted',
        priority: body.priority || 'medium',
        created_at: new Date().toISOString(),
        messages: [],
      };

      storedIssues.unshift(newIssue);
      try {
        localStorage.setItem('demo_student_issues', JSON.stringify(storedIssues));
      } catch {}

      addAuditLog('GRIEVANCE_REGISTERED', 'issues', `Encrypted ticket ${trackingId} submitted: ${newIssue.title}`);

      return ok(
        {
          message: 'Your concern has been registered anonymously and securely encrypted.',
          trackingId,
          remainingSubmissionsToday: usage.studentIssue.remaining,
          dailyUsage: usage.studentIssue,
        },
        201
      );
    }
  }

  // 16. USER PROFILE & SETTINGS
  if (urlPath.includes('/user/profile') && (method === 'put' || method === 'patch')) {
    let user = getCurrentDemoUser();
    try {
      const cached = localStorage.getItem('college_connect_user');
      if (cached) user = { ...JSON.parse(cached), ...body };
      localStorage.setItem('college_connect_user', JSON.stringify(user));
    } catch {}
    addAuditLog('PROFILE_UPDATED', 'user', `Profile details updated for ${user.email}`);
    return ok({ message: 'Profile details updated.', user });
  }

  if (urlPath.includes('/user/change-password') && method === 'post') {
    addAuditLog('PASSWORD_CHANGED', 'auth', 'Account password successfully updated');
    return ok({ message: 'Password has been updated successfully.' });
  }

  // 17. ADMIN DASHBOARD, GOVERNANCE & AUDIT (/admin)
  if (urlPath.includes('/admin')) {
    // Audit logs from localStorage
    let storedAuditLogs: any[] = [];
    try {
      const stored = localStorage.getItem('demo_audit_logs');
      storedAuditLogs = stored ? JSON.parse(stored) : DEFAULT_AUDIT_LOGS;
    } catch {
      storedAuditLogs = DEFAULT_AUDIT_LOGS;
    }

    // Student issues from localStorage
    let storedIssues: any[] = [];
    try {
      const stored = localStorage.getItem('demo_student_issues');
      storedIssues = stored ? JSON.parse(stored) : DEFAULT_STUDENT_ISSUES;
    } catch {
      storedIssues = DEFAULT_STUDENT_ISSUES;
    }

    // Bookings from localStorage
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}

    const seedAdminBookings = [
      {
        id: 'demo-seed-bkg-1',
        club_or_society: 'Robotics Society',
        purpose: 'Autonomous Rover Testing',
        description: 'Testing autonomous navigation sensors in the lab.',
        facility_or_club: 'Robotics & IoT Innovation Lab',
        slot_date: '2026-11-14',
        start_time: '14:00',
        end_time: '17:00',
        student_name: 'Aarav Sharma',
        student_email: 'student1@college.edu',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'demo-seed-bkg-2',
        club_or_society: 'Coding Club & GDSC',
        purpose: 'National Hackathon Orientation',
        description: 'Briefing participants on problem statements and compute server allocation.',
        facility_or_club: 'Main Campus Auditorium',
        slot_date: '2026-11-15',
        start_time: '14:00',
        end_time: '17:00',
        student_name: 'Rohan Gupta',
        student_email: 'rohan.2101cs45@iiitbh.ac.in',
        status: 'pending',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    const allBookings = [...customBookings, ...seedAdminBookings];

    // Reports from localStorage
    let storedReports: any[] = [];
    try {
      const stored = localStorage.getItem('demo_reports');
      storedReports = stored ? JSON.parse(stored) : DEFAULT_REPORTS;
    } catch {
      storedReports = DEFAULT_REPORTS;
    }

    // Users from localStorage
    let storedUsers: any[] = [];
    try {
      const stored = localStorage.getItem('demo_admin_users');
      storedUsers = stored ? JSON.parse(stored) : DEFAULT_ADMIN_USERS;
    } catch {
      storedUsers = DEFAULT_ADMIN_USERS;
    }

    // 17a. Admin Bookings Review
    if (urlPath.includes('/admin/bookings') && method === 'get') {
      const filter = config.params?.status;
      if (filter && filter !== 'all') {
        return ok(allBookings.filter((b: any) => b.status === filter));
      }
      return ok(allBookings);
    }

    // 17b. Admin Approve / Reject Booking
    if (urlPath.includes('/admin/bookings/') && method === 'patch') {
      const parts = urlPath.split('/');
      const bookingId = parts[parts.length - 1];
      const newStatus = body.status || 'approved';
      const updated = allBookings.map((b: any) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      try {
        localStorage.setItem('demo_user_bookings', JSON.stringify(updated));
      } catch {}

      addAuditLog(
        newStatus === 'approved' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
        'bookings',
        `Reservation ${bookingId} was ${newStatus} by Administrator. Calendar synced.`
      );

      return ok({ message: `Booking reservation request marked as ${newStatus}. Calendar has been updated.` });
    }

    // 17c. Whitelisted Email Domains
    if (urlPath.includes('/admin/domains')) {
      let storedDomains = ['iiitbh.ac.in', 'college.edu'];
      try {
        const stored = localStorage.getItem('demo_whitelisted_domains');
        if (stored) storedDomains = JSON.parse(stored);
      } catch {}

      if (method === 'post') {
        const cleanDom = (body.domain || '').replace(/^@/, '').toLowerCase().trim();
        if (cleanDom && !storedDomains.includes(cleanDom)) {
          storedDomains.push(cleanDom);
          try {
            localStorage.setItem('demo_whitelisted_domains', JSON.stringify(storedDomains));
          } catch {}
          addAuditLog('DOMAIN_WHITELISTED', 'domains', `@${cleanDom} added to authorized email domains`);
        }
        return ok({ message: 'Domain whitelisted successfully.', domain: cleanDom }, 201);
      }

      if (method === 'delete') {
        const parts = urlPath.split('/');
        const idToDelete = parts[parts.length - 1];
        storedDomains = storedDomains.filter((d) => d !== idToDelete && `dom-${d}` !== idToDelete);
        try {
          localStorage.setItem('demo_whitelisted_domains', JSON.stringify(storedDomains));
        } catch {}
        addAuditLog('DOMAIN_REVOKED', 'domains', `Email domain ${idToDelete} revoked from whitelist`);
        return ok({ message: 'Domain revoked from whitelist.' });
      }

      const domainObjects = storedDomains.map((d, idx) => ({
        id: `dom-${d}`,
        domain: d,
        is_active: true,
        created_at: new Date(Date.now() - (idx + 1) * 86400000 * 30).toISOString(),
      }));
      return ok(domainObjects);
    }

    // 17d. Student Grievances in Admin
    if (urlPath.includes('/admin/issues')) {
      if (method === 'patch') {
        const parts = urlPath.split('/');
        // URL is /admin/issues/:id/status
        const issueId = parts[parts.length - 2];
        const updatedStatus = body.status || 'under_review';
        const note = body.note;

        storedIssues = storedIssues.map((iss: any) => {
          if (iss.id === issueId) {
            const msgs = iss.messages || [];
            if (note) {
              msgs.push({
                id: 'im-' + Date.now(),
                sender_role: 'admin',
                content: note,
                created_at: new Date().toISOString(),
              });
            }
            return {
              ...iss,
              status: updatedStatus,
              messages: msgs,
            };
          }
          return iss;
        });

        try {
          localStorage.setItem('demo_student_issues', JSON.stringify(storedIssues));
        } catch {}

        addAuditLog(
          'GRIEVANCE_STATUS_UPDATED',
          'issues',
          `Ticket ${issueId} progression set to "${updatedStatus}". Administrator note attached.`
        );

        return ok({ message: 'Grievance lifecycle status updated.' });
      }

      const filter = config.params?.status;
      if (filter && filter !== 'all') {
        return ok(storedIssues.filter((i: any) => i.status === filter));
      }
      return ok(storedIssues);
    }

    // 17e. Student Accounts for Admin
    if (urlPath.includes('/admin/users')) {
      if (method === 'patch') {
        const parts = urlPath.split('/');
        const userId = parts[parts.length - 2];
        const newRole = body.role || 'student';
        storedUsers = storedUsers.map((u: any) => (u.id === userId ? { ...u, role: newRole } : u));
        try {
          localStorage.setItem('demo_admin_users', JSON.stringify(storedUsers));
        } catch {}
        addAuditLog('USER_ROLE_UPDATED', 'users', `User ${userId} permissions updated to ${newRole}`);
        return ok({ message: 'Institutional role updated successfully.' });
      }
      return ok(storedUsers);
    }

    // 17f. Moderation Reports
    if (urlPath.includes('/admin/reports')) {
      if (method === 'post' && urlPath.endsWith('/resolve')) {
        const parts = urlPath.split('/');
        const reportId = parts[parts.length - 2];
        storedReports = storedReports.map((r: any) =>
          r.id === reportId ? { ...r, status: 'resolved', action_taken: body.action || 'dismiss' } : r
        );
        try {
          localStorage.setItem('demo_reports', JSON.stringify(storedReports));
        } catch {}
        addAuditLog('MODERATION_RESOLVED', 'reports', `Moderation report ${reportId} resolved with action: ${body.action || 'dismiss'}`);
        return ok({ message: 'Moderation item resolved.' });
      }
      return ok(storedReports);
    }

    // 17g. Security Audit Log Trail
    if (urlPath.includes('/admin/audit-logs')) {
      return ok(storedAuditLogs);
    }

    // 17h. Main Metrics Overview
    const pendingBookingsCount = allBookings.filter((b: any) => b.status === 'pending').length;
    const pendingIssuesCount = storedIssues.filter((i: any) => i.status !== 'resolved' && i.status !== 'closed').length;
    const pendingReportsCount = storedReports.filter((r: any) => r.status === 'pending').length;

    return ok({
      metrics: {
        totalStudents: 852,
        verifiedStudents: 846,
        activeRooms: 12,
        totalMaterials: 64,
        upcomingEvents: 8 + allBookings.filter((b: any) => b.status === 'approved').length,
        pendingBookings: pendingBookingsCount,
        pendingIssues: pendingIssuesCount,
        pendingReports: pendingReportsCount,
      },
      recentLogs: storedAuditLogs.slice(0, 8),
    });
  }

  return null;
}

const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: async (config) => {
    // If on static preview or ?demo=true, respond instantly (<10ms) without network round-trip
    if (isStaticPreview) {
      const demoRes = handleDemoFallback(config);
      if (demoRes) return demoRes;
    }

    try {
      const res = await defaultAdapter(config);
      // If a static host rewrites API calls to index.html (returns HTML instead of JSON):
      if (typeof res.data === 'string' && (res.data.includes('<!DOCTYPE') || res.data.includes('<html'))) {
        const fallback = handleDemoFallback(config);
        if (fallback) return fallback;
      }
      return res;
    } catch (err: any) {
      // If backend is unreachable, offline, or returns 404/405/500:
      const fallback = handleDemoFallback(config);
      if (fallback) return fallback;
      throw err;
    }
  },
});

// Intercept requests to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('college_connect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth expiration redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register') ||
          window.location.pathname.startsWith('/verify-email'));
      if (!isAuthRoute) {
        localStorage.removeItem('college_connect_token');
        localStorage.removeItem('college_connect_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
