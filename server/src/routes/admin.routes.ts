import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { authenticate, requireVerified, requireRole } from '../middleware/auth';
import { logAuditEvent } from '../services/auditLog.service';
import { getIO } from '../sockets/chatHandler';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireVerified, requireRole('super_admin', 'admin', 'representative'));

// 1. DASHBOARD OVERVIEW METRICS
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalStudents = await db('users').count('id as count').first();
    const verifiedStudents = await db('users').where({ is_verified: true }).count('id as count').first();
    const activeRooms = await db('career_rooms').where({ is_active: true }).count('id as count').first();
    const totalMaterials = await db('study_materials').count('id as count').first();
    const upcomingEvents = await db('events').where('start_time', '>=', new Date()).count('id as count').first();
    const pendingBookings = await db('bookings').where({ status: 'pending' }).count('id as count').first();
    const pendingIssues = await db('student_issues').whereIn('status', ['submitted', 'under_review', 'in_progress']).count('id as count').first();
    const pendingReports = await db('reports').where({ status: 'pending' }).count('id as count').first();

    // Recent activity log
    const recentLogs = await db('audit_logs')
      .orderBy('created_at', 'desc')
      .limit(10);

    res.status(200).json({
      metrics: {
        totalStudents: parseInt((totalStudents as any)?.count || '0', 10),
        verifiedStudents: parseInt((verifiedStudents as any)?.count || '0', 10),
        activeRooms: parseInt((activeRooms as any)?.count || '0', 10),
        totalMaterials: parseInt((totalMaterials as any)?.count || '0', 10),
        upcomingEvents: parseInt((upcomingEvents as any)?.count || '0', 10),
        pendingBookings: parseInt((pendingBookings as any)?.count || '0', 10),
        pendingIssues: parseInt((pendingIssues as any)?.count || '0', 10),
        pendingReports: parseInt((pendingReports as any)?.count || '0', 10),
      },
      recentLogs,
    });
  } catch (err) {
    next(err);
  }
});

// 2. DOMAIN WHITELIST MANAGEMENT
router.get('/domains', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const domains = await db('verified_domains').orderBy('created_at', 'desc');
    res.status(200).json(domains);
  } catch (err) {
    next(err);
  }
});

router.post('/domains', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { domain } = z.object({ domain: z.string().min(3) }).parse(req.body);
    const cleanDomain = domain.replace(/^@/, '').toLowerCase().trim();

    const existing = await db('verified_domains').where({ domain: cleanDomain }).first();
    if (existing) {
      res.status(400).json({ error: 'This domain is already in the whitelist.' });
      return;
    }

    const newDomain = {
      id: uuidv4(),
      domain: cleanDomain,
      is_active: true,
      created_at: new Date(),
    };

    await db('verified_domains').insert(newDomain);
    await logAuditEvent({
      userId: req.user!.id,
      action: 'ADDED_EMAIL_DOMAIN',
      resource: 'verified_domains',
      details: { domain: cleanDomain },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: `Domain @${cleanDomain} whitelisted successfully.`, domain: newDomain });
  } catch (err) {
    next(err);
  }
});

router.delete('/domains/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await db('verified_domains').where({ id }).del();
    res.status(200).json({ message: 'Domain removed from whitelist.' });
  } catch (err) {
    next(err);
  }
});

// 3. STUDENT ISSUES REVIEW & RESOLUTION
router.get('/issues', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, category } = req.query;
    let query = db('student_issues').orderBy('created_at', 'desc');

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.where({ status });
    }

    if (category && typeof category === 'string' && category !== 'all') {
      query = query.where({ category });
    }

    const issues = await query.select(
      'id',
      'tracking_id',
      'category',
      'title',
      'description',
      'location',
      'attachment_name',
      'status',
      'created_at',
      'updated_at'
    );

    res.status(200).json(issues);
  } catch (err) {
    next(err);
  }
});

