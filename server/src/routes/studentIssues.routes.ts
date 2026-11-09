import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { authenticate, requireVerified } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { consumeStudentIssueSubmission, getUserDailyUsage } from '../services/messageCounter.service';
import { logAuditEvent } from '../services/auditLog.service';
import { getIO } from '../sockets/chatHandler';

const router = Router();

router.use(authenticate, requireVerified);

// Helper to generate unique tracking ID e.g. "ISSUE-84920"
function generateTrackingId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ISSUE-${randomNum}`;
}

// 1. SUBMIT AN ISSUE (STRICT 2 ISSUES/DAY LIMIT)
router.post(
  '/',
  upload.single('attachment'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Validate inputs
      const schema = z.object({
        category: z.string().min(1, 'Category is required'),
        title: z.string().min(5, 'Title must be at least 5 characters').max(200),
        description: z.string().min(15, 'Please provide detailed description (min 15 characters)'),
        location: z.string().optional().nullable(),
      });

      const data = schema.parse(req.body);

      // Check daily limit (Strict 2/day)
      const consumption = await consumeStudentIssueSubmission(userId);
      if (!consumption.allowed) {
        res.status(429).json({
          error: consumption.message,
          code: 'DAILY_ISSUE_LIMIT_REACHED',
          remaining: 0,
          limit: ENV.ISSUE_LIMIT_DAILY,
        });
        return;
      }

      const issueId = uuidv4();
      const trackingId = generateTrackingId();

      const newIssue = {
        id: issueId,
        tracking_id: trackingId,
        user_id: userId, // Internal privacy-preserving linkage for safety and anti-abuse
        category: data.category,
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location?.trim() || null,
        attachment_path: req.file ? req.file.filename : null,
        attachment_name: req.file ? req.file.originalname : null,
        status: 'submitted',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db('student_issues').insert(newIssue);

      await logAuditEvent({
        userId,
        action: 'SUBMITTED_STUDENT_ISSUE',
        resource: 'student_issues',
        details: { trackingId, category: data.category },
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'Your concern has been submitted privately and assigned a unique tracking ID.',
        trackingId,
        issue: {
          id: issueId,
          tracking_id: trackingId,
          category: data.category,
          title: data.title,
          description: data.description,
          location: data.location,
          status: 'submitted',
          created_at: newIssue.created_at,
          has_attachment: !!req.file,
        },
        remainingSubmissionsToday: consumption.remaining,
        totalLimit: ENV.ISSUE_LIMIT_DAILY,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 2. GET CURRENT USER'S SUBMISSIONS
router.get('/my-submissions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const issues = await db('student_issues')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .select('id', 'tracking_id', 'category', 'title', 'description', 'location', 'attachment_name', 'status', 'created_at', 'updated_at');

    const usage = await getUserDailyUsage(userId);

    res.status(200).json({
      issues,
      dailyUsage: usage.studentIssue,
    });
  } catch (err) {
    next(err);
  }
});

// 3. TRACK ISSUE BY TRACKING ID OR ID
router.get('/track/:identifier', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier } = req.params;
    const userId = req.user!.id;
    const isAdmin = ['super_admin', 'admin', 'representative'].includes(req.user!.role);

    let query = db('student_issues');
    if (identifier.startsWith('ISSUE-')) {
      query = query.where({ tracking_id: identifier });
    } else {
      query = query.where({ id: identifier });
    }

    const issue = await query.first();
    if (!issue) {
      res.status(404).json({ error: 'Issue record not found with the specified tracking ID.' });
      return;
    }

    // Security: Only the submitting student OR authorized administrators can access this issue
    if (issue.user_id !== userId && !isAdmin) {
      res.status(403).json({ error: 'Access denied: You are not authorized to view this issue.' });
      return;
    }

    // Fetch confidential conversation thread
    const messages = await db('issue_messages')
      .where({ issue_id: issue.id })
      .orderBy('created_at', 'asc')
      .select('id', 'sender_role', 'message', 'created_at');

    res.status(200).json({
      issue: {
        id: issue.id,
        tracking_id: issue.tracking_id,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        location: issue.location,
        attachment_name: issue.attachment_name,
        attachment_url: issue.attachment_path ? `/uploads/${issue.attachment_path}` : null,
        status: issue.status,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      },
      messages,
      isOwner: issue.user_id === userId,
    });
  } catch (err) {
    next(err);
  }
});

// 4. CONFIDENTIAL REPLY IN ISSUE THREAD
const replySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000),
});

router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = ['super_admin', 'admin', 'representative'].includes(req.user!.role);

    const issue = await db('student_issues').where({ id }).first();
    if (!issue) {
      res.status(404).json({ error: 'Issue not found.' });
      return;
    }

    if (issue.user_id !== userId && !isAdmin) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const { message } = replySchema.parse(req.body);
    const senderRole = isAdmin ? 'admin' : 'student';

    const msgId = uuidv4();
    const newMsg = {
      id: msgId,
      issue_id: id,
      sender_role: senderRole,
      sender_id: userId,
      message: message.trim(),
      created_at: new Date(),
    };

    await db('issue_messages').insert(newMsg);
    await db('student_issues').where({ id }).update({ updated_at: new Date() });

    try {
      const io = getIO();
      if (io) {
        io.to(`issue_${id}`).emit('new_issue_message', {
          id: msgId,
          issue_id: id,
          sender_role: senderRole,
          message: message.trim(),
          created_at: newMsg.created_at,
        });
      }
    } catch (err) {
      // Non-fatal socket error
    }

    res.status(201).json({
      message: 'Message added to confidential issue thread.',
      data: {
        id: msgId,
        sender_role: senderRole,
        message: message.trim(),
        created_at: newMsg.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET DAILY ISSUE USAGE
router.get('/usage/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usage = await getUserDailyUsage(req.user!.id);
    res.status(200).json(usage.studentIssue);
  } catch (err) {
    next(err);
  }
});

export default router;
