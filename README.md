# 🎓 COLLEGE CONNECT — IIITBH MITRA
### Complete Production-Ready Full-Stack College Community Platform

> **A centralized, privacy-preserving digital community exclusively for college students, faculty, and administrative authorities.**
> Combines professional career discussion rooms, peer academic resource vaults, interactive event calendars, conflict-prevented facility booking, anonymous student connect feeds, and private issue reporting.

---

## 🌟 Key Highlights & Core Features

### 1. 🔒 Authentication — Strict College Email Whitelist
- **Domain-Restricted Registration**: Only authorized college emails (`@iiitbh.ac.in`, `@college.edu`) are permitted. Public emails (e.g., `@gmail.com`, `@yahoo.com`) are rejected on both frontend and backend.
- **Email Verification**: OTP verification flow with expiration timestamps.
- **Security**: Argon2/Bcrypt password hashing, JWT authentication tokens, route protection middleware, and audit logs.
- **Terms & Conditions**: Mandatory agreement to community rules and privacy policy upon registration, storing version and acceptance timestamp.

### 2. 💼 Career Path Rooms (Strict Membership & Daily Message Limits)
- **12+ Configured Rooms**: Placement Preparation, Software Development, Data Science & AI/ML, GATE Preparation, UPSC, Banking Exams, MBA/CAT, Trading, Entrepreneurship, Higher Studies, and more.
- **Strict 2-Room Membership Limit**: A student can join a maximum of **TWO** career rooms simultaneously. Attempting to join a third is rejected by transactional server checks.
- **Strict 10 Messages/Day Limit**: Server-enforced daily cap of 10 messages across career rooms with real-time countdown meters (`X/10 remaining`) resetting daily at 00:00 midnight.
- **Real-Time Anonymous Chat**: Powered by Socket.IO with privacy-preserving anonymous identifiers (e.g. `Anonymous Student #1042`).

### 3. 📚 Study Materials & Academic Vault
- **Academic Resource Sharing**: Lecture notes, previous year question papers (PYQs), assignment solutions, lab manuals, e-books, and presentations.
- **Search & Multi-Dimensional Filters**: Search by keywords/tags, filter by department, semester (1–8), category, and sort by newest or most downloaded.
- **Secure File Storage**: Multer disk storage with MIME type checking, size limitations (25MB), and verified physical file downloads.
- **Student Moderation**: Inappropriate or copyrighted material reporting.

### 4. 👥 Official College Contacts Directory
- **Key Categories**: Hostel Representative (HR), Student Representative (SR), Class Representative (CR), Hostel Warden, and Faculty Advisors.
- **Authorized Publishing**: Displays verified contact numbers, college emails, designations, office hours, and availability indicators.
- **Strict Integrity**: Only administrators can add or update contacts; clearly indicates when information is unavailable.

### 5. 📅 Interactive College Calendar & .ICS Export
- **Dual Views**: Interactive monthly calendar with date-click detail inspection and upcoming chronological event lists.
- **Detailed Event Specifications**: Timing, campus venue, organizing body, coordinator details, preparation notes, and FAQs.
- **Calendar Integration**:
  - Downloadable standard **`.ics` calendar files** (compatible with Apple Calendar, Outlook, and mobile devices).
  - One-click **Add to Google Calendar** integration.

### 6. 🕒 Conflict-Prevented Club & Facility Slot Booking
- **Campus Facilities**: Robotics & IoT Lab, Main Auditorium, Music Society Room, Basketball Courts, and Seminar Halls.
- **Double-Booking & Conflict Prevention**: Transactional backend validation prevents overlapping approved reservations for the same facility.
- **Status Lifecycle**: `Pending` ➔ `Approved` / `Rejected` / `Cancelled`.
- **User Management**: Students can view their booking history and cancel pending requests.

### 7. 💬 Student Connect — Anonymous Campus Discussion Feed
- **Cross-Batch Interaction**: General anonymous platform for seniors, juniors, academic advice, project collaborations, and college life.
- **Threaded Replies & Real-Time Sync**: Reply directly to posts in real-time via Socket.IO.
- **Strict 10 Messages/Day Limit**: Server-enforced quota preventing spam, with daily remaining counters.
- **Identity Privacy**: Full names, student IDs, and emails are never exposed.

### 8. 🚨 Private Student Issues & Welfare Concerns
- **Confidential Concern Reporting**: Hostel problems, mess food hygiene, classroom equipment, safety, harassment, and administrative difficulties.
- **Strict 2 Issues/Day Limit**: Prevents automated spam and ensures thorough administrative review.
- **Unique Tracking IDs**: Every submission receives a unique tracking ID (e.g., `ISSUE-10021`).
- **Status Progression**: `Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
- **Encrypted Authority Chat**: Confidential communication thread between the reporting student and authorized committee members.

### 9. 🛡️ Secure Administrator Dashboard
- **Aggregated Metrics**: Total students, verified accounts, active rooms, uploaded materials, pending bookings, pending issues, and flagged content.
- **Domain Whitelist Management**: Add, remove, or toggle college domains dynamically.
- **Booking Approvals**: One-click approve/reject for facility requests.
- **Issue Resolution**: Update issue status and post official confidential responses.
- **Content Moderation & Audit Logs**: Review flagged posts/materials and inspect security audit trail.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router 7, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js, TypeScript, Knex.js, Socket.IO, Multer, Zod, Bcrypt.js, Helmet, Morgan |
| **Database** | SQLite3 (zero-dependency instant local development) & PostgreSQL 16 (production Docker deployment) |
| **Testing** | Vitest, Supertest (20 automated comprehensive tests covering all critical business rules) |
| **DevOps** | Docker, Docker Compose multi-stage build |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "IIITBH MITRA"
```

