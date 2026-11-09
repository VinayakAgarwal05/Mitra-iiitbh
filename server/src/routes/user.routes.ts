import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// 1. UPDATE PROFILE SETTINGS
router.put('/profile', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { academic_year, department } = z.object({
      academic_year: z.string().min(1),
      department: z.string().min(1),
    }).parse(req.body);

    await db('users').where({ id: userId }).update({
      academic_year,
      department,
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// 2. CHANGE PASSWORD
router.post('/change-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = z.object({
      current_password: z.string().min(1),
      new_password: z.string().min(6),
    }).parse(req.body);

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db('users').where({ id: userId }).update({
      password_hash,
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
