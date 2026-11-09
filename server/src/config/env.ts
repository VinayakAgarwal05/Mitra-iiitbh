import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

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
};
