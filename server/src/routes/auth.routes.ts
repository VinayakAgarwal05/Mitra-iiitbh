import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { ENV } from '../config/env';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { logAuditEvent } from '../services/auditLog.service';
import { getUserDailyUsage } from '../services/messageCounter.service';

const router = Router();

// Domain validation helper
async function isEmailDomainAllowed(email: string): Promise<boolean> {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase().trim();

  // Check database verified domains
  const dbDomain = await db('verified_domains')
    .where({ domain, is_active: true })
    .first();

  if (dbDomain) return true;

  // Fallback to configured environment whitelist
  return ENV.WHITELISTED_DOMAINS.includes(domain);
}

// 1. REGISTER
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  roll_number: z.string().min(2, 'Roll number or student ID is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  department: z.string().min(1, 'Department / Branch is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms and Conditions to register.',
  }),
});

router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    // Check college email whitelist
    const isAllowed = await isEmailDomainAllowed(email);
    if (!isAllowed) {
      const activeDomains = await db('verified_domains').where({ is_active: true }).select('domain');
      const domainsList = activeDomains.map(d => '@' + d.domain).join(', ') || '@iiitbh.ac.in, @college.edu';
      res.status(400).json({
        error: `Registration restricted. Only authorized college email domains (${domainsList}) are permitted.`,
      });
      return;
    }

    // Check existing email
    const existing = await db('users').where({ email }).first();
    if (existing) {
      res.status(400).json({ error: 'An account with this college email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const userId = uuidv4();
    await db('users').insert({
      id: userId,
      full_name: data.full_name,
      email,
      roll_number: data.roll_number,
      academic_year: data.academic_year,
      department: data.department,
      password_hash,
      role: 'student',
      is_verified: false,
      verification_otp: otp,
      verification_otp_expires_at: otpExpires,
      terms_accepted: true,
      terms_version: '1.0',
      terms_accepted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await logAuditEvent({
      userId,
      action: 'USER_REGISTERED',
      resource: 'users',
      details: { email, department: data.department },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Registration successful! An OTP has been sent to your college email address.',
      email,
      ...(ENV.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    });
  } catch (err) {
    next(err);
  }
});

// 2. VERIFY EMAIL
const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4, 'OTP is required'),
});

router.post('/verify-email', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = verifySchema.parse(req.body);
    const user = await db('users').where({ email: email.toLowerCase().trim() }).first();

    if (!user) {
      res.status(404).json({ error: 'User not found with this email.' });
      return;
    }

    if (user.is_verified) {
      res.status(200).json({ message: 'Email is already verified. Please log in.' });
      return;
    }

    if (user.verification_otp !== otp.trim()) {
      res.status(400).json({ error: 'Invalid verification code.' });
      return;
    }

    if (user.verification_otp_expires_at && new Date(user.verification_otp_expires_at) < new Date()) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    await db('users').where({ id: user.id }).update({
      is_verified: true,
      verification_otp: null,
      verification_otp_expires_at: null,
      updated_at: new Date(),
    });

    await logAuditEvent({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      resource: 'users',
      details: { email: user.email },
      ipAddress: req.ip,
    });

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Email verified successfully! Welcome to College Connect.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        academic_year: user.academic_year,
        department: user.department,
        role: user.role,
        is_verified: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. LOGIN
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await db('users').where({ email: email.toLowerCase().trim() }).first();

    if (!user) {
      res.status(401).json({ error: 'Invalid college email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid college email or password.' });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({
        error: 'Your college email is not verified yet. Please enter the verification OTP.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET, { expiresIn: '7d' });

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      details: { email: user.email },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roll_number: user.roll_number,
        academic_year: user.academic_year,
        department: user.department,
        role: user.role,
        is_verified: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 4. RESEND OTP
router.post('/resend-otp', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await db('users').where({ email: email.toLowerCase().trim() }).first();

    if (!user) {
      res.status(404).json({ error: 'No account found with this email.' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db('users').where({ id: user.id }).update({
      verification_otp: otp,
      verification_otp_expires_at: otpExpires,
    });

    res.status(200).json({
      message: 'A new verification code has been generated.',
      ...(ENV.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    });
  } catch (err) {
    next(err);
  }
});

// 5. CURRENT USER (GET /me)
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await db('users').where({ id: req.user!.id }).first();
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    const usage = await getUserDailyUsage(req.user!.id);
    const joinedRooms = await db('room_memberships')
      .join('career_rooms', 'room_memberships.room_id', 'career_rooms.id')
      .where('room_memberships.user_id', req.user!.id)
      .select('career_rooms.id', 'career_rooms.name', 'career_rooms.category');

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roll_number: user.roll_number,
        academic_year: user.academic_year,
        department: user.department,
        role: user.role,
        is_verified: !!user.is_verified,
      },
      dailyUsage: usage,
      joinedRooms,
    });
  } catch (err) {
    next(err);
  }
});

// 6. FORGOT PASSWORD
router.post('/forgot-password', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await db('users').where({ email: email.toLowerCase().trim() }).first();

    if (!user) {
      // Return 200 for security so attackers cannot enumerate registered emails
      res.status(200).json({ message: 'If that email is registered, a reset code has been sent.' });
      return;
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await db('users').where({ id: user.id }).update({
      reset_password_token: resetToken,
      reset_password_expires_at: resetExpires,
    });

    res.status(200).json({
      message: 'Password reset code generated.',
      ...(ENV.NODE_ENV !== 'production' ? { debugResetCode: resetToken } : {}),
    });
  } catch (err) {
    next(err);
  }
});

// 7. RESET PASSWORD
router.post('/reset-password', authLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code, new_password } = z.object({
      email: z.string().email(),
      code: z.string().min(4),
      new_password: z.string().min(6),
    }).parse(req.body);

    const user = await db('users').where({ email: email.toLowerCase().trim() }).first();
    if (!user || user.reset_password_token !== code.trim()) {
      res.status(400).json({ error: 'Invalid or expired password reset code.' });
      return;
    }

    if (user.reset_password_expires_at && new Date(user.reset_password_expires_at) < new Date()) {
      res.status(400).json({ error: 'Password reset code has expired.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db('users').where({ id: user.id }).update({
      password_hash,
      reset_password_token: null,
      reset_password_expires_at: null,
      updated_at: new Date(),
    });

    res.status(200).json({ message: 'Password has been successfully updated. You may now log in.' });
  } catch (err) {
    next(err);
  }
});

// 8. LOGOUT
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Logged out successfully.' });
});

export default router;
