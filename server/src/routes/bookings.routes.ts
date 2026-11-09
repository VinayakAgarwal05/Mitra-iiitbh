import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { authenticate, requireVerified, requireRole } from '../middleware/auth';
import { logAuditEvent } from '../services/auditLog.service';

const router = Router();

router.use(authenticate, requireVerified);

// 1. GET AVAILABLE SLOTS (FILTER BY FACILITY / DATE)
router.get('/slots', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, facility } = req.query;

    let query = db('booking_slots')
      .where({ is_available: true })
      .orderBy('slot_date', 'asc')
      .orderBy('start_time', 'asc');

    if (date && typeof date === 'string') {
      query = query.where({ slot_date: date });
    }

    if (facility && typeof facility === 'string' && facility !== 'all') {
      query = query.where({ facility_or_club: facility });
    }

    const slots = await query;

    // Check which slots already have active approved bookings
    const slotIds = slots.map((s) => s.id);
    let approvedBookings: any[] = [];
    if (slotIds.length > 0) {
      approvedBookings = await db('bookings')
        .whereIn('slot_id', slotIds)
        .where({ status: 'approved' })
        .select('slot_id');
    }

    const approvedSlotIds = new Set(approvedBookings.map((b) => b.slot_id));

    const enrichedSlots = slots.map((s) => ({
      ...s,
      is_booked: approvedSlotIds.has(s.id),
    }));

    res.status(200).json(enrichedSlots);
  } catch (err) {
    next(err);
  }
});

// 2. SUBMIT A BOOKING REQUEST (WITH DOUBLE-BOOKING PREVENTION)
const bookingRequestSchema = z.object({
  slot_id: z.string().min(1, 'Slot ID is required'),
  club_or_society: z.string().min(2, 'Club or society name is required'),
  purpose: z.string().min(3, 'Purpose is required'),
  description: z.string().min(10, 'Please describe the booking purpose in detail (min 10 chars)'),
});

router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { slot_id, club_or_society, purpose, description } = bookingRequestSchema.parse(req.body);

    // Transaction to safely avoid race conditions and double bookings
    const result = await db.transaction(async (trx) => {
      const slot = await trx('booking_slots').where({ id: slot_id }).first();
      if (!slot) {
        return { success: false, status: 404, error: 'The requested slot does not exist.' };
      }

      if (!slot.is_available) {
        return { success: false, status: 400, error: 'This facility slot is marked unavailable by administration.' };
      }

      // Check for existing approved booking for this exact slot
      const existingApproved = await trx('bookings')
        .where({ slot_id, status: 'approved' })
        .first();

      if (existingApproved) {
        return {
          success: false,
          status: 409,
          error: 'This slot is already reserved and approved for another activity. Please select another slot.',
        };
      }

      // Check if this user already has an active pending or approved booking for this slot
      const userActiveBooking = await trx('bookings')
        .where({ slot_id, user_id: userId })
        .whereIn('status', ['pending', 'approved'])
        .first();

      if (userActiveBooking) {
        return {
          success: false,
          status: 400,
          error: `You already have an active (${userActiveBooking.status}) booking request for this slot.`,
        };
      }

      // Check for overlapping approved reservations for the same facility on the same date and time
      const overlappingApproved = await trx('bookings')
        .join('booking_slots', 'bookings.slot_id', 'booking_slots.id')
        .where('booking_slots.facility_or_club', slot.facility_or_club)
        .where('booking_slots.slot_date', slot.slot_date)
        .where('bookings.status', 'approved')
        .where(function () {
          // Time overlap check: startA < endB and endA > startB
          this.where('booking_slots.start_time', '<', slot.end_time)
            .andWhere('booking_slots.end_time', '>', slot.start_time);
        })
        .first();

      if (overlappingApproved) {
        return {
          success: false,
          status: 409,
          error: 'A conflicting reservation has already been approved for this facility during this time range.',
        };
      }

      const bookingId = uuidv4();
      const newBooking = {
        id: bookingId,
        slot_id,
        user_id: userId,
        club_or_society: club_or_society.trim(),
        purpose: purpose.trim(),
        description: description.trim(),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await trx('bookings').insert(newBooking);

      return {
        success: true,
        booking: {
          ...newBooking,
          facility: slot.facility_or_club,
          date: slot.slot_date,
          time: `${slot.start_time} - ${slot.end_time}`,
        },
      };
    });

    if (!result.success) {
      res.status(result.status!).json({ error: result.error });
      return;
    }

    await logAuditEvent({
      userId,
      action: 'CREATED_BOOKING_REQUEST',
      resource: 'bookings',
      details: { slotId: slot_id, club: club_or_society },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Booking request submitted successfully! Awaiting administrator approval.',
      booking: result.booking,
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET USER'S BOOKINGS HISTORY
router.get('/my', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const bookings = await db('bookings')
      .join('booking_slots', 'bookings.slot_id', 'booking_slots.id')
      .where('bookings.user_id', userId)
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
        'booking_slots.end_time'
      );

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});

// 4. CANCEL BOOKING (USER'S OWN PENDING/APPROVED BOOKING)
router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await db('bookings').where({ id, user_id: userId }).first();
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ error: 'Booking is already cancelled.' });
      return;
    }

    await db('bookings').where({ id }).update({
      status: 'cancelled',
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Booking reservation has been cancelled.' });
  } catch (err) {
    next(err);
  }
});

// Admin management for slots
const slotSchema = z.object({
  facility_or_club: z.string().min(2),
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  start_time: z.string().min(3),
  end_time: z.string().min(3),
  max_capacity: z.number().int().positive().optional().default(1),
  notes: z.string().optional().nullable(),
});

router.post(
  '/slots',
  requireRole('super_admin', 'admin', 'representative'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = slotSchema.parse(req.body);
      const slotId = uuidv4();

      await db('booking_slots').insert({
        id: slotId,
        facility_or_club: data.facility_or_club.trim(),
        slot_date: data.slot_date,
        start_time: data.start_time,
        end_time: data.end_time,
        is_available: true,
        max_capacity: data.max_capacity,
        notes: data.notes?.trim() || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      res.status(201).json({ message: 'Booking slot created successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
