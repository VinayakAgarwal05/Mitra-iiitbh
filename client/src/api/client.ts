import axios from 'axios';
import {
  DEMO_USERS,
  DEMO_CAREER_ROOMS,
  DEMO_EVENTS,
  DEMO_CONTACTS,
  DEMO_SLOTS,
  DEMO_STUDY_MATERIALS,
} from './demoData';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
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

// Fallback Mock Engine for Vercel Preview Deployments (when remote backend is not running)
function handleDemoFallback(config: any): any {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  let body: any = {};
  try {
    body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  } catch {}

  // 1. LOGIN FALLBACK
  if (url.includes('/auth/login') && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const isCollegeEmail = email.endsWith('@iiitbh.ac.in') || email.endsWith('@college.edu');

    if (!isCollegeEmail) {
      return Promise.reject({
        response: {
          status: 400,
          data: { error: 'Registration and login restricted to @iiitbh.ac.in or @college.edu.' },
        },
      });
    }

    if (email.includes('admin')) {
      const user = DEMO_USERS.admin;
      return Promise.resolve({
        data: { message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-admin', user },
        status: 200,
      });
    }

    const studentUser = {
      id: 'student-demo-' + Math.floor(Math.random() * 1000),
      email,
      full_name: email.includes('student2') ? 'Priya Verma' : 'Aarav Sharma',
      roll_number: email.includes('student2') ? '2401EC15' : '2301CS01',
      academic_year: '3rd Year',
      department: 'Computer Science and Engineering',
      role: 'student' as const,
      is_verified: true,
    };

    return Promise.resolve({
      data: { message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-student', user: studentUser },
      status: 200,
    });
  }

  // 2. CURRENT USER PROFILE (/auth/me)
  if (url.includes('/auth/me')) {
    const cachedUser = localStorage.getItem('college_connect_user');
    const user = cachedUser ? JSON.parse(cachedUser) : DEMO_USERS.student1;

    return Promise.resolve({
      data: {
        user,
        dailyUsage: {
          date: new Date().toISOString().slice(0, 10),
          careerRoom: { used: 1, limit: 10, remaining: 9 },
          studentConnect: { used: 0, limit: 10, remaining: 10 },
          studentIssue: { used: 0, limit: 2, remaining: 2 },
        },
        joinedRooms: [DEMO_CAREER_ROOMS[0], DEMO_CAREER_ROOMS[1]],
      },
      status: 200,
    });
  }

  // 3. EVENTS & BOOKED SLOTS (/events)
  if (url.startsWith('/events')) {
    const customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    const bookingEvents = customBookings.map((b: any) => ({
      id: `booking-${b.id}`,
      title: `📌 [Booked Slot] ${b.club_or_society}: ${b.purpose}`,
      category: 'booked_slot',
      description: `Facility Reserved: ${b.facility_or_club}\nTime: ${b.start_time} - ${b.end_time}\nStatus: APPROVED\n\nPurpose:\n${b.purpose}\n\nDetails:\n${b.description}`,
      start_time: `${b.slot_date}T${b.start_time}:00`,
      end_time: `${b.slot_date}T${b.end_time}:00`,
      venue: b.facility_or_club,
      organizer: b.club_or_society,
      coordinator_name: 'Aarav Sharma',
      coordinator_contact: 'student1@college.edu',
      status: 'confirmed',
      is_slot_booking: true,
      booking_status: 'approved',
      attachments: '[]',
      faqs: '[]',
    }));

    const allEvents = [...DEMO_EVENTS, ...bookingEvents];

    if (config.params?.category && config.params.category !== 'all') {
      const filtered = allEvents.filter((e) => e.category === config.params.category);
      return Promise.resolve({ data: filtered, status: 200 });
    }

    return Promise.resolve({ data: allEvents, status: 200 });
  }

  // 4. SLOTS (/bookings/slots)
  if (url.includes('/bookings/slots')) {
    const customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    const bookedSlotIds = new Set(customBookings.map((b: any) => b.slot_id));

    const slots = DEMO_SLOTS.map((s) => ({
      ...s,
      is_booked: s.is_booked || bookedSlotIds.has(s.id),
    }));

    return Promise.resolve({ data: slots, status: 200 });
  }

  // 5. SUBMIT BOOKING (/bookings)
  if (url === '/bookings' && method === 'post') {
    const customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    const slot = DEMO_SLOTS.find((s) => s.id === body.slot_id) || DEMO_SLOTS[0];

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
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    customBookings.push(newBooking);
    localStorage.setItem('demo_user_bookings', JSON.stringify(customBookings));

    return Promise.resolve({
      data: {
        message: 'Slot booked successfully! This reservation is now updated on the Interactive Calendar.',
        booking: newBooking,
      },
      status: 201,
    });
  }

  // 6. MY BOOKINGS (/bookings/my)
  if (url.includes('/bookings/my')) {
    const customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    return Promise.resolve({ data: customBookings, status: 200 });
  }

  // 7. CAREER ROOMS (/career-rooms)
  if (url.startsWith('/career-rooms')) {
    if (url.includes('/messages')) {
      return Promise.resolve({
        data: [
          {
            id: 'msg-1',
            alias: 'Blue Falcon #38',
            content: 'Has anyone reviewed the latest Google OA dynamic programming problem?',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'msg-2',
            alias: 'Silver Phoenix #14',
            content: 'Yes! It was a variation of 2D grid DP with obstacle costs. Vetted notes are in the Study Vault.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
        status: 200,
      });
    }
    return Promise.resolve({ data: DEMO_CAREER_ROOMS, status: 200 });
  }

  // 8. CONTACTS (/contacts)
  if (url.startsWith('/contacts')) {
    return Promise.resolve({ data: DEMO_CONTACTS, status: 200 });
  }

  // 9. STUDY MATERIALS (/materials)
  if (url.startsWith('/materials')) {
    return Promise.resolve({ data: DEMO_STUDY_MATERIALS, status: 200 });
  }

  // 10. STUDENT ISSUES (/issues)
  if (url.startsWith('/issues') && method === 'post') {
    const trackingId = `ISSUE-${Math.floor(10000 + Math.random() * 90000)}`;
    return Promise.resolve({
      data: {
        message: 'Your concern has been registered anonymously and securely encrypted.',
        trackingId,
        remainingSubmissionsToday: 1,
      },
      status: 201,
    });
  }

  // 11. ADMIN DASHBOARD (/admin/dashboard)
  if (url.startsWith('/admin')) {
    return Promise.resolve({
      data: {
        totalStudents: 852,
        verifiedStudents: 846,
        activeCareerRooms: 12,
        pendingBookings: 2,
        openIssues: 5,
        totalMaterials: 64,
        recentAudits: [
          { id: '1', action: 'USER_LOGIN', details: 'admin@iiitbh.ac.in', created_at: new Date().toISOString() },
          { id: '2', action: 'BOOKING_APPROVED', details: 'Robotics Club', created_at: new Date(Date.now() - 1200000).toISOString() },
        ],
      },
      status: 200,
    });
  }

  return null;
}

// Intercept responses for auth errors & Vercel offline backend fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If request failed because backend is offline, returned 404 from Vercel static router,
    // or returned HTML error page from Vercel:
    const isNetworkOr404 =
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 405 ||
      typeof error.response.data === 'string' && error.response.data.includes('Cannot POST');

    if (isNetworkOr404) {
      const fallback = handleDemoFallback(error.config);
      if (fallback) {
        return fallback;
      }
    }

    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/verify-email');
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
