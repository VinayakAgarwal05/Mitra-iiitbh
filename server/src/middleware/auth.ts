import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { db } from '../config/database';
import { AuthUser } from '../types/express';

interface JwtPayload {
  userId: string;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    } catch (jwtErr) {
      res.status(401).json({ error: 'Invalid or expired token.' });
      return;
    }

    const user = await db('users')
      .where({ id: decoded.userId })
      .select('id', 'email', 'full_name', 'roll_number', 'academic_year', 'department', 'role', 'is_verified')
      .first();

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireVerified(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  if (!req.user.is_verified) {
    res.status(403).json({
      error: 'Please verify your college email address before accessing this feature.',
      code: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden: You do not have sufficient permissions to perform this action.',
      });
      return;
    }

    next();
  };
}
