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

// 1. GET ALL CAMPUS COMMUNITY ISSUES (VISIBLE TO ALL STUDENTS)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category, status, search, sort } = req.query;

    let query = db('student_issues')
      .leftJoin('users', 'student_issues.user_id', 'users.id')
      .select(
        'student_issues.id',
        'student_issues.tracking_id',
        'student_issues.category',
        'student_issues.title',
        'student_issues.description',
        'student_issues.location',
        'student_issues.attachment_name',
        'student_issues.status',
        'student_issues.is_anonymous',
        'student_issues.created_at',
        'student_issues.updated_at',
        'student_issues.user_id',
        'users.full_name as author_name',
        'users.department as author_department',
        'users.academic_year as author_year'
      );

    if (category && category !== 'all') {
      query = query.where('student_issues.category', category);
    }

    if (status && status !== 'all') {
      query = query.where('student_issues.status', status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(student_issues.title) LIKE ?', [q])
          .orWhereRaw('LOWER(student_issues.description) LIKE ?', [q])
          .orWhereRaw('LOWER(student_issues.location) LIKE ?', [q])
          .orWhereRaw('LOWER(student_issues.tracking_id) LIKE ?', [q]);
      });
    }

    query = query.orderBy('student_issues.created_at', 'desc');

    const rawIssues = await query;
    const issueIds = rawIssues.map((i) => i.id);

    let reactions: any[] = [];
    let messageCounts: any[] = [];

    if (issueIds.length > 0) {
      reactions = await db('issue_reactions')
        .whereIn('issue_id', issueIds)
        .select('issue_id', 'user_id');

      messageCounts = await db('issue_messages')
        .whereIn('issue_id', issueIds)
        .groupBy('issue_id')
        .select('issue_id')
        .count('id as count');
    }

    const messageCountMap = new Map<string, number>();
    messageCounts.forEach((m: any) => messageCountMap.set(m.issue_id, parseInt(m.count || '0', 10)));

    const reactionsMap = new Map<string, { total: number; hasReacted: boolean }>();
    reactions.forEach((r: any) => {
      const current = reactionsMap.get(r.issue_id) || { total: 0, hasReacted: false };
      current.total += 1;
      if (r.user_id === userId) {
        current.hasReacted = true;
      }
      reactionsMap.set(r.issue_id, current);
    });

    const enrichedIssues = rawIssues.map((issue) => {
      const rx = reactionsMap.get(issue.id) || { total: 0, hasReacted: false };
      const respCount = messageCountMap.get(issue.id) || 0;
      const isOwner = issue.user_id === userId;

      let authorDisplay = 'Verified IIITBH Student';
      if (!issue.is_anonymous && issue.author_name) {
        const shortName = issue.author_name.split(' ')[0] + ' ' + (issue.author_name.split(' ')[1] ? issue.author_name.split(' ')[1][0] + '.' : '');
        authorDisplay = `${shortName} • ${issue.author_department || 'Engineering'}`;
      } else if (isOwner) {
        authorDisplay = 'You (Posted Anonymously)';
      }

      return {
        id: issue.id,
        tracking_id: issue.tracking_id,
        category: issue.category,
        title: issue.title,
        description: issue.description,
        location: issue.location,
        attachment_name: issue.attachment_name,
        status: issue.status,
        is_anonymous: !!issue.is_anonymous,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        author_display: authorDisplay,
        is_own: isOwner,
        upvotes_count: rx.total,
        has_upvoted: rx.hasReacted,
        responses_count: respCount,
      };
    });

    if (sort === 'most_upvoted') {
      enrichedIssues.sort((a, b) => b.upvotes_count - a.upvotes_count);
    }

    res.status(200).json(enrichedIssues);
  } catch (err) {
    next(err);
  }
});