router.patch('/issues/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = z.object({
      status: z.enum(['submitted', 'under_review', 'in_progress', 'resolved', 'closed']),
      note: z.string().optional(),
    }).parse(req.body);

    const issue = await db('student_issues').where({ id }).first();
    if (!issue) {
      res.status(404).json({ error: 'Issue record not found.' });
      return;
    }

    await db('student_issues').where({ id }).update({
      status,
      updated_at: new Date(),
    });

    if (note && note.trim()) {
      await db('issue_messages').insert({
        id: uuidv4(),
        issue_id: id,
        sender_role: 'admin',
        sender_id: req.user!.id,
        message: `[Status Updated to ${status.toUpperCase()}]: ${note.trim()}`,
        created_at: new Date(),
      });
    }

    await logAuditEvent({
      userId: req.user!.id,
      action: 'UPDATED_ISSUE_STATUS',
      resource: 'student_issues',
      details: { issueId: id, status, trackingId: issue.tracking_id },
      ipAddress: req.ip,
    });

    res.status(200).json({ message: `Issue status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
});

// 4. BOOKINGS REVIEW & APPROVAL/REJECTION
router.get('/bookings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;

    let query = db('bookings')
      .join('booking_slots', 'bookings.slot_id', 'booking_slots.id')
      .join('users', 'bookings.user_id', 'users.id')
      .orderBy('bookings.created_at', 'desc')
      .select(
        'bookings.id',
        'bookings.club_or_society',
        'bookings.purpose',
        'bookings.description',
        'bookings.status',
        'bookings.reviewer_notes',
        'bookings.reviewed_at',
        'bookings.created_at',
        'booking_slots.facility_or_club',
        'booking_slots.slot_date',
        'booking_slots.start_time',
        'booking_slots.end_time',
        'users.full_name as student_name',
        'users.email as student_email'
      );

    if (status && typeof status === 'string' && status !== 'all') {
      query = query.where('bookings.status', status);
    }

    const bookings = await query;
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});

router.patch('/bookings/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewer_notes } = z.object({
      status: z.enum(['approved', 'rejected', 'cancelled']),
      reviewer_notes: z.string().optional().nullable(),
    }).parse(req.body);

    const booking = await db('bookings').where({ id }).first();
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    // If approving, double-check that no other approved booking occupies this slot
    if (status === 'approved') {
      const existingApproved = await db('bookings')
        .where({ slot_id: booking.slot_id, status: 'approved' })
        .whereNot({ id })
        .first();

      if (existingApproved) {
        res.status(409).json({ error: 'Another reservation for this slot has already been approved.' });
        return;
      }
    }

    await db('bookings').where({ id }).update({
      status,
      reviewer_id: req.user!.id,
      reviewer_notes: reviewer_notes?.trim() || null,
      reviewed_at: new Date(),
      updated_at: new Date(),
    });

    await logAuditEvent({
      userId: req.user!.id,
      action: `BOOKING_${status.toUpperCase()}`,
      resource: 'bookings',
      details: { bookingId: id, status },
      ipAddress: req.ip,
    });

    res.status(200).json({ message: `Booking request has been marked as ${status}.` });
  } catch (err) {
    next(err);
  }
});

// 5. MANAGE CAREER ROOMS
router.post('/career-rooms', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(3),
      category: z.string().min(2),
      description: z.string().min(10),
      guidelines: z.string().min(10),
      icon: z.string().optional().default('Briefcase'),
    });

    const data = schema.parse(req.body);
    const id = uuidv4();

    await db('career_rooms').insert({
      id,
      name: data.name.trim(),
      category: data.category.trim(),
      description: data.description.trim(),
      guidelines: data.guidelines.trim(),
      icon: data.icon,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({ message: 'Career room created successfully.', id });
  } catch (err) {
    next(err);
  }
});

// 6. REPORTS MODERATION
router.get('/reports', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reports = await db('reports')
      .orderBy('created_at', 'desc');

    res.status(200).json(reports);
  } catch (err) {
    next(err);
  }
});

router.post('/reports/:id/resolve', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = z.object({ action: z.enum(['dismiss', 'delete_target']) }).parse(req.body);

    const report = await db('reports').where({ id }).first();
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    if (action === 'delete_target') {
      if (report.target_type === 'material') {
        await db('study_materials').where({ id: report.target_id }).del();
      } else if (report.target_type === 'message') {
        await db('messages').where({ id: report.target_id }).update({ is_flagged: true });
      }
      await db('reports').where({ id }).update({ status: 'action_taken', updated_at: new Date() });
    } else {
      await db('reports').where({ id }).update({ status: 'dismissed', updated_at: new Date() });
    }

    res.status(200).json({ message: 'Report resolved successfully.' });
  } catch (err) {
    next(err);
  }
});

// 7. USER MANAGEMENT
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await db('users')
      .select('id', 'full_name', 'email', 'roll_number', 'academic_year', 'department', 'role', 'is_verified', 'created_at')
      .orderBy('created_at', 'desc');

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/role', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = z.object({ role: z.enum(['super_admin', 'admin', 'representative', 'student']) }).parse(req.body);

    await db('users').where({ id }).update({ role, updated_at: new Date() });
    await logAuditEvent({
      userId: req.user!.id,
      action: 'UPDATED_USER_ROLE',
      resource: 'users',
      details: { targetUserId: id, newRole: role },
      ipAddress: req.ip,
    });

    res.status(200).json({ message: 'User role updated.' });
  } catch (err) {
    next(err);
  }
});

// 8. AUDIT LOGS
router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await db('audit_logs').orderBy('created_at', 'desc').limit(100);
    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
