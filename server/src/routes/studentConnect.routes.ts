import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { authenticate, requireVerified } from '../middleware/auth';
import { consumeStudentConnectMessage, getUserDailyUsage } from '../services/messageCounter.service';
import { getAnonymousAlias } from '../services/anonymousAlias.service';
import { getIO } from '../sockets/chatHandler';

const router = Router();

router.use(authenticate, requireVerified);

// 1. GET ALL STUDENT CONNECT MESSAGES (FEED)
router.get('/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category, search } = req.query;

    let query = db('messages')
      .where({ context_type: 'student_connect', is_flagged: false, parent_id: null })
      .orderBy('created_at', 'desc')
      .limit(50);

    if (category && typeof category === 'string' && category !== 'all') {
      query = query.where({ context_id: category });
    }

    if (search && typeof search === 'string') {
      query = query.where('content', 'like', `%${search}%`);
    }

    const rootPosts = await query.select(
      'id',
      'context_id',
      'anonymous_alias',
      'content',
      'tags',
      'is_pinned',
      'created_at',
      'user_id'
    );

    // Fetch replies for each post
    const postIds = rootPosts.map((p) => p.id);
    let replies: any[] = [];
    if (postIds.length > 0) {
      replies = await db('messages')
        .whereIn('parent_id', postIds)
        .where({ is_flagged: false })
        .orderBy('created_at', 'asc')
        .select('id', 'parent_id', 'anonymous_alias', 'content', 'created_at', 'user_id');
    }

    const repliesByParent: Record<string, any[]> = {};
    replies.forEach((r) => {
      if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = [];
      repliesByParent[r.parent_id].push({
        id: r.id,
        anonymous_alias: r.anonymous_alias,
        content: r.content,
        created_at: r.created_at,
        is_self: r.user_id === userId,
      });
    });

    const enrichedPosts = rootPosts.map((p) => ({
      id: p.id,
      category: p.context_id || 'General Discussion',
      anonymous_alias: p.anonymous_alias,
      content: p.content,
      tags: p.tags,
      is_pinned: !!p.is_pinned,
      created_at: p.created_at,
      is_self: p.user_id === userId,
      replies: repliesByParent[p.id] || [],
      replies_count: (repliesByParent[p.id] || []).length,
    }));

    const usage = await getUserDailyUsage(userId);

    res.status(200).json({
      posts: enrichedPosts,
      dailyUsage: usage.studentConnect,
    });
  } catch (err) {
    next(err);
  }
});

// 2. CREATE POST OR REPLY (STRICT 10 MESSAGES/DAY LIMIT)
const postSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1500, 'Message too long'),
  category: z.string().optional().default('General Discussion'),
  parent_id: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

router.post('/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { content, category, parent_id, tags } = postSchema.parse(req.body);

    // Enforce STRICT 10 MESSAGES/DAY LIMIT
    const consumption = await consumeStudentConnectMessage(userId);
    if (!consumption.allowed) {
      res.status(429).json({
        error: consumption.message,
        code: 'DAILY_LIMIT_EXHAUSTED',
        remaining: 0,
        limit: ENV.MESSAGE_LIMIT_CONNECT,
      });
      return;
    }

    const messageId = uuidv4();
    const anonymous_alias = getAnonymousAlias(userId, parent_id || category);

    const newRecord = {
      id: messageId,
      context_type: 'student_connect',
      context_id: category,
      parent_id: parent_id || null,
      user_id: userId,
      anonymous_alias,
      content: content.trim(),
      tags: tags || null,
      is_flagged: false,
      is_pinned: false,
      created_at: new Date(),
    };

    await db('messages').insert(newRecord);

    const safeResponse = {
      id: messageId,
      category,
      parent_id: parent_id || null,
      anonymous_alias,
      content: content.trim(),
      tags: tags || null,
      is_pinned: false,
      created_at: newRecord.created_at,
      is_self: true,
      replies: [],
      replies_count: 0,
    };

    // Emit Socket.IO message
    try {
      const io = getIO();
      if (io) {
        io.to('student_connect_channel').emit('new_connect_message', {
          ...safeResponse,
          sender_id: userId,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit error:', socketErr);
    }

    res.status(201).json({
      message: 'Message posted successfully.',
      post: safeResponse,
      remainingDailyMessages: consumption.remaining,
      totalLimit: ENV.MESSAGE_LIMIT_CONNECT,
    });
  } catch (err) {
    next(err);
  }
});

// 3. REPORT MESSAGE
const reportSchema = z.object({
  reason: z.string().min(3, 'Please provide a valid reason for reporting.'),
});

router.post('/messages/:id/report', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = reportSchema.parse(req.body);

    const message = await db('messages').where({ id }).first();
    if (!message) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }

    // Check existing report from this user
    const existing = await db('reports')
      .where({ target_type: 'message', target_id: id, reporter_id: userId })
      .first();

    if (existing) {
      res.status(400).json({ error: 'You have already reported this message.' });
      return;
    }

    await db('reports').insert({
      id: uuidv4(),
      target_type: 'message',
      target_id: id,
      reporter_id: userId,
      reason: reason.trim(),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Thank you. The message has been reported for administrative review.' });
  } catch (err) {
    next(err);
  }
});

// 4. GET USAGE COUNTER
router.get('/usage/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usage = await getUserDailyUsage(req.user!.id);
    res.status(200).json(usage.studentConnect);
  } catch (err) {
    next(err);
  }
});

export default router;
