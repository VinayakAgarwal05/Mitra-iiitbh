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
      return ok({ message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-admin', user });
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

    try {
      localStorage.setItem('college_connect_token', 'demo-jwt-token-student');
      localStorage.setItem('college_connect_user', JSON.stringify(studentUser));
    } catch {}

    return ok({ message: 'Login successful (Demo Mode)', token: 'demo-jwt-token-student', user: studentUser });
  }

  // 2. REGISTER (/auth/register)
  if (urlPath.includes('/auth/register') && method === 'post') {
    const email = (body.email || '').toLowerCase().trim();
    const isCollegeEmail = email.endsWith('@iiitbh.ac.in') || email.endsWith('@college.edu');

    if (!isCollegeEmail) {
      return reject('Registration restricted to verified @iiitbh.ac.in or @college.edu addresses.', 400);
    }

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
    let user = DEMO_USERS.student1;
    try {
      const cached = localStorage.getItem('college_connect_user');
      if (cached && cached !== 'undefined' && cached !== 'null') {
        user = JSON.parse(cached);
      }
    } catch {}

    return ok({
      user,
      dailyUsage: {
        date: new Date().toISOString().slice(0, 10),
        careerRoom: { used: 1, limit: 10, remaining: 9 },
        studentConnect: { used: 0, limit: 10, remaining: 10 },
        studentIssue: { used: 0, limit: 2, remaining: 2 },
      },
      joinedRooms: [DEMO_CAREER_ROOMS[0], DEMO_CAREER_ROOMS[1]],
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

  // 7. SLOTS (/bookings/slots)
  if (urlPath.includes('/bookings/slots')) {
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}
    const bookedSlotIds = new Set(customBookings.filter((b: any) => b.status === 'approved').map((b: any) => b.slot_id));

    const slots = DEMO_SLOTS.map((s) => ({
      ...s,
      is_booked: s.is_booked || bookedSlotIds.has(s.id),
    }));

    return ok(slots);
  }

  // 8. SUBMIT BOOKING (/bookings)
  if (urlPath.endsWith('/bookings') && method === 'post') {
    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}
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
      student_name: 'Aarav Sharma',
      student_email: 'student1@college.edu',
      status: 'pending', // Submits request to admin for review
      created_at: new Date().toISOString(),
    };

    customBookings.unshift(newBooking);
    try {
      localStorage.setItem('demo_user_bookings', JSON.stringify(customBookings));
    } catch {}

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
    return ok({ message: 'Booking reservation cancelled.' });
  }

  // 11. CAREER ROOMS (/career-rooms)
  if (urlPath.includes('/career-rooms')) {
    // 11a. Messages in a specific career room
    if (urlPath.includes('/messages')) {
      if (method === 'post') {
        const newMsg = {
          id: 'msg-' + Date.now(),
          anonymous_alias: 'Blue Falcon #38',
          content: body.content,
          created_at: new Date().toISOString(),
          is_self: true,
        };
        return ok(
          {
            message: newMsg,
            dailyUsage: { used: 2, limit: 10, remaining: 8 },
          },
          201
        );
      }
      return ok({
        messages: [
          {
            id: 'msg-1',
            anonymous_alias: 'Blue Falcon #38',
            content: 'Has anyone reviewed the latest Google OA dynamic programming problem?',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_self: false,
          },
          {
            id: 'msg-2',
            anonymous_alias: 'Silver Phoenix #14',
            content: 'Yes! It was a variation of 2D grid DP with obstacle costs. Vetted notes are in the Study Vault.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            is_self: true,
          },
        ],
        dailyUsage: { used: 1, limit: 10, remaining: 9 },
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
      });
    }

    // 11e. All career rooms list (expected contract: { rooms, joinedCount, maxRoomsAllowed, canJoinMore, dailyUsage })
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
      dailyUsage: { used: 1, limit: 10, remaining: 9 },
    });
  }

  // 12. STUDENT CONNECT ANONYMOUS CHAT (/student-connect/messages)
  if (urlPath.includes('/student-connect/messages')) {
    let customPosts: any[] = [];
    try {
      customPosts = JSON.parse(localStorage.getItem('demo_sc_posts') || '[]');
    } catch {}

    const seedPosts = [
      {
        id: 'sc-seed-1',
        category: 'Academics & Notes',
        anonymous_alias: 'Anonymous Student #19',
        content: 'Does anyone have the past semester Digital Signal Processing question paper?',
        tags: 'DSP,ECE,PYQ',
        is_pinned: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_self: false,
        replies: [
          {
            id: 'sc-reply-1',
            parent_id: 'sc-seed-1',
            anonymous_alias: 'Anonymous Student #31',
            content: 'Check the Study Vault under ECE resources! Uploaded yesterday by the club leads.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_self: false,
          },
        ],
        replies_count: 1,
      },
      {
        id: 'sc-seed-2',
        category: 'Campus Facilities',
        anonymous_alias: 'Anonymous Student #54',
        content: 'Great initiative by the Robotics Society booking the lab slot on Saturday for rover testing!',
        tags: 'Robotics,Lab',
        is_pinned: false,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        is_self: false,
        replies: [],
        replies_count: 0,
      },
    ];

    const allPosts = [...customPosts, ...seedPosts];

    if (method === 'post') {
      const isReply = !!body.parent_id;
      const newPost = {
        id: 'sc-msg-' + Date.now(),
        parent_id: body.parent_id || null,
        category: body.category || 'General Discussion',
        anonymous_alias: 'Anonymous Student #42',
        content: (body.content || '').trim(),
        tags: body.tags || null,
        is_pinned: false,
        created_at: new Date().toISOString(),
        is_self: true,
        replies: [],
        replies_count: 0,
      };

      if (isReply) {
        const updated = allPosts.map((p) => {
          if (p.id === body.parent_id) {
            return {
              ...p,
              replies: [...(p.replies || []), newPost],
              replies_count: (p.replies_count || 0) + 1,
            };
          }
          return p;
        });
        try {
          localStorage.setItem('demo_sc_posts', JSON.stringify(updated.filter((p) => !p.id.startsWith('sc-seed-'))));
        } catch {}
      } else {
        customPosts.unshift(newPost);
        try {
          localStorage.setItem('demo_sc_posts', JSON.stringify(customPosts));
        } catch {}
      }

      return ok(
        {
          message: 'Message posted successfully.',
          post: newPost,
          dailyUsage: { used: 1, limit: 10, remaining: 9 },
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

    return ok({
      posts: filtered,
      dailyUsage: { used: 0, limit: 10, remaining: 10 },
    });
  }

  // 13. CONTACTS (/contacts)
  if (urlPath.includes('/contacts')) {
    return ok(DEMO_CONTACTS);
  }

  // 14. STUDY MATERIALS (/materials)
  if (urlPath.includes('/materials')) {
    if (method === 'post') {
      return ok({ message: 'Study material uploaded and pending faculty verification.' }, 201);
    }
    if (method === 'delete') {
      return ok({ message: 'Material removed successfully.' });
    }
    return ok(DEMO_STUDY_MATERIALS);
  }

  // 15. STUDENT ISSUES (/issues)
  if (urlPath.includes('/issues')) {
    if (urlPath.includes('/my-submissions')) {
      return ok({
        issues: [
          {
            id: 'issue-demo-1',
            tracking_id: 'ISSUE-49182',
            category: 'hostel',
            title: 'Wi-Fi connectivity in Hostel Block C',
            status: 'in_progress',
            priority: 'medium',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            messages: [
              {
                id: 'im-1',
                sender_role: 'admin',
                content: 'Our IT team has been informed and will reset the access points this evening.',
                created_at: new Date(Date.now() - 43200000).toISOString(),
              },
            ],
          },
        ],
        dailyUsage: { used: 0, limit: 2, remaining: 2 },
      });
    }
    if (urlPath.includes('/track/')) {
      return ok({
        issue: {
          id: 'issue-demo-1',
          tracking_id: 'ISSUE-49182',
          category: 'hostel',
          title: 'Wi-Fi connectivity in Hostel Block C',
          status: 'in_progress',
          priority: 'medium',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        messages: [
          {
            id: 'im-1',
            sender_role: 'admin',
            content: 'Our IT team has been informed and will reset the access points this evening.',
            created_at: new Date(Date.now() - 43200000).toISOString(),
          },
        ],
      });
    }
    if (method === 'post') {
      const trackingId = `ISSUE-${Math.floor(10000 + Math.random() * 90000)}`;
      return ok(
        {
          message: 'Your concern has been registered anonymously and securely encrypted.',
          trackingId,
          remainingSubmissionsToday: 1,
        },
        201
      );
    }
  }

  // 16. USER PROFILE & SETTINGS
  if (urlPath.includes('/user/profile') && (method === 'put' || method === 'patch')) {
    let user = DEMO_USERS.student1;
    try {
      const cached = localStorage.getItem('college_connect_user');
      if (cached) user = { ...JSON.parse(cached), ...body };
      localStorage.setItem('college_connect_user', JSON.stringify(user));
    } catch {}
    return ok({ message: 'Profile details updated.', user });
  }

  if (urlPath.includes('/user/change-password') && method === 'post') {
    return ok({ message: 'Password has been updated successfully.' });
  }

  // 17. ADMIN DASHBOARD & BOOKING APPROVALS (/admin)
  if (urlPath.includes('/admin')) {
    // Admin review of booking requests
    if (urlPath.includes('/admin/bookings') && method === 'get') {
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
      ];
      const combined = [...customBookings, ...seedAdminBookings];
      return ok(combined);
    }

    // Admin approve / reject action
    if (urlPath.includes('/admin/bookings/') && method === 'patch') {
      const parts = urlPath.split('/');
      const bookingId = parts[parts.length - 1];
      try {
        let customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
        customBookings = customBookings.map((b: any) =>
          b.id === bookingId ? { ...b, status: body.status || 'approved' } : b
        );
        localStorage.setItem('demo_user_bookings', JSON.stringify(customBookings));
      } catch {}
      return ok({ message: `Booking reservation request marked as ${body.status || 'approved'}. Calendar has been updated.` });
    }

    if (urlPath.includes('/admin/domains')) {
      return ok([
        { id: 'dom-1', domain: 'iiitbh.ac.in', is_active: true, created_at: new Date().toISOString() },
        { id: 'dom-2', domain: 'college.edu', is_active: true, created_at: new Date().toISOString() },
      ]);
    }

    if (urlPath.includes('/admin/users')) {
      return ok([DEMO_USERS.admin, DEMO_USERS.student1, DEMO_USERS.student2]);
    }

    if (urlPath.includes('/admin/issues')) {
      return ok([]);
    }

    if (urlPath.includes('/admin/reports')) {
      return ok([]);
    }

    if (urlPath.includes('/admin/audit-logs')) {
      return ok([
        { id: '1', action: 'USER_LOGIN', details: 'admin@iiitbh.ac.in', created_at: new Date().toISOString() },
        { id: '2', action: 'BOOKING_REQUEST_RECEIVED', details: 'Robotics Society', created_at: new Date(Date.now() - 1200000).toISOString() },
      ]);
    }

    let customBookings: any[] = [];
    try {
      customBookings = JSON.parse(localStorage.getItem('demo_user_bookings') || '[]');
    } catch {}
    const pendingCount = customBookings.filter((b: any) => b.status === 'pending').length + 1;

    return ok({
      metrics: {
        totalStudents: 852,
        verifiedStudents: 846,
        activeRooms: 12,
        totalMaterials: 64,
        upcomingEvents: 5,
        pendingBookings: pendingCount,
        pendingIssues: 5,
        pendingReports: 0,
      },
      recentLogs: [
        { id: '1', action: 'USER_LOGIN', details: 'admin@iiitbh.ac.in', created_at: new Date().toISOString() },
        { id: '2', action: 'BOOKING_REQUEST_RECEIVED', details: 'Robotics Society', created_at: new Date(Date.now() - 1200000).toISOString() },
      ],
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
