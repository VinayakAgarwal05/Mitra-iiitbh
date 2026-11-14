import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { db } from '../config/database';
import { initializeSchema } from '../db/schema';
import { seedDatabase } from '../db/seed';

describe('COLLEGE CONNECT — Full-Stack Verification Test Suite', () => {
  beforeAll(async () => {
    await initializeSchema();
    await seedDatabase();

    // Clean up test user & bookings from any prior test runs
    await db('users').where({ email: 'rohan.new@college.edu' }).del();
    await db('bookings').where({ purpose: 'Autonomous Rover Testing' }).del();
    await db('student_issues').where('title', 'like', '%Test%').orWhere('title', 'like', '%Wi-Fi%').orWhere('title', 'like', '%Mess%').orWhere('title', 'like', '%Third%').del();
    await db('messages').where('content', 'like', '%automated verification%').orWhere('content', 'like', '%Connect message iteration%').del();
  });

  // 1. AUTHENTICATION & DOMAIN WHITELIST TESTS
  describe('Phase 1: Authentication & College Email Whitelist', () => {
    it('should reject registration with a non-college email (e.g. @gmail.com)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Imposter Student',
          email: 'imposter@gmail.com',
          roll_number: 'FAKE123',
          academic_year: '1st Year',
          department: 'CSE',
          password: 'Password@123',
          terms_accepted: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/authorized college email/i);
    });

    it('should reject registration if terms are not accepted', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test Student',
          email: 'test_terms@college.edu',
          roll_number: '2301CS99',
          academic_year: '1st Year',
          department: 'CSE',
          password: 'Password@123',
          terms_accepted: false,
        });

      expect(res.status).toBe(400);
    });

    it('should successfully register with a valid college email and return OTP', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Rohan Sharma',
          email: 'rohan.new@college.edu',
          roll_number: '2401CS88',
          academic_year: '2nd Year',
          department: 'CSE',
          password: 'Password@123',
          terms_accepted: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/registration successful/i);
      expect(res.body.debugOtp).toBeDefined();
    });

    it('should verify college email with valid OTP and return auth token', async () => {
      const user = await db('users').where({ email: 'rohan.new@college.edu' }).first();
      expect(user).toBeDefined();

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({
          email: 'rohan.new@college.edu',
          otp: user.verification_otp,
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.is_verified).toBe(true);
    });

    it('should login securely with verified college account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student1@college.edu',
          password: 'Student@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('student1@college.edu');
    });

    it('should return user profile and daily message usage on GET /api/auth/me', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student1@college.edu',
          password: 'Student@123',
        });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('student1@college.edu');
      expect(res.body.dailyUsage).toBeDefined();
      expect(res.body.dailyUsage.careerRoom).toBeDefined();
      expect(res.body.dailyUsage.studentConnect).toBeDefined();
      expect(res.body.dailyUsage.studentIssue).toBeDefined();
    });

    it('should protect routes from unauthorized access without token', async () => {
      const res = await request(app).get('/api/career-rooms');
      expect(res.status).toBe(401);
    });

    it('should generate OTP on forgot-password and login successfully via otp-login', async () => {
      // 1. Request forgot-password OTP
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'student1@college.edu' });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.debugOtp).toBeDefined();
      const otp = forgotRes.body.debugOtp;

      // 2. Login directly using the OTP
      const otpLoginRes = await request(app)
        .post('/api/auth/otp-login')
        .send({
          email: 'student1@college.edu',
          otp,
        });

      expect(otpLoginRes.status).toBe(200);
      expect(otpLoginRes.body.token).toBeDefined();
      expect(otpLoginRes.body.user.email).toBe('student1@college.edu');
    });
  });

  // 2. CAREER ROOMS TESTS (2-ROOM LIMIT & 10-MESSAGE DAILY LIMIT)
  describe('Phase 2: Career Path Rooms & Strict Constraints', () => {
    let studentToken: string;
    let rooms: any[] = [];

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@college.edu', password: 'Student@123' });
      studentToken = res.body.token;

      // Clean up previous test memberships for student1
      const user = await db('users').where({ email: 'student1@college.edu' }).first();
      await db('room_memberships').where({ user_id: user.id }).del();
      await db('daily_message_usage').where({ user_id: user.id }).del();

      const roomsRes = await request(app)
        .get('/api/career-rooms')
        .set('Authorization', `Bearer ${studentToken}`);
      rooms = roomsRes.body.rooms;
    });

    it('should list all career rooms with categories and details', async () => {
      expect(rooms.length).toBeGreaterThanOrEqual(12);
    });

    it('should allow student to join Room 1', async () => {
      const res = await request(app)
        .post(`/api/career-rooms/${rooms[0].id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.roomId).toBe(rooms[0].id);
    });

    it('should allow student to join Room 2', async () => {
      const res = await request(app)
        .post(`/api/career-rooms/${rooms[1].id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.roomId).toBe(rooms[1].id);
    });

    it('CRITICAL: should STRICTLY REJECT joining Room 3 (max 2 rooms limit)', async () => {
      const res = await request(app)
        .post(`/api/career-rooms/${rooms[2].id}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('ROOM_LIMIT_REACHED');
      expect(res.body.error).toMatch(/maximum of 2 career rooms/i);
    });

    it('CRITICAL: should enforce 10 messages/day limit in Career Path Rooms', async () => {
      // Send 10 messages successfully
      for (let i = 1; i <= 10; i++) {
        const res = await request(app)
          .post(`/api/career-rooms/${rooms[0].id}/messages`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ content: `Test message ${i} from automated verification` });

        expect(res.status).toBe(201);
        expect(res.body.remainingDailyMessages).toBe(10 - i);
        // Identity privacy verification: Should return anonymous alias
        expect(res.body.data.anonymous_alias).toMatch(/^Anonymous Student #\d{4}$/);
      }

      // 11th message MUST BE REJECTED with 429 Too Many Requests
      const rejected = await request(app)
        .post(`/api/career-rooms/${rooms[0].id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Attempting 11th message beyond daily allowance' });

      expect(rejected.status).toBe(429);
      expect(rejected.body.code).toBe('DAILY_LIMIT_EXHAUSTED');
      expect(rejected.body.remaining).toBe(0);
    });
  });

  // 3. STUDENT CONNECT TESTS (10-MESSAGE DAILY LIMIT & ANONYMITY)
  describe('Phase 3: Student Connect & Anonymity', () => {
    let student2Token: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student2@college.edu', password: 'Student@123' });
      student2Token = res.body.token;

      const user = await db('users').where({ email: 'student2@college.edu' }).first();
      await db('daily_message_usage').where({ user_id: user.id }).del();
    });

    it('CRITICAL: should post message with masked anonymous identifier and track limit', async () => {
      const res = await request(app)
        .post('/api/student-connect/messages')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          content: 'Hello everyone! Looking for advice regarding semester 4 robotics lab.',
          category: 'Academics & Advice',
        });

      expect(res.status).toBe(201);
      expect(res.body.post.anonymous_alias).toMatch(/^Anonymous Student #\d{4}$/);
      expect(res.body.post.sender_id).toBeUndefined(); // Sensitive internal ID masked
      expect(res.body.remainingDailyMessages).toBe(9);
    });

    it('CRITICAL: should enforce 10 messages/day limit in Student Connect', async () => {
      // 9 more messages to hit 10 total
      for (let i = 2; i <= 10; i++) {
        const res = await request(app)
          .post('/api/student-connect/messages')
          .set('Authorization', `Bearer ${student2Token}`)
          .send({ content: `Connect message iteration #${i}` });

        expect(res.status).toBe(201);
        expect(res.body.remainingDailyMessages).toBe(10 - i);
      }

      // 11th message should be rejected
      const rejected = await request(app)
        .post('/api/student-connect/messages')
        .set('Authorization', `Bearer ${student2Token}`)
        .send({ content: 'Rejected 11th connect message' });

      expect(rejected.status).toBe(429);
      expect(rejected.body.code).toBe('DAILY_LIMIT_EXHAUSTED');
    });
  });

  // 4. STUDENT ISSUES TESTS (2-SUBMISSION LIMIT & TRACKING ID)
  describe('Phase 4: Student Private Issues & 2-Daily Limit', () => {
    let studentToken: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@college.edu', password: 'Student@123' });
      studentToken = res.body.token;

      const user = await db('users').where({ email: 'student1@college.edu' }).first();
      await db('daily_message_usage').where({ user_id: user.id }).update({ student_issue_count: 0 });
    });

    it('should submit 1st issue and return unique tracking ID', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          category: 'hostel',
          title: 'Wi-Fi connectivity drop in Hostel Room 304',
          description: 'The Wi-Fi router on corridor 3 keeps disconnecting during peak evening hours.',
          location: 'Hostel 1, Corridor 3',
        });

      expect(res.status).toBe(201);
      expect(res.body.trackingId).toMatch(/^ISSUE-\d+$/);
      expect(res.body.remainingSubmissionsToday).toBe(1);
    });

    it('should submit 2nd issue successfully', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          category: 'mess',
          title: 'Mess food quality feedback for dinner meals',
          description: 'Vegetable dishes in dinner mess have excessive oil, please advise caterer.',
          location: 'Mess Dining Hall',
        });

      expect(res.status).toBe(201);
      expect(res.body.remainingSubmissionsToday).toBe(0);
    });

    it('CRITICAL: should STRICTLY REJECT 3rd issue submission (max 2/day limit)', async () => {
      const res = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          category: 'infrastructure',
          title: 'Third issue submission attempt',
          description: 'This submission should be rejected by backend rate-limiting middleware.',
        });

      expect(res.status).toBe(429);
      expect(res.body.code).toBe('DAILY_ISSUE_LIMIT_REACHED');
      expect(res.body.remaining).toBe(0);
    });
  });

  // 5. BOOKING TESTS (DOUBLE-BOOKING PREVENTION)
  describe('Phase 5: Facility & Slot Booking', () => {
    let studentToken: string;
    let slot: any;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@college.edu', password: 'Student@123' });
      studentToken = res.body.token;

      const slotsRes = await request(app)
        .get('/api/bookings/slots')
        .set('Authorization', `Bearer ${studentToken}`);
      slot = slotsRes.body[0];
    });

    it('should submit a valid booking request for an available slot', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          slot_id: slot.id,
          club_or_society: 'Robotics Club',
          purpose: 'Autonomous Rover Testing',
          description: 'Preparing rover navigation sensors for upcoming HackMatrix competition.',
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.status).toBe('pending');
    });

    it('CRITICAL: should prevent duplicate active booking for the same slot by the same student', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          slot_id: slot.id,
          club_or_society: 'AI Club',
          purpose: 'Model training workshop',
          description: 'Duplicate booking attempt for the exact same slot.',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already have an active/i);
    });

    it('should support flexible individual booking with auto-defaults and return human-readable validation error on invalid input', async () => {
      // 1. Invalid request without purpose should return clear human-readable error, not cryptic 'Validation failed'
      const invalidRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          slot_id: 'slot-sample-invalid-id',
          purpose: 'A', // too short (< 2 chars)
        });

      expect(invalidRes.status).toBe(400);
      expect(invalidRes.body.error).toContain('Please specify the booking purpose');

      // 2. Valid request without club or long description should auto-default cleanly
      const validSlots = await request(app)
        .get('/api/bookings/slots')
        .set('Authorization', `Bearer ${studentToken}`);
      const availableSlot = validSlots.body.find((s: any) => s.id !== slot.id && !s.is_booked);

      if (availableSlot) {
        const validRes = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            slot_id: availableSlot.id,
            purpose: 'Group Study',
          });

        expect(validRes.status).toBe(201);
        expect(validRes.body.booking.club_or_society).toBe('Individual / Student Group');
      }
    });
  });

  // 6. SECURITY & ROLE AUTHORIZATION TESTS
  describe('Phase 6: Role-Based Authorization & Admin Dashboard Security', () => {
    let studentToken: string;
    let adminToken: string;

    beforeAll(async () => {
      const sRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student1@college.edu', password: 'Student@123' });
      studentToken = sRes.body.token;

      const aRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@iiitbh.ac.in', password: 'Admin@123' });
      adminToken = aRes.body.token;
    });

    it('CRITICAL: Ordinary student MUST NOT access Admin Dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/i);
    });

    it('Authorized Admin should successfully access Admin Dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics.totalStudents).toBeGreaterThan(0);
      expect(res.body.metrics.activeRooms).toBeGreaterThanOrEqual(12);
    });

    it('Authorized Admin should be able to approve pending slot booking and have it updated on the calendar', async () => {
      const pendingBooking = await db('bookings').where({ status: 'pending' }).first();
      expect(pendingBooking).toBeDefined();

      const approveRes = await request(app)
        .patch(`/api/admin/bookings/${pendingBooking.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', reviewer_notes: 'Approved for official club activity' });

      expect(approveRes.status).toBe(200);

      const eventsRes = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(eventsRes.status).toBe(200);
      const calendarEvent = eventsRes.body.find((e: any) => e.id === `booking-${pendingBooking.id}`);
      expect(calendarEvent).toBeDefined();
      expect(calendarEvent.title).toContain('[Booked Slot]');
    });
  });
});
