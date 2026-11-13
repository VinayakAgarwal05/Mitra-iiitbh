import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn(
    '⚠️ [SECURITY WARNING]: JWT_SECRET environment variable is not defined in production! Using fallback secret is not recommended for live deployments.'
  );
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'college_connect_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_CLIENT: process.env.DATABASE_CLIENT || (process.env.DATABASE_URL?.startsWith('postgres') ? 'pg' : 'sqlite3'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  SQLITE_FILENAME: process.env.SQLITE_FILENAME || path.resolve(__dirname, '../../data/college_connect.sqlite'),
  WHITELISTED_DOMAINS: (process.env.WHITELISTED_DOMAINS || 'iiitbh.ac.in,college.edu').split(',').map(d => d.trim().toLowerCase()),
  MESSAGE_LIMIT_CAREER: parseInt(process.env.MESSAGE_LIMIT_CAREER || '10', 10),
  MESSAGE_LIMIT_CONNECT: parseInt(process.env.MESSAGE_LIMIT_CONNECT || '10', 10),
  ISSUE_LIMIT_DAILY: parseInt(process.env.ISSUE_LIMIT_DAILY || '2', 10),
  CAREER_ROOM_MEMBERSHIP_LIMIT: parseInt(process.env.CAREER_ROOM_MEMBERSHIP_LIMIT || '2', 10),
  TIMEZONE: process.env.TIMEZONE || 'Asia/Kolkata',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '"IIIT Bhagalpur MITRA" <no-reply@iiitbh.ac.in>',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  GMAIL_WEBHOOK_URL: process.env.GMAIL_WEBHOOK_URL || '',
};