// 2. SUBMIT AN ISSUE (STRICT 2 ISSUES/DAY LIMIT)
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
        is_anonymous: z
          .union([z.boolean(), z.string().transform((v) => v === 'true' || v === '1')])
          .optional(),
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
        user_id: userId,
        category: data.category,
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location?.trim() || null,
        attachment_path: req.file ? req.file.filename : null,
        attachment_name: req.file ? req.file.originalname : null,
        status: 'submitted',
        is_anonymous: !!data.is_anonymous,
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

      try {
        const io = getIO();
        if (io) {
          io.emit('new_campus_issue', {
            id: issueId,
            tracking_id: trackingId,
            category: data.category,
            title: data.title,
            status: 'submitted',
            created_at: newIssue.created_at,
          });
        }
      } catch {}

      res.status(201).json({
        message: 'Your concern has been submitted to the Campus Welfare Cell and assigned a unique tracking ID.',
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
          is_anonymous: !!data.is_anonymous,
        },
        remainingSubmissionsToday: consumption.remaining,
        totalLimit: ENV.ISSUE_LIMIT_DAILY,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. TOGGLE REACTION (UPVOTE / "ME TOO")
router.post('/:id/react', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    let targetIssue = await db('student_issues')
      .where({ id })
      .orWhere({ tracking_id: id })
      .first();

    if (!targetIssue) {
      res.status(404).json({ error: 'Issue not found.' });
      return;
    }

    const actualIssueId = targetIssue.id;

    const existingReaction = await db('issue_reactions')
      .where({ issue_id: actualIssueId, user_id: userId })
      .first();

    let reacted = false;
    if (existingReaction) {
      await db('issue_reactions')
        .where({ issue_id: actualIssueId, user_id: userId })
        .delete();
      reacted = false;
    } else {
      await db('issue_reactions').insert({
        id: uuidv4(),
        issue_id: actualIssueId,
        user_id: userId,
        reaction_type: 'upvote',
        created_at: new Date(),
      });
      reacted = true;
    }

    const countRes = await db('issue_reactions')
      .where({ issue_id: actualIssueId })
      .count('id as count')
      .first();
    const upvotesCount = parseInt((countRes as any)?.count || '0', 10);

    try {
      const io = getIO();
      if (io) {
        io.emit('issue_reaction_updated', {
          issue_id: actualIssueId,
          upvotes_count: upvotesCount,
        });
      }
    } catch {}

    res.status(200).json({
      reacted,
      upvotes_count: upvotesCount,
      message: reacted ? 'Concern upvoted.' : 'Upvote removed.',
    });
  } catch (err) {
    next(err);
  }
});

// 4. GET CURRENT USER'S SUBMISSIONS
router.get('/my-submissions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const issues = await db('student_issues')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .select(
        'id',
        'tracking_id',
        'category',
        'title',
        'description',
        'location',
        'attachment_name',
        'status',
        'is_anonymous',
        'created_at',
        'updated_at'
      );

    // Get upvote & comment counts for user's issues
    const issueIds = issues.map((i) => i.id);
    let reactions: any[] = [];
    let messageCounts: any[] = [];

    if (issueIds.length > 0) {
      reactions = await db('issue_reactions')
        .whereIn('issue_id', issueIds)
        .select('issue_id', 'user_id');

      messageCounts = await db('issue_messages')
        .whereIn('issue_id', issueIds)
        .groupBy('issue_id')
        .select('issue_id')
        .count('id as count');
    }

    const messageCountMap = new Map<string, number>();
    messageCounts.forEach((m: any) => messageCountMap.set(m.issue_id, parseInt(m.count || '0', 10)));

    const reactionsMap = new Map<string, number>();
    reactions.forEach((r: any) => {
      reactionsMap.set(r.issue_id, (reactionsMap.get(r.issue_id) || 0) + 1);
    });

    const enrichedIssues = issues.map((i) => ({
      ...i,
      upvotes_count: reactionsMap.get(i.id) || 0,
      responses_count: messageCountMap.get(i.id) || 0,
      is_own: true,
    }));

    const usage = await getUserDailyUsage(userId);

    res.status(200).json({
      issues: enrichedIssues,
      dailyUsage: usage.studentIssue,
    });
  } catch (err) {
    next(err);
  }
});