Install dependencies for all workspaces:
```bash
npm run install:all
```

### 2. Seed Database & Start Local Development
Run the database seed script to initialize sample career rooms, events, contacts, and demo accounts:
```bash
npm run seed
```

Start the backend and frontend development servers:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5001)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run dev:client
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Pre-Configured Demo Accounts (1-Click Login on UI)

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@iiitbh.ac.in` | `Admin@123` | Full access to Admin Dashboard, Domain Whitelist, Moderation, Approvals |
| **Student 1** | `student1@college.edu` | `Student@123` | Verified 3rd Year CSE student |
| **Student 2** | `student2@college.edu` | `Student@123` | Verified 2nd Year ECE student |
| **Hostel Warden** | `warden@iiitbh.ac.in` | `Warden@123` | Authorized representative |

---

## 🧪 Automated Testing & Verification Suite

A comprehensive test suite with 20 automated tests verifies all critical business constraints:
```bash
npm test
```

### Verified Test Cases:
1. `Phase 1`: Rejection of unauthorized email domains (`@gmail.com`).
2. `Phase 1`: Terms and conditions acceptance enforcement.
3. `Phase 1`: Successful registration and OTP issuance.
4. `Phase 1`: OTP verification and token generation.
5. `Phase 1`: Secure credential login and route protection.
6. `Phase 2`: Career room listing with category grouping.
7. `Phase 2`: Joining room 1 and room 2.
8. `Phase 2`: **Strict rejection of 3rd career room (Max 2 limit)**.
9. `Phase 2`: Sending 10 messages and **rejection of 11th message (Max 10/day limit)**.
10. `Phase 3`: Student Connect anonymous alias masking.
11. `Phase 3`: **Student Connect 10 messages/day limit enforcement**.
12. `Phase 4`: Student Issues submission and unique tracking ID generation.
13. `Phase 4`: **Strict rejection of 3rd student issue (Max 2/day limit)**.
14. `Phase 5`: Conflict-free slot booking.
15. `Phase 5`: **Double-booking prevention**.
16. `Phase 6`: **Rejection of normal students from Admin Dashboard**.
17. `Phase 6`: Admin access to administrative metrics and logs.

---

## 🐳 Production Deployment with Docker Compose

To deploy the production-ready application with a PostgreSQL database:
```bash
docker compose up --build -d
```
The entire application will be compiled and launched at `http://localhost:5001`.

---

## 📖 API Documentation Overview

### Authentication
- `POST /api/auth/register` — Register student with college email domain validation.
- `POST /api/auth/verify-email` — Verify email using 6-digit OTP.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve authenticated user profile and daily usage counters.

### Career Rooms
- `GET /api/career-rooms` — List rooms with membership status.
- `POST /api/career-rooms/:id/join` — Join room (checks max 2-room limit).
- `DELETE /api/career-rooms/:id/leave` — Leave room.
- `GET /api/career-rooms/:id/messages` — Fetch anonymous chat history.
- `POST /api/career-rooms/:id/messages` — Post message (checks 10/day limit).

### Study Materials
- `GET /api/materials` — Filter and search uploaded academic resources.
- `POST /api/materials` — Upload resource with Multer file validation.
- `GET /api/materials/:id/download` — Secure file download stream.
- `POST /api/materials/:id/report` — Report inappropriate content.

### Calendar & Bookings
- `GET /api/events` — Retrieve college events.
- `GET /api/events/:id/ics` — Download RFC 5545 `.ics` calendar file.
- `GET /api/bookings/slots` — List available facility slots.
- `POST /api/bookings` — Request booking with conflict & double-booking prevention.

### Student Connect & Issues
- `GET /api/student-connect/messages` — Real-time anonymous community feed.
- `POST /api/student-connect/messages` — Create post/reply (checks 10/day limit).
- `POST /api/issues` — Submit confidential concern (checks 2/day limit).
- `GET /api/issues/track/:identifier` — Track concern progress and review authority replies.

### Administration
- `GET /api/admin/dashboard` — Platform aggregated metrics.
- `GET /api/admin/domains` & `POST /api/admin/domains` — Manage whitelisted domains.
- `PATCH /api/admin/bookings/:id` — Approve or reject facility bookings.
- `PATCH /api/admin/issues/:id/status` — Update concern resolution status and reply.

---

## 📜 License
Developed for the IIITBH Student Community. All rights reserved.
