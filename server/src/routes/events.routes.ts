import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as ics from 'ics';
import { db } from '../config/database';
import { authenticate, requireVerified, requireRole } from '../middleware/auth';
import { logAuditEvent } from '../services/auditLog.service';

const router = Router();

router.use(authenticate, requireVerified);

// 1. GET ALL EVENTS (WITH SEARCH & FILTERS)
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, month, year } = req.query;

    let query = db('events').orderBy('start_time', 'asc');

    if (category && typeof category === 'string' && category !== 'all') {
      query = query.where({ category });
    }

    if (search && typeof search === 'string') {
      const s = `%${search}%`;
      query = query.where(function () {
        this.where('title', 'like', s)
          .orWhere('description', 'like', s)
          .orWhere('venue', 'like', s)
          .orWhere('organizer', 'like', s);
      });
    }

    const events = await query;
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
});

// 2. GET EVENT DETAILS
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await db('events').where({ id }).first();

    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // Parse attachments and FAQs JSON if stored as strings
    let attachments = [];
    let faqs = [];
    try {
      if (event.attachments) attachments = typeof event.attachments === 'string' ? JSON.parse(event.attachments) : event.attachments;
      if (event.faqs) faqs = typeof event.faqs === 'string' ? JSON.parse(event.faqs) : event.faqs;
    } catch (e) {
      // Fallback
    }

    res.status(200).json({
      ...event,
      attachments,
      faqs,
    });
  } catch (err) {
    next(err);
  }
});

// 3. EXPORT EVENT AS .ICS CALENDAR FILE
router.get('/:id/ics', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await db('events').where({ id }).first();

    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    const startArray: [number, number, number, number, number] = [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ];

    const endArray: [number, number, number, number, number] = [
      end.getFullYear(),
      end.getMonth() + 1,
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
    ];

    const icsEvent: ics.EventAttributes = {
      start: startArray,
      end: endArray,
      title: event.title,
      description: `${event.description}\n\nOrganizer: ${event.organizer}\nCoordinator: ${event.coordinator_name} (${event.coordinator_contact})`,
      location: event.venue,
      url: event.registration_link || undefined,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: event.organizer, email: 'events@college.edu' },
    };

    ics.createEvent(icsEvent, (error, value) => {
      if (error || !value) {
        res.status(500).json({ error: 'Failed to generate calendar event file.' });
        return;
      }

      const filename = `${event.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`;
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(value);
    });
  } catch (err) {
    next(err);
  }
});

// Admin-only Event routes
const eventSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(1),
  description: z.string().min(10),
  start_time: z.string().refine(val => !isNaN(Date.parse(val))),
  end_time: z.string().refine(val => !isNaN(Date.parse(val))),
  venue: z.string().min(2),
  organizer: z.string().min(2),
  coordinator_name: z.string().min(2),
  coordinator_contact: z.string().min(2),
  registration_link: z.string().optional().nullable(),
  registration_deadline: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  preparation_notes: z.string().optional().nullable(),
  attachments: z.any().optional(),
  faqs: z.any().optional(),
  status: z.string().optional().default('upcoming'),
});

// 4. CREATE EVENT (ADMIN ONLY)
router.post(
  '/',
  requireRole('super_admin', 'admin', 'representative'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = eventSchema.parse(req.body);
      const eventId = uuidv4();

      const newEvent = {
        id: eventId,
        title: data.title.trim(),
        category: data.category.trim(),
        description: data.description.trim(),
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        venue: data.venue.trim(),
        organizer: data.organizer.trim(),
        coordinator_name: data.coordinator_name.trim(),
        coordinator_contact: data.coordinator_contact.trim(),
        registration_link: data.registration_link ? data.registration_link.trim() : null,
        registration_deadline: data.registration_deadline ? new Date(data.registration_deadline) : null,
        eligibility: data.eligibility ? data.eligibility.trim() : null,
        preparation_notes: data.preparation_notes ? data.preparation_notes.trim() : null,
        attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        faqs: data.faqs ? JSON.stringify(data.faqs) : null,
        status: data.status || 'upcoming',
        created_by: req.user!.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db('events').insert(newEvent);

      await logAuditEvent({
        userId: req.user!.id,
        action: 'CREATED_EVENT',
        resource: 'events',
        details: { title: newEvent.title, category: newEvent.category },
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'College event published successfully!',
        event: newEvent,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 5. UPDATE EVENT (ADMIN ONLY)
router.put(
  '/:id',
  requireRole('super_admin', 'admin', 'representative'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = eventSchema.parse(req.body);

      const event = await db('events').where({ id }).first();
      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      await db('events')
        .where({ id })
        .update({
          title: data.title.trim(),
          category: data.category.trim(),
          description: data.description.trim(),
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          venue: data.venue.trim(),
          organizer: data.organizer.trim(),
          coordinator_name: data.coordinator_name.trim(),
          coordinator_contact: data.coordinator_contact.trim(),
          registration_link: data.registration_link ? data.registration_link.trim() : null,
          registration_deadline: data.registration_deadline ? new Date(data.registration_deadline) : null,
          eligibility: data.eligibility ? data.eligibility.trim() : null,
          preparation_notes: data.preparation_notes ? data.preparation_notes.trim() : null,
          attachments: data.attachments ? JSON.stringify(data.attachments) : null,
          faqs: data.faqs ? JSON.stringify(data.faqs) : null,
          status: data.status || event.status,
          updated_at: new Date(),
        });

      res.status(200).json({ message: 'Event updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// 6. DELETE EVENT (ADMIN ONLY)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await db('events').where({ id }).del();
      if (!deleted) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }
      res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
