import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { authenticate, requireVerified, requireRole } from '../middleware/auth';
import { logAuditEvent } from '../services/auditLog.service';

const router = Router();

router.use(authenticate, requireVerified);

// 1. GET ALL CONTACTS WITH SEARCH & FILTER
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category } = req.query;

    let query = db('contacts').where({ is_authorized: true }).orderBy('category', 'asc').orderBy('name', 'asc');

    if (category && typeof category === 'string' && category !== 'all') {
      query = query.where({ category });
    }

    if (search && typeof search === 'string') {
      const s = `%${search}%`;
      query = query.where(function () {
        this.where('name', 'like', s)
          .orWhere('designation', 'like', s)
          .orWhere('department_or_hostel', 'like', s)
          .orWhere('email', 'like', s);
      });
    }

    const contacts = await query;
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
});

// Admin-only contact mutation routes
const contactSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name is required'),
  designation: z.string().min(2, 'Designation is required'),
  department_or_hostel: z.string().min(1, 'Department or hostel is required'),
  contact_number: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  availability: z.string().optional().nullable(),
  is_authorized: z.boolean().optional().default(true),
});

// 2. CREATE CONTACT (ADMIN ONLY)
router.post(
  '/',
  requireRole('super_admin', 'admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = contactSchema.parse(req.body);
      const contactId = uuidv4();

      const newContact = {
        id: contactId,
        category: data.category,
        name: data.name.trim(),
        designation: data.designation.trim(),
        department_or_hostel: data.department_or_hostel.trim(),
        contact_number: data.contact_number ? data.contact_number.trim() : null,
        email: data.email ? data.email.trim().toLowerCase() : null,
        availability: data.availability ? data.availability.trim() : 'Available during working hours',
        is_authorized: data.is_authorized ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db('contacts').insert(newContact);

      await logAuditEvent({
        userId: req.user!.id,
        action: 'CREATED_COLLEGE_CONTACT',
        resource: 'contacts',
        details: { name: newContact.name, category: newContact.category },
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'College contact added successfully.',
        contact: newContact,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. UPDATE CONTACT (ADMIN ONLY)
router.put(
  '/:id',
  requireRole('super_admin', 'admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = contactSchema.parse(req.body);

      const contact = await db('contacts').where({ id }).first();
      if (!contact) {
        res.status(404).json({ error: 'Contact not found.' });
        return;
      }

      await db('contacts')
        .where({ id })
        .update({
          category: data.category,
          name: data.name.trim(),
          designation: data.designation.trim(),
          department_or_hostel: data.department_or_hostel.trim(),
          contact_number: data.contact_number ? data.contact_number.trim() : null,
          email: data.email ? data.email.trim().toLowerCase() : null,
          availability: data.availability ? data.availability.trim() : null,
          is_authorized: data.is_authorized,
          updated_at: new Date(),
        });

      res.status(200).json({ message: 'Contact updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

// 4. DELETE CONTACT (ADMIN ONLY)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await db('contacts').where({ id }).del();
      if (!deleted) {
        res.status(404).json({ error: 'Contact not found.' });
        return;
      }
      res.status(200).json({ message: 'Contact removed successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
