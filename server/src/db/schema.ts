import { db } from '../config/database';

export async function initializeSchema() {
  // 1. verified_domains
  if (!(await db.schema.hasTable('verified_domains'))) {
    await db.schema.createTable('verified_domains', (table) => {
      table.string('id').primary();
      table.string('domain').unique().notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 2. users
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (table) => {
      table.string('id').primary();
      table.string('full_name').notNullable();
      table.string('email').unique().notNullable();
      table.string('roll_number').notNullable();
      table.string('academic_year').notNullable(); // e.g. 1st Year, 2nd Year, 3rd Year, 4th Year
      table.string('department').notNullable(); // e.g. CSE, ECE, DSAI, Mechatronics
      table.string('password_hash').notNullable();
      table.string('role').defaultTo('student'); // super_admin, admin, representative, student
      table.boolean('is_verified').defaultTo(false);
      table.string('verification_otp').nullable();
      table.timestamp('verification_otp_expires_at').nullable();
      table.string('reset_password_token').nullable();
      table.timestamp('reset_password_expires_at').nullable();
      table.boolean('terms_accepted').defaultTo(false);
      table.string('terms_version').defaultTo('1.0');
      table.timestamp('terms_accepted_at').nullable();
      table.timestamps(true, true);
    });
  }

  // 3. career_rooms
  if (!(await db.schema.hasTable('career_rooms'))) {
    await db.schema.createTable('career_rooms', (table) => {
      table.string('id').primary();
      table.string('name').unique().notNullable();
      table.string('category').notNullable();
      table.text('description').notNullable();
      table.text('guidelines').notNullable();
      table.string('icon').defaultTo('Briefcase');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 4. room_memberships (User can join max 2 rooms simultaneously)
  if (!(await db.schema.hasTable('room_memberships'))) {
    await db.schema.createTable('room_memberships', (table) => {
      table.string('id').primary();
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('room_id').notNullable().references('id').inTable('career_rooms').onDelete('CASCADE');
      table.timestamp('joined_at').defaultTo(db.fn.now());
      table.unique(['user_id', 'room_id']);
    });
  }

  // 5. messages (Career room chats & Student Connect posts/replies)
  if (!(await db.schema.hasTable('messages'))) {
    await db.schema.createTable('messages', (table) => {
      table.string('id').primary();
      table.string('context_type').notNullable(); // 'career_room' | 'student_connect'
      table.string('context_id').nullable(); // room_id when career_room, category/topic or null when student_connect
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('anonymous_alias').notNullable(); // e.g. "Anonymous Student #1042"
      table.text('content').notNullable();
      table.string('parent_id').nullable().references('id').inTable('messages').onDelete('CASCADE'); // for replies
      table.string('tags').nullable();
      table.boolean('is_flagged').defaultTo(false);
      table.boolean('is_pinned').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 6. daily_message_usage (tracks messages sent per day per student by user_id)
  if (!(await db.schema.hasTable('daily_message_usage'))) {
    await db.schema.createTable('daily_message_usage', (table) => {
      table.string('id').primary();
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('usage_date').notNullable(); // YYYY-MM-DD
      table.integer('career_room_count').defaultTo(0);
      table.integer('student_connect_count').defaultTo(0);
      table.integer('student_issue_count').defaultTo(0);
      table.timestamp('updated_at').defaultTo(db.fn.now());
      table.unique(['user_id', 'usage_date']);
    });
  }

  // 7. study_materials
  if (!(await db.schema.hasTable('study_materials'))) {
    await db.schema.createTable('study_materials', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.string('subject').notNullable();
      table.string('department').notNullable();
      table.string('academic_year').notNullable();
      table.string('semester').notNullable();
      table.string('category').notNullable(); // notes, pyq, assignment, practical, book, guide, presentation
      table.text('description').nullable();
      table.string('tags').nullable();
      table.string('file_path').notNullable();
      table.string('original_filename').notNullable();
      table.integer('file_size').notNullable();
      table.string('file_type').notNullable();
      table.string('uploader_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('downloads_count').defaultTo(0);
      table.boolean('is_flagged').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 8. events
  if (!(await db.schema.hasTable('events'))) {
    await db.schema.createTable('events', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.string('category').notNullable(); // fest, tech, cultural, workshop, seminar, guest_lecture, club, sports, meeting, academic, placement, other
      table.text('description').notNullable();
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.string('venue').notNullable();
      table.string('organizer').notNullable();
      table.string('coordinator_name').notNullable();
      table.string('coordinator_contact').notNullable();
      table.string('registration_link').nullable();
      table.timestamp('registration_deadline').nullable();
      table.string('eligibility').nullable();
      table.text('preparation_notes').nullable();
      table.text('attachments').nullable(); // JSON string
      table.text('faqs').nullable(); // JSON string
      table.string('status').defaultTo('upcoming'); // upcoming, ongoing, completed, cancelled
      table.string('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
      table.timestamps(true, true);
    });
  }

  // 9. contacts
  if (!(await db.schema.hasTable('contacts'))) {
    await db.schema.createTable('contacts', (table) => {
      table.string('id').primary();
      table.string('category').notNullable(); // Hostel Representative, Student Representative, Class Representative, Hostel Warden, Other
      table.string('name').notNullable();
      table.string('designation').notNullable();
      table.string('department_or_hostel').notNullable();
      table.string('contact_number').nullable();
      table.string('email').nullable();
      table.string('availability').nullable();
      table.boolean('is_authorized').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 10. booking_slots
  if (!(await db.schema.hasTable('booking_slots'))) {
    await db.schema.createTable('booking_slots', (table) => {
      table.string('id').primary();
      table.string('facility_or_club').notNullable();
      table.string('slot_date').notNullable(); // YYYY-MM-DD
      table.string('start_time').notNullable(); // HH:MM
      table.string('end_time').notNullable(); // HH:MM
      table.boolean('is_available').defaultTo(true);
      table.integer('max_capacity').defaultTo(1);
      table.text('notes').nullable();
      table.timestamps(true, true);
    });
  }

  // 11. bookings
  if (!(await db.schema.hasTable('bookings'))) {
    await db.schema.createTable('bookings', (table) => {
      table.string('id').primary();
      table.string('slot_id').notNullable().references('id').inTable('booking_slots').onDelete('CASCADE');
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('club_or_society').notNullable();
      table.string('purpose').notNullable();
      table.text('description').notNullable();
      table.string('status').defaultTo('pending'); // pending, approved, rejected, cancelled
      table.string('reviewer_id').nullable().references('id').inTable('users').onDelete('SET NULL');
      table.text('reviewer_notes').nullable();
      table.timestamp('reviewed_at').nullable();
      table.timestamps(true, true);
    });
  }

  // 12. student_issues
  if (!(await db.schema.hasTable('student_issues'))) {
    await db.schema.createTable('student_issues', (table) => {
      table.string('id').primary();
      table.string('tracking_id').unique().notNullable(); // e.g. "ISSUE-83921"
      table.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE'); // internal audit only
      table.string('category').notNullable(); // hostel, mess, classroom, academic, faculty, infrastructure, harassment, safety, admin, other
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.string('location').nullable();
      table.string('attachment_path').nullable();
      table.string('attachment_name').nullable();
      table.string('status').defaultTo('submitted'); // submitted, under_review, in_progress, resolved, closed
      table.timestamps(true, true);
    });
  }

  // 13. issue_messages (confidential replies between student and issue handling team)
  if (!(await db.schema.hasTable('issue_messages'))) {
    await db.schema.createTable('issue_messages', (table) => {
      table.string('id').primary();
      table.string('issue_id').notNullable().references('id').inTable('student_issues').onDelete('CASCADE');
      table.string('sender_role').notNullable(); // student, admin
      table.string('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('message').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }

  // 14. reports
  if (!(await db.schema.hasTable('reports'))) {
    await db.schema.createTable('reports', (table) => {
      table.string('id').primary();
      table.string('target_type').notNullable(); // material, message
      table.string('target_id').notNullable();
      table.string('reporter_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('reason').notNullable();
      table.string('status').defaultTo('pending'); // pending, reviewed, action_taken, dismissed
      table.timestamps(true, true);
    });
  }

  // 15. audit_logs
  if (!(await db.schema.hasTable('audit_logs'))) {
    await db.schema.createTable('audit_logs', (table) => {
      table.string('id').primary();
      table.string('user_id').nullable();
      table.string('action').notNullable();
      table.string('resource').notNullable();
      table.text('details').nullable();
      table.string('ip_address').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
}
