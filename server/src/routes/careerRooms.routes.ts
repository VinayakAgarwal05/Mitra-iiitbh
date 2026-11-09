import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { authenticate, requireVerified } from '../middleware/auth';
import { consumeCareerRoomMessage, getUserDailyUsage } from '../services/messageCounter.service';
import { getAnonymousAlias } from '../services/anonymousAlias.service';
import { getIO } from '../sockets/chatHandler';

const router = Router();

// Protect all career room endpoints
router.use(authenticate, requireVerified);

// 1. GET ALL CAREER ROOMS
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch rooms
    const rooms = await db('career_rooms')
      .where({ is_active: true })
      .orderBy('category', 'asc')
      .orderBy('name', 'asc');

    // Fetch user memberships
    const userMemberships = await db('room_memberships')
      .where({ user_id: userId })
      .select('room_id');
    const userRoomIds = new Set(userMemberships.map((m) => m.room_id));

    // Fetch member counts per room
    const counts = await db('room_memberships')
      .groupBy('room_id')
      .select('room_id')
      .count('id as member_count');
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      countMap[c.room_id] = parseInt(c.member_count as string, 10) || 0;
    });

    const enrichedRooms = rooms.map((r) => ({
      ...r,
      is_member: userRoomIds.has(r.id),
      member_count: countMap[r.id] || 0,
    }));

    const usage = await getUserDailyUsage(userId);

    res.status(200).json({
      rooms: enrichedRooms,
      joinedCount: userRoomIds.size,
      maxRoomsAllowed: ENV.CAREER_ROOM_MEMBERSHIP_LIMIT,
      canJoinMore: userRoomIds.size < ENV.CAREER_ROOM_MEMBERSHIP_LIMIT,
      dailyUsage: usage.careerRoom,
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET SINGLE ROOM DETAILS
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const room = await db('career_rooms').where({ id, is_active: true }).first();
    if (!room) {
      res.status(404).json({ error: 'Career room not found.' });
      return;
    }

    const membership = await db('room_memberships')
      .where({ room_id: id, user_id: userId })
      .first();

    const memberCountRes = await db('room_memberships')
      .where({ room_id: id })
      .count('id as count')
      .first();

    const userMembershipsCount = await db('room_memberships')
      .where({ user_id: userId })
      .count('id as count')
      .first();

    res.status(200).json({
      room: {
        ...room,
        is_member: !!membership,
        member_count: parseInt((memberCountRes as any)?.count || '0', 10),
      },
      userJoinedTotal: parseInt((userMembershipsCount as any)?.count || '0', 10),
      maxRoomsAllowed: ENV.CAREER_ROOM_MEMBERSHIP_LIMIT,
    });
  } catch (err) {
    next(err);
  }
});

// 3. JOIN CAREER ROOM (STRICT 2-ROOM LIMIT)
router.post('/:id/join', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const room = await db('career_rooms').where({ id, is_active: true }).first();
    if (!room) {
      res.status(404).json({ error: 'Career room not found.' });
      return;
    }

    // Check existing membership
    const existing = await db('room_memberships')
      .where({ room_id: id, user_id: userId })
      .first();

    if (existing) {
      res.status(400).json({ error: 'You are already a member of this career room.' });
      return;
    }

    // Enforce STRICT 2-ROOM MEMBERSHIP LIMIT
    const currentMemberships = await db('room_memberships')
      .where({ user_id: userId })
      .count('id as count')
      .first();

    const count = parseInt((currentMemberships as any)?.count || '0', 10);
    if (count >= ENV.CAREER_ROOM_MEMBERSHIP_LIMIT) {
      res.status(400).json({
        error: `Membership limit reached: You can join a maximum of ${ENV.CAREER_ROOM_MEMBERSHIP_LIMIT} career rooms simultaneously. You must leave one before joining another.`,
        code: 'ROOM_LIMIT_REACHED',
        currentCount: count,
        maxAllowed: ENV.CAREER_ROOM_MEMBERSHIP_LIMIT,
      });
      return;
    }

    await db('room_memberships').insert({
      id: uuidv4(),
      room_id: id,
      user_id: userId,
      joined_at: new Date(),
    });

    res.status(200).json({
      message: `Successfully joined ${room.name}.`,
      roomId: id,
    });
  } catch (err) {
    next(err);
  }
});