// 5. VIEW / TRACK ISSUE (OPEN TO COMMUNITY & AUTHOR)
router.get('/track/:identifier', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier } = req.params;
    const userId = req.user!.id;

    let query = db('student_issues')
      .leftJoin('users', 'student_issues.user_id', 'users.id')
      .select(
        'student_issues.*',
        'users.full_name as author_name',
        'users.department as author_department',
        'users.academic_year as author_year'
      );

    if (identifier.startsWith('ISSUE-')) {
      query = query.where({ 'student_issues.tracking_id': identifier });
    } else {
      query = query.where({ 'student_issues.id': identifier });
    }

    const issue = await query.first();
    if (!issue) {
      res.status(404).json({ error: 'Issue record not found with the specified tracking ID.' });
      return;
    }

    // Fetch conversation & responses thread with sender details
    const messages = await db('issue_messages')
      .leftJoin('users', 'issue_messages.sender_id', 'users.id')
      .where({ issue_id: issue.id })
      .orderBy('issue_messages.created_at', 'asc')
      .select(
        'issue_messages.id',
        'issue_messages.sender_role',
        'issue_messages.sender_id',
        'issue_messages.message',
        'issue_messages.created_at',
        'users.full_name as sender_name',
        'users.role as sender_user_role',
        'users.department as sender_department'
      );

    // Check reactions
    const upvotesCount = await db('issue_reactions')
      .where({ issue_id: issue.id })
      .count('id as count')
      .first();

    const userReaction = await db('issue_reactions')
      .where({ issue_id: issue.id, user_id: userId })
      .first();

    const isOwner = issue.user_id === userId;

    let authorDisplay = 'Verified IIITBH Student';
    if (!issue.is_anonymous && issue.author_name) {
      authorDisplay = `${issue.author_name} (${issue.author_year || 'Student'} • ${issue.author_department || 'IIITBH'})`;
    } else if (isOwner) {
      authorDisplay = 'You (Posted Anonymously)';
    }

    const formattedMessages = messages.map((m: any) => {
      let displayName = m.sender_name || 'Campus Student';
      if (m.sender_role === 'admin' || m.sender_user_role === 'admin' || m.sender_user_role === 'super_admin') {
        displayName = 'Campus Authority / Committee';
      } else if (m.sender_id === issue.user_id) {
        displayName = issue.is_anonymous ? 'Issue Author (Student)' : m.sender_name || 'Issue Author';
      }

      return {
        id: m.id,
        sender_role: m.sender_role,
        sender_name: displayName,
        message: m.message,
        created_at: m.created_at,
        is_own: m.sender_id === userId,
      };
    });

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
        is_anonymous: !!issue.is_anonymous,
        author_display: authorDisplay,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        upvotes_count: parseInt((upvotesCount as any)?.count || '0', 10),
        has_upvoted: !!userReaction,
        responses_count: messages.length,
      },
      messages: formattedMessages,
      isOwner,
    });
  } catch (err) {
    next(err);
  }
});

// 6. POST RESPONSE / REPLY IN ISSUE THREAD (OPEN TO ALL STUDENTS & AUTHORITIES)
const replySchema = z.object({
  message: z.string().min(1, 'Response cannot be empty').max(2000),
});

router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = ['super_admin', 'admin', 'representative'].includes(req.user!.role);

    let issue = await db('student_issues')
      .where({ id })
      .orWhere({ tracking_id: id })
      .first();

    if (!issue) {
      res.status(404).json({ error: 'Issue not found.' });
      return;
    }

    const { message } = replySchema.parse(req.body);
    const senderRole = isAdmin ? 'admin' : 'student';

    const msgId = uuidv4();
    const newMsg = {
      id: msgId,
      issue_id: issue.id,
      sender_role: senderRole,
      sender_id: userId,
      message: message.trim(),
      created_at: new Date(),
    };

    await db('issue_messages').insert(newMsg);
    await db('student_issues').where({ id: issue.id }).update({ updated_at: new Date() });

    const currentUser = await db('users').where({ id: userId }).first();
    let displayName = currentUser?.full_name || 'Campus Student';
    if (isAdmin) {
      displayName = 'Campus Authority / Committee';
    } else if (userId === issue.user_id && issue.is_anonymous) {
      displayName = 'Issue Author (Student)';
    }

    const responsePayload = {
      id: msgId,
      issue_id: issue.id,
      sender_role: senderRole,
      sender_name: displayName,
      message: message.trim(),
      created_at: newMsg.created_at,
      is_own: true,
    };

    try {
      const io = getIO();
      if (io) {
        io.to(`issue_${issue.id}`).emit('new_issue_message', responsePayload);
        io.emit('issue_message_broadcast', {
          issue_id: issue.id,
          message_count_delta: 1,
        });
      }
    } catch {}

    res.status(201).json({
      message: 'Response posted to community issue discussion.',
      data: responsePayload,
    });
  } catch (err) {
    next(err);
  }
});

// 7. GET DAILY ISSUE USAGE
router.get('/usage/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usage = await getUserDailyUsage(req.user!.id);
    res.status(200).json(usage.studentIssue);
  } catch (err) {
    next(err);
  }
});

export default router;