// 4. LEAVE CAREER ROOM
router.delete('/:id/leave', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deleted = await db('room_memberships')
      .where({ room_id: id, user_id: userId })
      .del();

    if (!deleted) {
      res.status(400).json({ error: 'You are not a member of this room.' });
      return;
    }

    res.status(200).json({
      message: 'Successfully left the career room.',
      roomId: id,
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET ROOM MESSAGES (ANONYMOUS IDENTIFIERS ONLY)
router.get('/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check membership
    const isMember = await db('room_memberships')
      .where({ room_id: id, user_id: userId })
      .first();

    if (!isMember) {
      res.status(403).json({
        error: 'You must join this career room to view its discussions.',
        code: 'NOT_A_MEMBER',
      });
      return;
    }

    const messages = await db('messages')
      .where({ context_type: 'career_room', context_id: id })
      .orderBy('created_at', 'asc')
      .limit(100)
      .select('id', 'anonymous_alias', 'content', 'created_at', 'user_id');

    // Secure anonymity: Do NOT return actual user_id, but return is_self boolean
    const safeMessages = messages.map((m) => ({
      id: m.id,
      anonymous_alias: m.anonymous_alias,
      content: m.content,
      created_at: m.created_at,
      is_self: m.user_id === userId,
    }));

    const usage = await getUserDailyUsage(userId);

    res.status(200).json({
      messages: safeMessages,
      dailyUsage: usage.careerRoom,
    });
  } catch (err) {
    next(err);
  }
});

// 6. POST MESSAGE (STRICT 10 MESSAGES/DAY LIMIT)
const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long (max 1000 characters)'),
});

router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check membership
    const isMember = await db('room_memberships')
      .where({ room_id: id, user_id: userId })
      .first();

    if (!isMember) {
      res.status(403).json({
        error: 'You must join this career room before sending messages.',
        code: 'NOT_A_MEMBER',
      });
      return;
    }

    const { content } = messageSchema.parse(req.body);

    // Enforce STRICT 10 MESSAGES/DAY LIMIT on the server
    const consumption = await consumeCareerRoomMessage(userId);
    if (!consumption.allowed) {
      res.status(429).json({
        error: consumption.message,
        code: 'DAILY_LIMIT_EXHAUSTED',
        remaining: 0,
        limit: ENV.MESSAGE_LIMIT_CAREER,
      });
      return;
    }

    const anonymous_alias = getAnonymousAlias(userId, id);
    const messageId = uuidv4();

    const newMessage = {
      id: messageId,
      context_type: 'career_room',
      context_id: id,
      user_id: userId,
      anonymous_alias,
      content: content.trim(),
      created_at: new Date(),
    };

    await db('messages').insert(newMessage);

    // Emit Socket.IO message to room
    try {
      const io = getIO();
      if (io) {
        io.to(`room_${id}`).emit('new_message', {
          id: messageId,
          context_id: id,
          anonymous_alias,
          content: content.trim(),
          created_at: newMessage.created_at,
          sender_id: userId,
        });
      }
    } catch (socketErr) {
      console.warn('Socket emit error:', socketErr);
    }

    res.status(201).json({
      message: 'Message sent successfully.',
      data: {
        id: messageId,
        anonymous_alias,
        content: content.trim(),
        created_at: newMessage.created_at,
        is_self: true,
      },
      remainingDailyMessages: consumption.remaining,
      totalLimit: ENV.MESSAGE_LIMIT_CAREER,
    });
  } catch (err) {
    next(err);
  }
});

// 7. GET DAILY USAGE COUNTER
router.get('/usage/stats', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usage = await getUserDailyUsage(req.user!.id);
    res.status(200).json(usage.careerRoom);
  } catch (err) {
    next(err);
  }
});

export default router;
